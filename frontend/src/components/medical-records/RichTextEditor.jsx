import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const btnStyle = (active) => ({
  padding: '4px 10px',
  marginRight: 4,
  borderRadius: 4,
  border: '1px solid #d1d5db',
  background: active ? '#3b82f6' : '#f9fafb',
  color: active ? '#fff' : '#374151',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
});

function Toolbar({ editor }) {
  if (!editor) return null;
  return (
    <div style={{ display: 'flex', gap: 2, padding: '8px 8px 6px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
      <button style={btnStyle(editor.isActive('bold'))} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}>N</button>
      <button style={{ ...btnStyle(editor.isActive('italic')), fontStyle: 'italic' }} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}>I</button>
      <button style={btnStyle(editor.isActive('heading', { level: 2 }))} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>H2</button>
      <button style={btnStyle(editor.isActive('heading', { level: 3 }))} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}>H3</button>
      <button style={btnStyle(editor.isActive('bulletList'))} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>• Lista</button>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, readOnly = false }) {
  const debounceRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editable: !readOnly,
    onUpdate({ editor }) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange?.(editor.getHTML());
      }, 2000);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Sincroniza valor externo apenas na montagem inicial
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value);
    }
  }, [editor]);

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: 6, background: '#fff' }}>
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        style={{ minHeight: 280, padding: '12px 14px', outline: 'none', fontSize: 14, lineHeight: 1.6 }}
      />
    </div>
  );
}
