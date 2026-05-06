// TODO: instalar e integrar @tiptap/react como editor de texto rico
// TODO: implementar salvamento automático com debounce

export default function RichTextEditor({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={15}
      style={{ width: '100%', fontFamily: 'inherit' }}
      placeholder="Evolução clínica..."
    />
  );
}
