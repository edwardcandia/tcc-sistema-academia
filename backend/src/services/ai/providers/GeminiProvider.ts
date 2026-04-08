import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider, ChatMessage } from '../IAIProvider';

export class GeminiProvider implements IAIProvider {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY não configurada no .env');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || '');
    }

    async generateResponse(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
        const model = this.genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: systemPrompt 
        });

        // O Gemini SDK exige que o histórico comece com uma mensagem do usuário.
        // Filtramos as mensagens iniciais do assistente se houver.
        const firstUserIndex = messages.findIndex(m => m.role === 'user');
        const validMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : [];

        // A última mensagem do usuário é enviada separadamente via sendMessage,
        // então ela não deve estar no histórico (history).
        const history = validMessages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;
        
        const result = await chat.sendMessage(lastMessage);
        return result.response.text();
    }
}
