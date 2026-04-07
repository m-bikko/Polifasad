import { NextResponse } from 'next/server';
import { ai, IMAGE_MODEL, fileToInline, extractImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const POST = async (req: Request): Promise<Response> => {
  try {
    const form = await req.formData();
    const yardFile = form.get('yard');
    const paverFile = form.get('paver');
    if (!(yardFile instanceof File) || !(paverFile instanceof File)) {
      return NextResponse.json({ error: 'Загрузите оба фото' }, { status: 400 });
    }
    const [yard, paver] = await Promise.all([fileToInline(yardFile), fileToInline(paverFile)]);

    const res = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        { inlineData: yard },
        { inlineData: paver },
        { text: 'Сгенерируй фотореалистичное изображение того как двор с первого фото будет выглядеть полностью замощённым брусчаткой со второго фото. Учитывай глубину и перспективу сцены — брусчатка должна корректно ложиться на горизонтальные поверхности (дорожки, площадки, проезды), повторяя рельеф и удаляющиеся в перспективу плоскости. Не меняй здания, растительность, освещение и ракурс камеры. Текстура и масштаб брусчатки должны соответствовать второму фото.' },
      ],
    });

    const out = extractImage(res.candidates?.[0]?.content?.parts);
    if (!out.imageBase64) {
      return NextResponse.json({ error: 'Модель не вернула изображение' }, { status: 502 });
    }

    return NextResponse.json({
      image: `data:${out.mimeType};base64,${out.imageBase64}`,
      text: out.text,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ошибка обработки';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
};
