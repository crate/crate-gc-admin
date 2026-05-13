import type React from 'react';

/*
    This is used to mock all the Ace Editor components.
    This specific component is very difficult to test (set value, get value, ...).
*/

type SyntaxHighlighterProps = {
  children?: React.ReactNode;
};

const SyntaxHighlighter = ({ children }: SyntaxHighlighterProps) => {
  return <div>{children}</div>;
};

export default SyntaxHighlighter;
