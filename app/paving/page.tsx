'use client';

import { useState, type FormEvent, type JSX } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import ImageDrop from '@/components/ImageDrop';

type ApiResponse = { image: string; text: string } | { error: string };

const PavingPage = (): JSX.Element => {
  const [yard, setYard] = useState<File | null>(null);
  const [paver, setPaver] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ image: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!yard || !paver) {
      setError('Загрузите оба фото');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('yard', yard);
      fd.append('paver', paver);
      const res = await fetch('/api/paving', { method: 'POST', body: fd });
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
      <h1 className="mt-6 text-3xl font-semibold">Двор с брусчаткой</h1>
      <p className="mt-2 text-neutral-400">ИИ учтёт глубину и перспективу двора и наложит брусчатку на горизонтальные поверхности.</p>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageDrop label="Фото двора" name="yard" onChange={setYard} />
          <ImageDrop label="Фото брусчатки" name="paver" onChange={setPaver} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-medium text-black transition hover:bg-sky-400 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Генерируем...' : 'Сгенерировать визуализацию'}
        </button>
      </form>

      {error && <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}

      {result && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Результат</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.image} alt="Двор с брусчаткой" className="mt-4 w-full rounded-xl border border-neutral-800" />
          {result.text && <p className="mt-4 text-sm text-neutral-400">{result.text}</p>}
        </section>
      )}
    </main>
  );
};

export default PavingPage;
