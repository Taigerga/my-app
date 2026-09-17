"use client";

import { useActionState } from "react";
import { createInquiryAction } from "@/lib/actions/inquiry";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-pine focus:ring-2 focus:ring-pine/25";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-red-700">
      {messages[0]}
    </p>
  );
}

export function InquiryForm({
  products,
  defaultProductId,
  whatsapp,
}: {
  products: { id: string; name: string }[];
  defaultProductId?: string;
  whatsapp?: string | null;
}) {
  const [state, action, pending] = useActionState(createInquiryAction, undefined);

  if (state?.ok) {
    const waLink = whatsapp
      ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Halo, saya baru mengirim inquiry via website.")}`
      : undefined;
    return (
      <div className="rounded-2xl border border-pine/30 bg-moss p-6 text-center" role="status">
        <h3 className="font-display text-xl font-semibold text-pine-deep">Inquiry terkirim</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
          Terima kasih. Tim kami akan menghubungi Anda maksimal 1×24 jam pada jam operasional.
        </p>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pine-deep"
          >
            Lanjut via WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  const fe = !state || state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      {defaultProductId ? <input type="hidden" name="productId" value={defaultProductId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-name" className="mb-1 block text-sm font-medium text-stone-700">
            Nama
          </label>
          <input id="inq-name" name="name" required minLength={2} autoComplete="name" className={inputCls} />
          <FieldError messages={fe?.name} />
        </div>
        <div>
          <label htmlFor="inq-wa" className="mb-1 block text-sm font-medium text-stone-700">
            Nomor WhatsApp
          </label>
          <input id="inq-wa" name="whatsapp" required inputMode="tel" autoComplete="tel" className={inputCls} />
          <FieldError messages={fe?.whatsapp} />
        </div>
      </div>
      <div>
        <label htmlFor="inq-email" className="mb-1 block text-sm font-medium text-stone-700">
          Email
        </label>
        <input id="inq-email" name="email" type="email" required autoComplete="email" className={inputCls} />
        <FieldError messages={fe?.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {!defaultProductId ? (
          <div>
            <label htmlFor="inq-product" className="mb-1 block text-sm font-medium text-stone-700">
              Produk (opsional)
            </label>
            <select id="inq-product" name="productId" defaultValue="" className={inputCls}>
              <option value="">Pertanyaan umum</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="inq-qty" className="mb-1 block text-sm font-medium text-stone-700">
            Jumlah
          </label>
          <input id="inq-qty" name="quantity" type="number" min={1} defaultValue={1} required className={inputCls} />
          <FieldError messages={fe?.quantity} />
        </div>
      </div>
      <div>
        <label htmlFor="inq-msg" className="mb-1 block text-sm font-medium text-stone-700">
          Pesan
        </label>
        <textarea id="inq-msg" name="message" required minLength={5} rows={4} className={inputCls} />
        <FieldError messages={fe?.message} />
      </div>
      {state && !state.ok ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-pine px-4 py-3 text-sm font-medium text-white transition hover:bg-pine-deep active:translate-y-[1px] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Mengirim..." : "Kirim Inquiry"}
      </button>
    </form>
  );
}
