import { default as OriginalAceEditor } from 'react-ace';

/*
    This is used to mock all the Ace Editor components.
    This specific component is very difficult to test (set value, get value, ...).
*/

type AceEditorProps = React.ComponentProps<typeof OriginalAceEditor>;

const AceEditor = ({ defaultValue, onChange }: AceEditorProps) => {
  return (
    <textarea
      data-testid="mocked-ace-editor"
      value={defaultValue}
      onChange={e => {
        if (onChange) {
          onChange(e.target.value);
        }
      }}
    />
  );
};

export default AceEditor;
