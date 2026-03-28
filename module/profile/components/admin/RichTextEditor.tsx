// module/profile/components/admin/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Highlighter,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
  Type,
  Palette,
  Eye,
  Code2,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

// ─── Toolbar Button ─────────────────────────────────
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? "bg-gray-900 text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Toolbar Divider ────────────────────────────────
function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

// ─── Toolbar ────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:", "https://");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const colors = [
    "#000000",
    "#374151",
    "#DC2626",
    "#EA580C",
    "#CA8A04",
    "#16A34A",
    "#0891B2",
    "#2563EB",
    "#7C3AED",
    "#DB2777",
  ];

  return (
    <div className="border-b border-gray-200 bg-gray-50/50 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={14} />
      </ToolbarButton>

      <Divider />

      {/* Text Style */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph")}
        title="Paragraph"
      >
        <Type size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </ToolbarButton>

      <Divider />

      {/* Format */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Highlight"
      >
        <Highlighter size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline Code"
      >
        <Code size={14} />
      </ToolbarButton>

      {/* Text Color */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Text Color"
        >
          <Palette size={14} />
        </ToolbarButton>
        {showColorPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowColorPicker(false)}
            />
            <div className="absolute left-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 flex gap-1 flex-wrap w-[140px]">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 flex items-center justify-center text-[8px] text-gray-400"
                title="Remove color"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={14} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered size={14} />
      </ToolbarButton>

      <Divider />

      {/* Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Quote"
      >
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code2 size={14} />
      </ToolbarButton>

      <Divider />

      {/* Link & Image */}
      <ToolbarButton
        onClick={addLink}
        isActive={editor.isActive("link")}
        title="Add Link"
      >
        <LinkIcon size={14} />
      </ToolbarButton>
      {editor.isActive("link") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove Link"
        >
          <Unlink size={14} />
        </ToolbarButton>
      )}
      <ToolbarButton onClick={addImage} title="Add Image">
        <ImageIcon size={14} />
      </ToolbarButton>
    </div>
  );
}

// ─── Main Editor ────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
}: Props) {
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 px-1 rounded",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4",
        },
      }),
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none px-4 py-3 min-h-[200px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setSourceCode(html);
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setSourceCode(value);
    }
  }, [value, editor]);

  const handleSourceChange = (newSource: string) => {
    setSourceCode(newSource);
    onChange(newSource);
    if (editor) {
      editor.commands.setContent(newSource);
    }
  };

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-200 animate-pulse" />
        <div className="h-[200px] bg-white animate-pulse" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 transition-all">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50">
        <div className="flex-1 overflow-x-auto">
          <Toolbar editor={editor} />
        </div>

        {/* Source Toggle */}
        <div className="flex-shrink-0 px-2 border-l border-gray-200">
          <ToolbarButton
            onClick={() => {
              if (!showSource) {
                setSourceCode(editor.getHTML());
              }
              setShowSource(!showSource);
            }}
            isActive={showSource}
            title={showSource ? "Visual Editor" : "HTML Source"}
          >
            {showSource ? <Eye size={14} /> : <Code2 size={14} />}
          </ToolbarButton>
        </div>
      </div>

      {/* Editor / Source */}
      {showSource ? (
        <textarea
          value={sourceCode}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="w-full min-h-[200px] px-4 py-3 font-mono text-xs text-gray-700 bg-gray-50 focus:outline-none resize-y"
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 bg-gray-50/30">
        <span className="text-[10px] text-gray-400">
          {editor.storage.characterCount?.characters?.() ??
            editor.getText().length}{" "}
          characters
        </span>
        <span className="text-[10px] text-gray-400">
          {showSource ? "HTML Source" : "Visual Editor"}
        </span>
      </div>
    </div>
  );
}
