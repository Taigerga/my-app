"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

type PickedFile = { name: string; size: number };

/**
 * Input file bergaya dropzone untuk form admin (Server Action).
 * File tetap dikirim via FormData native — komponen ini hanya UI + validasi awal.
 * Validasi final tetap di server (tipe via magic bytes, maks 2MB).
 */
export function DropzoneInput({
  id,
  name,
  label,
  accept = "image/jpeg,image/png,image/webp",
  multiple = false,
  required = false,
  maxFiles = 8,
  maxSizeMB = 2,
  hint,
}: {
  id: string;
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const allowed = accept.split(",").map((s) => s.trim().toLowerCase());

  function validate(list: File[]): string | null {
    if (multiple && list.length > maxFiles) return `Maksimal ${maxFiles} file.`;
    for (const f of list) {
      if (!allowed.includes(f.type.toLowerCase())) return `Tipe file tidak didukung: ${f.name}. Gunakan JPG, PNG, atau WebP.`;
      if (f.size > maxSizeMB * 1024 * 1024) return `${f.name} melebihi ${maxSizeMB}MB.`;
      if (f.size === 0) return `${f.name} kosong/rusak.`;
    }
    return null;
  }

  function apply(list: File[]) {
    const problem = validate(list);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setFiles(list.map((f) => ({ name: f.name, size: f.size })));
  }

  function onInputChange() {
    const input = inputRef.current;
    if (!input?.files) return;
    apply(Array.from(input.files));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    const dropped = Array.from(e.dataTransfer.files);
    const list = multiple ? dropped : dropped.slice(0, 1);
    for (const f of list) dt.items.add(f);
    input.files = dt.files;
    apply(list);
  }

  function removeAt(index: number) {
    const input = inputRef.current;
    if (!input?.files) return;
    const dt = new DataTransfer();
    const remaining = Array.from(input.files).filter((_, i) => i !== index);
    for (const f of remaining) dt.items.add(f);
    input.files = dt.files;
    setError(null);
    setFiles(remaining.map((f) => ({ name: f.name, size: f.size })));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div>
      {label ? <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span> : null}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required && files.length === 0}
        aria-label={label}
        onChange={onInputChange}
        className="sr-only"
      />
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging ? "border-pine bg-moss" : "border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100"
        }`}
      >
        <span className={`flex h-11 w-11 items-center justify-center rounded-full ${dragging ? "bg-pine text-white" : "bg-white text-stone-500 border border-stone-200"}`}>
          <ImagePlus size={20} aria-hidden />
        </span>
        <span className="text-sm font-medium text-stone-700">
          {dragging ? "Lepaskan foto di sini" : "Klik atau seret foto ke sini"}
        </span>
        <span className="text-xs text-stone-500">
          {hint ?? `JPG, PNG, WebP · maks ${maxSizeMB}MB/file${multiple ? ` · maks ${maxFiles} file` : ""}`}
        </span>
      </label>
      {files.length > 0 ? (
        <ul className="mt-2 space-y-1" aria-label="File terpilih">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-sm">
              <span className="min-w-0 truncate text-stone-700">
                {f.name} <span className="text-stone-400">({formatSize(f.size)})</span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Hapus ${f.name}`}
                className="rounded-md p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <X size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
