import { render, screen } from '../../../test/testUtils';
import Code, { CodeProps } from './Code';

const defaultProps: CodeProps = {
  children: 'example_code',
};

const setup = (props: Partial<CodeProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Code {...combinedProps} />);
};

describe('The Code component', () => {
  it('displays the text passed as value', () => {
    setup();

    expect(screen.getByText('example_code')).toBeInTheDocument();
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
