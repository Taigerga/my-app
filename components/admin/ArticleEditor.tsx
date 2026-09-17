"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";

function ToolButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`rounded-md p-1.5 transition ${
        active ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-200/70"
      }`}
    >
      {children}
    </button>
  );
}

/** Editor rich text minimal untuk konten artikel. Output HTML disanitasi di server. */
export function ArticleEditor({ initialHtml = "" }: { initialHtml?: string }) {
  const [html, setHtml] = useState(initialHtml);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-56 max-w-none px-3 py-2 text-sm leading-relaxed text-stone-800 outline-none [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-pine [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-pine [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) {
    return <div className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-400">Memuat editor...</div>;
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-stone-300 bg-stone-50 px-2 py-1.5" role="toolbar" aria-label="Toolbar editor">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Tebal">
          <Bold size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Miring">
          <Italic size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Garis bawah">
          <UnderlineIcon size={16} />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-stone-300" aria-hidden />
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Judul besar">
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Judul kecil">
          <Heading3 size={16} />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-stone-300" aria-hidden />
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Daftar poin">
          <List size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Daftar bernomor">
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Kutipan">
          <Quote size={16} />
        </ToolButton>
        <ToolButton onClick={setLink} active={editor.isActive("link")} label="Tautan">
          <LinkIcon size={16} />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-stone-300" aria-hidden />
        <ToolButton onClick={() => editor.chain().focus().undo().run()} label="Urungkan">
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} label="Ulangi">
          <Redo2 size={16} />
        </ToolButton>
      </div>
      <div className="rounded-b-lg border border-stone-300 bg-white focus-within:border-stone-500">
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name="content" value={html} />
    </div>
  );
}
