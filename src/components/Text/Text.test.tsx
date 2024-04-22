import { render, screen } from 'test/testUtils';
import Text, { TextProps } from './Text';

const defaultProps: TextProps = {
  children: 'the Text value',
};

const setup = (props: Partial<TextProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Text {...combinedProps} />);
};

describe('The Text component', () => {
  it('displays the text passed as value', () => {
    setup();

    expect(screen.getByText('the Text value')).toBeInTheDocument();
  });

  it('displays the text as a div element by default', () => {
    setup({
      children: 'this is a div element',
    });

    expect(screen.getByText('this is a div element').nodeName).toBe('DIV');
  });

  it('supports displaying the text as a P element', () => {
    setup({
      displayAs: Text.elements.P,
      children: 'this is a p element',
    });

    expect(screen.getByText('this is a p element').nodeName).toBe('P');
  });

  it('supports displaying the text as a span element', () => {
    setup({
      displayAs: Text.elements.SPAN,
      children: 'this is a span element',
    });

    expect(screen.getByText('this is a span element').nodeName).toBe('SPAN');
  });

  it('supports displaying the text in a lighter font weight', () => {
    setup({
      children: 'this is pale text',
      pale: true,
    });

    expect(
      screen.getByText('this is pale text').classList.contains('text-neutral-500'),
    ).toBe(true);
  });

  it('supports truncating the text', () => {
    setup({
      children: 'this text is truncated',
      truncate: true,
    });

    expect(
      screen.getByText('this text is truncated').classList.contains('truncate'),
    ).toBe(true);
  });

  it('adds any additional classes to the existing display classes', () => {
    setup({
      className: 'foo bar',
      children: 'with custom classes',
    });

    expect(screen.getByText('with custom classes').classList.contains('foo')).toBe(
      true,
    );
    expect(screen.getByText('with custom classes').classList.contains('bar')).toBe(
      true,
    );
  });
});
