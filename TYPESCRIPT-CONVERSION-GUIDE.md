# TypeScript Conversion Guide for tcc-sistema-academia

## Completed Tasks

1. **Initial Setup**:
   - Added TypeScript configurations for both backend and frontend
   - Updated `package.json` files with TypeScript dependencies
   - Created comprehensive type definitions in `@types/index.ts`

2. **Converted Backend Files**:
   - `src/controllers/termoMatriculaController.ts`
   - `src/controllers/authController.ts`
   - `src/middleware/verifyToken.ts`
   - `src/middleware/authorizeRole.ts`
   - `src/middleware/auth.ts`
   - `src/routes/termoMatriculaRoutes.ts`
   - `src/routes/authRoutes.ts`
   - `src/config/database.ts`
   - `src/utils/errorHandler.ts`
   - `src/utils/swagger.ts`
   - `index.ts` (main entry point)

3. **Added Type Definitions**:
   - User, Aluno, Plano, Exercicio and other models
   - DecodedToken for authentication
   - Extended Express Request interface for user information
   - ApiError interface for error handling

## Remaining Tasks

1. **Convert Backend Controllers**:
   - Remaining controllers in `src/controllers/`
   - Follow the patterns established in `termoMatriculaController.ts` and `authController.ts`

2. **Convert Backend Routes**:
   - Remaining routes in `src/routes/`
   - Follow the patterns established in `termoMatriculaRoutes.ts` and `authRoutes.ts`

3. **Convert Frontend Components**:
   - Update JSX files to TSX
   - Add type definitions for props
   - Update imports and exports

## Conversion Process

For each JavaScript file you want to convert to TypeScript:

1. **Rename the file extension**: Change `.js` to `.ts` (or `.jsx` to `.tsx` for React components)

2. **Update imports and exports**: 
   - Replace `require()` with `import` statements
   - Replace `module.exports` with `export default` or named exports

3. **Add type annotations**:
   - Add types to function parameters and return values
   - Use interfaces for complex object structures
   - Import types from `@types/index.ts` or other type files

4. **Fix TypeScript errors**:
   - Address any type errors that appear
   - Add proper type assertions where needed
   - Use proper TypeScript syntax for class definitions, interfaces, etc.

## Example Conversion

**JavaScript**:
```javascript
const db = require('../config/database');
const getAlunos = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM alunos');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};
module.exports = { getAlunos };
```

**TypeScript**:
```typescript
import { Request, Response } from 'express';
import db from '../config/database';
import { Aluno } from '../@types';

export const getAlunos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query('SELECT * FROM alunos');
    res.json(result.rows as Aluno[]);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};

export default { getAlunos };
```

## Running the Server

After conversion, you can run the server with:
```bash
npm run dev
```

Or build and run in production mode:
```bash
npm run build
npm start
```

## Testing

Make sure to test each converted component thoroughly to ensure that functionality is maintained after the TypeScript conversion.

## Notes

- Be careful with date handling between frontend and backend
- Remember to update imports in other files that reference the converted files
- Consider using `as` type assertions when TypeScript cannot infer types automatically
- Use optional properties (?) for fields that may be undefined
- For complex type assertions, consider creating helper functions