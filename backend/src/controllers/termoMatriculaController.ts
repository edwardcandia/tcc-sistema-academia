// backend/src/controllers/termoMatriculaController.ts
import { Request, Response } from 'express';
import db from '../config/database';
import path from 'path';
import fs from 'fs-extra';
import PDFDocument from 'pdfkit';
import { ApiError } from '../utils/errorHandler';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { TermoMatriculaModelo, AlunoTermoMatricula, Aluno } from '../@types';

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uploadsDir = path.join(__dirname, '../../uploads/termos');
    fs.ensureDirSync(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Generate unique filename to prevent overwriting
    const uniqueFileName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// File filter to restrict uploads to PDFs and images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF, JPG e PNG são permitidos'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// Controller methods
export const getTermoModelos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Tentando buscar modelos de termo');
    // Verificar tabelas existentes
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%termo%' OR table_name LIKE '%aluno%';
    `);
    console.log('Tabelas encontradas:', tables.rows.map((r: any) => r.table_name));
    
    const result = await db.query(
      'SELECT * FROM termo_matricula_modelos ORDER BY ativo DESC, data_criacao DESC'
    );
    console.log('Modelos encontrados:', result.rows.length);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar modelos de termo:', error instanceof Error ? error.message : 'Erro desconhecido');
    console.error('Stack trace:', error instanceof Error ? error.stack : '');
    res.status(500).json({ error: 'Erro ao buscar os modelos de termo de matrícula.' });
  }
};

export const getTermoModeloById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM termo_matricula_modelos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Modelo de termo não encontrado.' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar modelo de termo:', error);
    res.status(500).json({ error: 'Erro ao buscar o modelo de termo.' });
  }
};

export const createTermoModelo = async (req: Request, res: Response): Promise<void> => {
  const { nome, descricao, conteudo } = req.body;
  const usuario_id = req.user?.id;
  
  if (!nome || !conteudo) {
    res.status(400).json({ error: 'Nome e conteúdo são obrigatórios.' });
    return;
  }
  
  try {
    const result = await db.query(
      `INSERT INTO termo_matricula_modelos 
       (nome, descricao, conteudo, criado_por) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nome, descricao, conteudo, usuario_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar modelo de termo:', error);
    res.status(500).json({ error: 'Erro ao criar o modelo de termo.' });
  }
};

export const updateTermoModelo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, descricao, conteudo, ativo } = req.body;
  const usuario_id = req.user?.id;
  
  if (!nome && !descricao && !conteudo && ativo === undefined) {
    res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização.' });
    return;
  }
  
  try {
    // First check if the model exists
    const checkResult = await db.query(
      'SELECT * FROM termo_matricula_modelos WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Modelo de termo não encontrado.' });
      return;
    }
    
    // Build the update query dynamically
    let updateFields: string[] = [];
    let queryParams: any[] = [];
    let paramCounter = 1;
    
    if (nome !== undefined) {
      updateFields.push(`nome = $${paramCounter++}`);
      queryParams.push(nome);
    }
    
    if (descricao !== undefined) {
      updateFields.push(`descricao = $${paramCounter++}`);
      queryParams.push(descricao);
    }
    
    if (conteudo !== undefined) {
      updateFields.push(`conteudo = $${paramCounter++}`);
      queryParams.push(conteudo);
    }
    
    if (ativo !== undefined) {
      updateFields.push(`ativo = $${paramCounter++}`);
      queryParams.push(ativo);
    }
    
    updateFields.push(`atualizado_por = $${paramCounter++}`);
    updateFields.push(`data_atualizacao = CURRENT_TIMESTAMP`);
    queryParams.push(usuario_id);
    
    // Add the ID as the last parameter
    queryParams.push(id);
    
    const query = `
      UPDATE termo_matricula_modelos 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await db.query(query, queryParams);
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar modelo de termo:', error);
    res.status(500).json({ error: 'Erro ao atualizar o modelo de termo.' });
  }
};

export const deleteTermoModelo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    // Check if there are any student terms using this model
    const checkResult = await db.query(
      'SELECT COUNT(*) FROM alunos_termos_matricula WHERE modelo_id = $1',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      res.status(400).json({ 
        error: 'Não é possível excluir um modelo que está sendo usado em termos de alunos.' 
      });
      return;
    }
    
    // Delete the model
    const result = await db.query(
      'DELETE FROM termo_matricula_modelos WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Modelo de termo não encontrado.' });
      return;
    }
    
    res.status(200).json({ 
      message: 'Modelo de termo excluído com sucesso.',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao excluir modelo de termo:', error);
    res.status(500).json({ error: 'Erro ao excluir o modelo de termo.' });
  }
};

export const getTermosAluno = async (req: Request, res: Response): Promise<void> => {
  const { alunoId } = req.params;
  
  try {
    console.log(`Tentando buscar termos para o aluno ID: ${alunoId}`);
    
    // Verificar se a tabela existe
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'alunos_termos_matricula'
      );
    `);
    console.log('Tabela alunos_termos_matricula existe?', checkTable.rows[0].exists);
    
    if (!checkTable.rows[0].exists) {
      throw new Error('A tabela alunos_termos_matricula não existe no banco de dados!');
    }
    
    // Check if student exists
    const alunoResult = await db.query(
      'SELECT * FROM alunos WHERE id = $1',
      [alunoId]
    );
    
    if (alunoResult.rows.length === 0) {
      res.status(404).json({ error: 'Aluno não encontrado.' });
      return;
    }
    
    // Get all terms for the student
    const result = await db.query(
      `SELECT t.*, m.nome as modelo_nome, m.descricao as modelo_descricao
       FROM alunos_termos_matricula t
       LEFT JOIN termo_matricula_modelos m ON t.modelo_id = m.id
       WHERE t.aluno_id = $1
       ORDER BY t.data_upload DESC`,
      [alunoId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar termos do aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar os termos do aluno.' });
  }
};

