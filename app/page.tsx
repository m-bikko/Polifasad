import Link from 'next/link';
import type { JSX } from 'react';
import { Calculator, Image as ImageIcon, ArrowRight } from 'lucide-react';

const Home = (): JSX.Element => (
  <main className="mx-auto max-w-5xl px-6 py-20">
    <header className="mb-16">
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Полифасад ИИ</h1>
      <p className="mt-4 max-w-2xl text-neutral-400">
        Два инструмента на базе Gemini: расчёт облицовки фасада и визуализация двора с брусчаткой.
      </p>
    </header>

    <div className="grid gap-6 md:grid-cols-2">
      <Link
        href="/facade"
        className="group rounded-2xl border border-neutral-800 bg-neutral-950 p-8 transition hover:border-neutral-600"
      >
        <Calculator className="h-8 w-8 text-emerald-400" />
        <h2 className="mt-6 text-2xl font-semibold">Расчёт облицовки</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Загрузите фото стены и плитки, укажите размеры — получите площадь, количество и визуализацию.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-400">
          Начать <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </Link>

      <Link
        href="/paving"
        className="group rounded-2xl border border-neutral-800 bg-neutral-950 p-8 transition hover:border-neutral-600"
      >
        <ImageIcon className="h-8 w-8 text-sky-400" />
        <h2 className="mt-6 text-2xl font-semibold">Двор с брусчаткой</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Загрузите фото двора и образец брусчатки — получите визуализацию готового результата.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-sky-400">
          Начать <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  </main>
);

export default Home;
