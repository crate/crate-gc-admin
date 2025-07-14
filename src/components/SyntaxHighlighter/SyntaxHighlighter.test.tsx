import SyntaxHighlighter, { SyntaxHighlighterProps } from './SyntaxHighlighter';
import { render, screen } from 'test/testUtils';

const defaultProps: SyntaxHighlighterProps = {
  language: 'javascript',
  children: 'Code',
  title: 'my snippet',
  helpText: null,
};

const setup = (props: Partial<SyntaxHighlighterProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(
    <SyntaxHighlighter {...combinedProps}>
      {combinedProps.children}
    </SyntaxHighlighter>,
  );
};

describe('The SyntaxHighlighter component', () => {
  it('formats the passed children as a code snippet', () => {
    setup();

    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('displays a snippet title', () => {
    setup();

    expect(screen.getByText('my snippet')).toBeInTheDocument();
  });

  it('displays a button to copy the code snippet', () => {
    setup();

    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});
