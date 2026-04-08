import { IAIProvider } from './IAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';

export class AIFactory {
    static getProvider(): IAIProvider {
        const provider = process.env.AI_PROVIDER || 'gemini';
        
        switch (provider.toLowerCase()) {
            case 'gemini':
                return new GeminiProvider();
            // Implementações futuras:
            // case 'openai': return new OpenAIProvider();
            default:
                return new GeminiProvider();
        }
    }
}
