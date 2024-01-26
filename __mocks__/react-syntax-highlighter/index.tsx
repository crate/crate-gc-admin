import { default as OriginalReactSyntaxHighlighter } from 'react-syntax-highlighter';

/*
    This is used to mock all the Ace Editor components.
    This specific component is very difficult to test (set value, get value, ...).
*/

type SyntaxHighlighterProps = React.ComponentProps<
  typeof OriginalReactSyntaxHighlighter
>;

const SyntaxHighlighter = ({ children }: SyntaxHighlighterProps) => {
  return <div>{children}</div>;
};

export default SyntaxHighlighter;
