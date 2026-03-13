import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Quote, Undo, Redo, Link2, ImageIcon
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btn = (action, isActive, title, children) => (
    <button
      type="button"
      onClick={action}
      title={title}
      className={`p-2 rounded transition-colors ${isActive ? 'bg-primary-100 text-primary-700' : 'hover:bg-slate-100 text-slate-600'}`}
    >
      {children}
    </button>
  );

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt('URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
      {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold', <Bold className="w-4 h-4" />)}
      {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic', <Italic className="w-4 h-4" />)}
      {btn(() => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), 'Strikethrough', <Strikethrough className="w-4 h-4" />)}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2', <Heading2 className="w-4 h-4" />)}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3', <Heading3 className="w-4 h-4" />)}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bullet List', <List className="w-4 h-4" />)}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Ordered List', <ListOrdered className="w-4 h-4" />)}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Quote', <Quote className="w-4 h-4" />)}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(setLink, editor.isActive('link'), 'Add Link', <Link2 className="w-4 h-4" />)}
      {btn(addImage, false, 'Add Image', <ImageIcon className="w-4 h-4" />)}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(() => editor.chain().focus().undo().run(), false, 'Undo', <Undo className="w-4 h-4" />)}
      {btn(() => editor.chain().focus().redo().run(), false, 'Redo', <Redo className="w-4 h-4" />)}
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // Sync external value changes (e.g. when editing existing content)
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  );
};

export default RichTextEditor;
