import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API ?? process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API env variable is not set');
}

export const ai = new GoogleGenAI({ apiKey });

export const TEXT_MODEL = 'gemini-2.5-flash';
export const IMAGE_MODEL = 'gemini-2.5-flash-image';

export type InlineImage = { mimeType: string; data: string };

export const fileToInline = async (file: File): Promise<InlineImage> => {
  const buf = Buffer.from(await file.arrayBuffer());
  return { mimeType: file.type || 'image/jpeg', data: buf.toString('base64') };
};

export type ImageGenResult = { imageBase64: string | null; mimeType: string; text: string };

export const extractImage = (
  parts: Array<{ text?: string; inlineData?: { data?: string; mimeType?: string } }> | undefined,
): ImageGenResult => {
  let imageBase64: string | null = null;
  let mimeType = 'image/png';
  let text = '';
  for (const part of parts ?? []) {
    if (part.inlineData?.data) {
      imageBase64 = part.inlineData.data;
      mimeType = part.inlineData.mimeType ?? 'image/png';
    } else if (part.text) {
      text += part.text;
    }
  }
  return { imageBase64, mimeType, text };
};
