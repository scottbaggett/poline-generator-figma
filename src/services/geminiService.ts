import { GoogleGenAI, Type, Schema } from "@google/genai";

const getClient = () => {
    // NOTE: In a real environment, handle missing API key gracefully
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateMagicPalette = async (prompt: string): Promise<{ start: string; end: string } | null> => {
    if (!process.env.API_KEY) {
        console.error("No API KEY found");
        return null;
    }

    try {
        const ai = getClient();
        
        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                startColor: { type: Type.STRING, description: "Hex color code for the start of the gradient, e.g. #FF5500" },
                endColor: { type: Type.STRING, description: "Hex color code for the end of the gradient, e.g. #0055FF" },
                reasoning: { type: Type.STRING, description: "Short explanation of why these colors match the prompt" }
            },
            required: ["startColor", "endColor"]
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate two anchor colors (start and end) for a design palette based on this mood/description: "${prompt}". 
            The colors should be distinct enough to create an interesting gradient.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                systemInstruction: "You are a color expert. Generate hex codes.",
            }
        });

        const text = response.text;
        if (!text) return null;

        const data = JSON.parse(text);
        
        return {
            start: data.startColor,
            end: data.endColor
        };

    } catch (e) {
        console.error("Gemini API Error:", e);
        return null;
    }
};
