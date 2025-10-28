import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMode, GroundingSource } from "../types";

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
        webkitAudioContext: typeof AudioContext
    }
}

const getAiClient = () => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

let chat: Chat | null = null;

const getSystemInstruction = (mode: ChatMode): string => {
    switch (mode) {
        case 'lightning':
            return 'You are Lightning, a super-fast and efficient AI. Your responses must be concise, direct, and to the point. Prioritize speed and brevity above all else.';
        case 'deep_thinking':
            return 'You are a deep thinking AI analyst. Your purpose is to provide thorough, well-reasoned, and structured answers. Break down complex topics, consider multiple perspectives, and cite evidence where possible. Your tone is academic and meticulous.';
        case 'study_buddy':
            return 'You are Study Buddy, a friendly and patient AI tutor. Your goal is to help students learn and understand concepts. Explain things clearly, use analogies, and ask questions to check for understanding. Be encouraging and supportive.';
        case 'radzz':
        default:
            return 'You are RADZZ AI, a professional and helpful AI assistant. Your responses must be accurate, clear, and well-formatted. Maintain a formal yet approachable tone.';
    }
};

export const startChat = (mode: ChatMode) => {
    const ai = getAiClient();
    const systemInstruction = getSystemInstruction(mode);
    const model = mode === 'lightning' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const config: any = { systemInstruction };
    if (mode === 'deep_thinking') {
        config.thinkingConfig = { thinkingBudget: 8192 };
    }

    chat = ai.chats.create({
        model: model,
        config: config,
    });
};

export const sendMessageStream = async (message: string) => {
    if (!chat) {
        throw new Error("Chat not initialized. Please start a chat first.");
    }
    try {
        const responseStream = await chat.sendMessageStream({ message });
        return responseStream;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const sendMessageWithGoogleSearch = async (message: string): Promise<{ text: string; sources: GroundingSource[] }> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: message,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        const sources: GroundingSource[] = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri && web.title)
            .map((web: any) => ({ uri: web.uri, title: web.title })) ?? [];
            
        return { text, sources };
    } catch (error) {
        console.error("Error with Google Search grounding:", error);
        throw error;
    }
};