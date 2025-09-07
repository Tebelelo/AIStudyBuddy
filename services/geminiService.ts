
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, ChatMessage } from '../types';
import { withMonitoring } from './monitoringService';

// Per the guidelines, the API key must be sourced from the `process.env.API_KEY`
// environment variable. It is assumed to be pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractTextFromFileFn = async (base64FileData: string, mimeType: string): Promise<string> => {
    try {
        const filePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64FileData,
            },
        };
        const textPart = { text: "Extract all text from this file. If it is a document, preserve formatting like paragraphs and headings as best as possible. If there is no text, return an empty string." };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [filePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error extracting text from file:", error);
        throw new Error("Failed to process the file with Gemini API.");
    }
};


const generateSummaryFn = async (text: string): Promise<string> => {
    const prompt = `Please provide a detailed yet concise summary of the following text. Focus on the key points, main arguments, and important conclusions. Format the output neatly using paragraphs.\n\nText:\n"""\n${text}\n"""`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary with Gemini API.");
    }
};

const generateQuizFn = async (text: string): Promise<QuizQuestion[]> => {
    const prompt = `Based on the following text, create a multiple-choice quiz with 5 questions. Each question should have 4 options, and you must identify the correct answer. The goal is to test comprehension of the key information in the text.\n\nText:\n"""\n${text}\n"""`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: {
                                        type: Type.STRING,
                                        description: "The question text.",
                                    },
                                    options: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.STRING,
                                        },
                                        description: "An array of 4 possible answers.",
                                    },
                                    correctAnswer: {
                                        type: Type.STRING,
                                        description: "The correct answer, which must be one of the options.",
                                    },
                                },
                                required: ["question", "options", "correctAnswer"],
                                // FIX: Add property ordering to ensure a consistent JSON structure.
                                propertyOrdering: ["question", "options", "correctAnswer"]
                            }
                        }
                    },
                     required: ["quiz"]
                },
            },
        });
        const jsonText = response.text;
        const parsed = JSON.parse(jsonText);
        return parsed.quiz;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz with Gemini API.");
    }
};

const chatWithAIFn = async (history: ChatMessage[], newMessage: string, context: string): Promise<string> => {
     try {
        const chatHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        
        chatHistory.push({ role: 'user', parts: [{ text: newMessage }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: chatHistory,
            config: {
                systemInstruction: `You are a helpful study buddy. Your goal is to answer questions and discuss the provided context. Be friendly, encouraging, and clear in your explanations. The context for this conversation is the following text:\n\n"""\n${context}\n"""\n\nBase all your answers on this context. If a question is outside the scope of the context, politely state that you can only answer questions about the provided material.`
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error in chatWithAI:", error);
        throw new Error("Failed to get a chat response from Gemini API.");
    }
};


// Wrap exported functions with monitoring
export const extractTextFromFile = withMonitoring(extractTextFromFileFn, 'extractTextFromFile');
export const generateSummary = withMonitoring(generateSummaryFn, 'generateSummary');
export const generateQuiz = withMonitoring(generateQuizFn, 'generateQuiz');
export const chatWithAI = withMonitoring(chatWithAIFn, 'chatWithAI');
