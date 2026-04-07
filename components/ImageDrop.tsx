'use client';

import { useRef, useState, type ChangeEvent, type JSX } from 'react';
import { Upload, X } from 'lucide-react';

type Props = {
  label: string;
  name: string;
  onChange: (file: File | null) => void;
};

const ImageDrop = ({ label, name, onChange }: Props): JSX.Element => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const clear = (): void => {
    onChange(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="relative">
      <label className="block text-sm text-neutral-400 mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-700 bg-neutral-950 transition hover:border-neutral-500"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Нажмите для загрузки</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          className="hidden"
          onChange={handle}
        />
      </div>
      {preview && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-9 rounded-full bg-black/70 p-1 text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ImageDrop;
