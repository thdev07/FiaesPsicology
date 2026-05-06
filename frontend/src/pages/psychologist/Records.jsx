// TODO: editor de prontuário com RichTextEditor e salvamento automático
import RichTextEditor from '../../components/medical-records/RichTextEditor';

export default function Records() {
  return (
    <div>
      <h1>Prontuário</h1>
      <RichTextEditor value="" onChange={() => {}} />
    </div>
  );
}