export const uploadTermoAluno = async (req: Request, res: Response): Promise<void> => {
  const { alunoId } = req.params;
  const { descricao, tipo } = req.body;
  const usuario_id = req.user?.id;
  
  console.log("Upload request received:", { 
    alunoId, 
    descricao, 
    tipo,
    file: req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path
    } : "No file uploaded"
  });
  
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    return;
  }
  
  try {
    // Check if student exists
    const alunoResult = await db.query(
      'SELECT * FROM alunos WHERE id = $1',
      [alunoId]
    );
    
    if (alunoResult.rows.length === 0) {
      // Remove uploaded file if student doesn't exist
      if (req.file && req.file.path) {
        await fs.remove(req.file.path);
      }
      res.status(404).json({ error: 'Aluno não encontrado.' });
      return;
    }
    
    // Store the file info in the database
    const result = await db.query(
      `INSERT INTO alunos_termos_matricula 
       (aluno_id, tipo_documento, observacoes, nome_arquivo, caminho_arquivo, data_upload) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        alunoId, 
        tipo || 'termo_matricula', 
        descricao || 'Termo enviado manualmente', 
        req.file.originalname, 
        req.file.path
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Remove uploaded file on error
    if (req.file && req.file.path) {
      await fs.remove(req.file.path);
    }
    
    console.error('Erro ao fazer upload do termo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do termo.' });
  }
};

export const downloadTermoAluno = async (req: Request, res: Response): Promise<void> => {
  const { alunoId, termoId } = req.params;
  
  try {
    // Get term info
    const result = await db.query(
      `SELECT * FROM alunos_termos_matricula 
       WHERE id = $1 AND aluno_id = $2`,
      [termoId, alunoId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Termo não encontrado.' });
      return;
    }
    
    const termo = result.rows[0] as AlunoTermoMatricula;
    
    // Use arquivo_path if it exists, otherwise use caminho_arquivo
    const filePath = termo.arquivo_path || termo.caminho_arquivo;
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      res.status(404).json({ error: 'Arquivo do termo não encontrado.' });
      return;
    }
    
    // Stream the file to the client
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(termo.arquivo_nome || termo.nome_arquivo)}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erro ao baixar termo:', error);
    res.status(500).json({ error: 'Erro ao baixar o termo.' });
  }
};

export const deleteTermoAluno = async (req: Request, res: Response): Promise<void> => {
  const { alunoId, termoId } = req.params;
  
  try {
    // Get term info first
    const result = await db.query(
      `SELECT * FROM alunos_termos_matricula 
       WHERE id = $1 AND aluno_id = $2`,
      [termoId, alunoId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Termo não encontrado.' });
      return;
    }
    
    const termo = result.rows[0] as AlunoTermoMatricula;
    
    // Delete the record from database
    await db.query(
      'DELETE FROM alunos_termos_matricula WHERE id = $1',
      [termoId]
    );
    
    // Get the file path (use arquivo_path if available, otherwise use caminho_arquivo)
    const filePath = termo.arquivo_path || termo.caminho_arquivo;
    
    // Delete the file if it exists
    if (filePath && await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
    
    res.status(200).json({ 
      message: 'Termo excluído com sucesso.',
      deleted: termo
    });
  } catch (error) {
    console.error('Erro ao excluir termo:', error);
    res.status(500).json({ error: 'Erro ao excluir o termo.' });
  }
};

export const generatePDF = async (req: Request, res: Response): Promise<void> => {
  const { alunoId, modeloId } = req.params;
  const usuario_id = req.user?.id;
  
  try {
    // Get the template
    const modeloResult = await db.query(
      'SELECT * FROM termo_matricula_modelos WHERE id = $1',
      [modeloId]
    );
    
    if (modeloResult.rows.length === 0) {
      res.status(404).json({ error: 'Modelo de termo não encontrado.' });
      return;
    }
    
    const modelo = modeloResult.rows[0] as TermoMatriculaModelo;
    
    // Get student data
    const alunoResult = await db.query(
      'SELECT * FROM alunos WHERE id = $1',
      [alunoId]
    );
    
    if (alunoResult.rows.length === 0) {
      res.status(404).json({ error: 'Aluno não encontrado.' });
      return;
    }
    
    const aluno = alunoResult.rows[0] as Aluno;
    
    // Ensure the uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads/termos');
    await fs.ensureDir(uploadsDir);
    
    // Generate unique filename
    const fileName = `termo_${aluno.id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);
    
    // Add content to the PDF - replace placeholders with student data
    let conteudo = modelo.conteudo
      .replace(/\{NOME_ALUNO\}/g, aluno.nome_completo)
      .replace(/\{CPF_ALUNO\}/g, aluno.cpf || '')
      .replace(/\{EMAIL_ALUNO\}/g, aluno.email || '')
      .replace(/\{TELEFONE_ALUNO\}/g, aluno.telefone || '')
      .replace(/\{ENDERECO_ALUNO\}/g, aluno.endereco || '')
      .replace(/\{DATA_ATUAL\}/g, new Date().toLocaleDateString('pt-BR'))
      .replace(/\{DATA_NASCIMENTO\}/g, aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR') : '');
    
    // Add header
    doc.fontSize(20).text('TERMO DE MATRÍCULA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(modelo.nome, { align: 'center' });
    doc.moveDown(2);
    
    // Add content
    doc.fontSize(12).text(conteudo, { align: 'justify' });
    doc.moveDown(2);
    
    // Add signature area
    doc.moveDown(3);
    doc.fontSize(12).text('Local e data: ______________________, _____ de _______________ de _______', { align: 'center' });
    doc.moveDown(3);
    doc.fontSize(12).text('_________________________________________________', { align: 'center' });
    doc.fontSize(12).text(`${aluno.nome_completo}`, { align: 'center' });
    doc.fontSize(12).text(`CPF: ${aluno.cpf || '_________________________'}`, { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the stream to finish
    await new Promise<void>((resolve) => {
      stream.on('finish', resolve);
    });
    
    // Save the reference in the database
    const result = await db.query(
      `INSERT INTO alunos_termos_matricula 
       (aluno_id, modelo_id, tipo_documento, observacoes, nome_arquivo, caminho_arquivo, tamanho_arquivo, data_upload) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        alunoId,
        modeloId,
        'termo_matricula',
        `Termo gerado a partir do modelo "${modelo.nome}"`,
        fileName,
        filePath,
        Math.floor(Math.random() * 1000) + 1000 // Placeholder for file size
      ]
    );
    
    // Return the ID for download
    res.status(201).json({
      message: 'Termo gerado com sucesso',
      termoId: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao gerar PDF do termo:', error);
    res.status(500).json({ error: 'Erro ao gerar o PDF do termo.' });
  }
};

export default {
  upload,
  getTermoModelos,
  getTermoModeloById,
  createTermoModelo,
  updateTermoModelo,
  deleteTermoModelo,
  getTermosAluno,
  uploadTermoAluno,
  downloadTermoAluno,
  deleteTermoAluno,
  generatePDF
};