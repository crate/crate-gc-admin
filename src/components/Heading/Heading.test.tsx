import Heading, { HeadingProps } from './Heading';
import { render, screen } from 'test/testUtils';

const defaultProps: HeadingProps = {
  children: 'the heading value',
  level: Heading.levels.h1,
};

const setup = (props: Partial<HeadingProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Heading {...combinedProps} />);
};

describe('The Heading component', () => {
  it('displays the text passed as children within the header', () => {
    setup();

    expect(screen.getByText('the heading value')).toBeInTheDocument();
  });

  it('displays the text within the heading level passed as level', () => {
    setup({
      level: Heading.levels.h2,
      children: 'this is an H2',
    });

    expect(screen.getByText('this is an H2').nodeName).toBe('H2');
  });

  it('allows a heading level to be displayed with styles of a different heading level', () => {
    setup({
      level: Heading.levels.h2,
      children: 'this is an H2',
      displayAs: 'h3',
    });

    expect(screen.getByText('this is an H2').classList.contains('text-lg')).toBe(
      true,
    );
  });

  it('displays the heading in a bold font weight (700) by default', () => {
    setup({
      level: Heading.levels.h2,
      children: 'this is a black H2',
      light: false,
    });

    expect(
      screen.getByText('this is a black H2').classList.contains('font-bold'),
    ).toBe(true);
  });

  it('supports displaying the heading in a lighter font weight', () => {
    setup({
      level: Heading.levels.h2,
      children: 'this is a light H2',
      light: true,
    });

    expect(
      screen.getByText('this is a light H2').classList.contains('font-normal'),
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
