"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Heading as HeadingIcon, List, ListOrdered, Quote, Link as LinkIcon, Undo, Redo } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-md text-sm transition-colors ${
        active ? "bg-[#e00327] text-white" : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-300 bg-neutral-50 p-1.5">
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <HeadingIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Link"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const href = window.prompt("Link URL", "https://");
          if (href) editor.chain().focus().setLink({ href }).run();
        }}
      >
        <LinkIcon className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-neutral-300" />

      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: false, protocols: ["http", "https", "mailto"] }),
    ],
    content: value,
    // Tiptap renders on the client only; SSR would mismatch the hydrated DOM.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[260px] max-h-[380px] overflow-y-auto p-3 text-sm text-neutral-900 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-md border border-neutral-300 bg-white focus-within:border-[#e00327] focus-within:ring-2 focus-within:ring-[#e00327]/30">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
