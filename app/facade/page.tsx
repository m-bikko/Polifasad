'use client';

import { useState, type FormEvent, type JSX } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calculator } from 'lucide-react';
import ImageDrop from '@/components/ImageDrop';

type Analysis = {
  wallAreaM2: number;
  windowsAreaM2: number;
  netAreaM2: number;
  tilesNeeded: number;
  notes: string;
};

type ApiResponse = { analysis: Analysis; image: string } | { error: string };

const FacadePage = (): JSX.Element => {
  const [wall, setWall] = useState<File | null>(null);
  const [tile, setTile] = useState<File | null>(null);
  const [wallWidth, setWallWidth] = useState('10');
  const [wallHeight, setWallHeight] = useState('3');
  const [tileWidth, setTileWidth] = useState('0.5');
  const [tileHeight, setTileHeight] = useState('0.25');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: Analysis; image: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!wall || !tile) {
      setError('Загрузите оба фото');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('wall', wall);
      fd.append('tile', tile);
      fd.append('wallWidth', wallWidth);
      fd.append('wallHeight', wallHeight);
      fd.append('tileWidth', tileWidth);
      fd.append('tileHeight', tileHeight);
      const res = await fetch('/api/facade', { method: 'POST', body: fd });
      const data = (await res.json()) as ApiResponse;
      if ('error' in data) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сетевая ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Расчёт облицовки фасада</h1>
      <p className="mt-2 text-neutral-400">ИИ оценит площадь стены, вычтет окна и рассчитает количество плиток.</p>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageDrop label="Фото стены дома" name="wall" onChange={setWall} />
          <ImageDrop label="Фото плитки" name="tile" onChange={setTile} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Ширина стены (м)" value={wallWidth} onChange={setWallWidth} />
          <Field label="Высота стены (м)" value={wallHeight} onChange={setWallHeight} />
          <Field label="Ширина плитки (м)" value={tileWidth} onChange={setTileWidth} />
          <Field label="Высота плитки (м)" value={tileHeight} onChange={setTileHeight} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          {loading ? 'Анализируем...' : 'Рассчитать'}
        </button>
      </form>

      {error && <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}

      {result && (
        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Визуализация</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.image} alt="Облицованный фасад" className="mt-4 w-full rounded-xl border border-neutral-800" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Расчёт</h2>
            <Stat label="Площадь стены" value={`${result.analysis.wallAreaM2.toFixed(2)} м²`} />
            <Stat label="Площадь окон/проёмов" value={`${result.analysis.windowsAreaM2.toFixed(2)} м²`} />
            <Stat label="Чистая площадь облицовки" value={`${result.analysis.netAreaM2.toFixed(2)} м²`} />
            <Stat label="Количество плиток" value={`${result.analysis.tilesNeeded} шт`} highlight />
            {result.analysis.notes && (
              <p className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                {result.analysis.notes}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }): JSX.Element => (
  <label className="block">
    <span className="mb-2 block text-sm text-neutral-400">{label}</span>
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:border-neutral-600"
    />
  </label>
);

const Stat = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }): JSX.Element => (
  <div
    className={`flex items-center justify-between rounded-lg border p-4 ${
      highlight ? 'border-emerald-700 bg-emerald-950/30' : 'border-neutral-800 bg-neutral-950'
    }`}
  >
    <span className="text-sm text-neutral-400">{label}</span>
    <span className={`font-semibold ${highlight ? 'text-emerald-400' : ''}`}>{value}</span>
  </div>
);

export default FacadePage;
