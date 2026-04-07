import { NextResponse } from 'next/server';
import { ai, IMAGE_MODEL, TEXT_MODEL, fileToInline, extractImage, type InlineImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

type FacadeAnalysis = {
  wallAreaM2: number;
  windowsAreaM2: number;
  netAreaM2: number;
  tilesNeeded: number;
  notes: string;
};

const parseNumber = (v: FormDataEntryValue | null): number => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error('Некорректное число');
  return n;
};

const analyze = async (
  wall: InlineImage,
  tile: InlineImage,
  wallW: number,
  wallH: number,
  tileW: number,
  tileH: number,
): Promise<FacadeAnalysis> => {
  const prompt = `Ты инженер по расчёту фасадов. На первом фото — стена дома (ширина ${wallW} м, высота ${wallH} м). На втором — образец полифасадной плитки (${tileW} м × ${tileH} м).
Определи на фото окна, двери и другие проёмы которые НЕ нужно облицовывать. Оцени их суммарную площадь в м².
Верни СТРОГО JSON без markdown:
{"wallAreaM2": число, "windowsAreaM2": число, "netAreaM2": число, "tilesNeeded": целое, "notes": "краткое пояснение на русском"}
Где:
- wallAreaM2 = ${wallW} * ${wallH}
- windowsAreaM2 = оценка площади всех проёмов
- netAreaM2 = wallAreaM2 - windowsAreaM2
- tilesNeeded = ceil(netAreaM2 / (${tileW} * ${tileH}))`;

  const res = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      { role: 'user', parts: [
        { text: prompt },
        { inlineData: wall },
        { inlineData: tile },
      ] },
    ],
    config: { responseMimeType: 'application/json' },
  });

  const raw = res.text ?? '';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as FacadeAnalysis;
  return parsed;
};

const visualize = async (wall: InlineImage, tile: InlineImage): Promise<{ imageBase64: string; mimeType: string }> => {
  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      { inlineData: wall },
      { inlineData: tile },
      { text: 'Сгенерируй фотореалистичное изображение того как стена дома с первого фото будет выглядеть после облицовки полифасадной плиткой со второго фото. Сохрани окна, двери и архитектурные особенности нетронутыми, плитка наносится только на стены. Сохрани ракурс и перспективу первого фото.' },
    ],
  });
  const out = extractImage(res.candidates?.[0]?.content?.parts);
  if (!out.imageBase64) throw new Error('Модель не вернула изображение');
  return { imageBase64: out.imageBase64, mimeType: out.mimeType };
};

export const POST = async (req: Request): Promise<Response> => {
  try {
    const form = await req.formData();
    const wallFile = form.get('wall');
    const tileFile = form.get('tile');
    if (!(wallFile instanceof File) || !(tileFile instanceof File)) {
      return NextResponse.json({ error: 'Загрузите оба фото' }, { status: 400 });
    }
    const wallW = parseNumber(form.get('wallWidth'));
    const wallH = parseNumber(form.get('wallHeight'));
    const tileW = parseNumber(form.get('tileWidth'));
    const tileH = parseNumber(form.get('tileHeight'));

    const [wall, tile] = await Promise.all([fileToInline(wallFile), fileToInline(tileFile)]);
    const [analysis, image] = await Promise.all([
      analyze(wall, tile, wallW, wallH, tileW, tileH),
      visualize(wall, tile),
    ]);

    return NextResponse.json({
      analysis,
      image: `data:${image.mimeType};base64,${image.imageBase64}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ошибка обработки';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
};
