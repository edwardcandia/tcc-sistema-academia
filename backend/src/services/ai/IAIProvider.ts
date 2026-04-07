export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface IAIProvider {
    generateResponse(systemPrompt: string, messages: ChatMessage[]): Promise<string>;
}
