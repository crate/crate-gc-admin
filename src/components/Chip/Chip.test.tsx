import { render, screen } from 'test/testUtils';
import Chip, { ChipProps } from './Chip';

const defaultProps: ChipProps = {
  children: 'CHIP_CONTENT',
};

const setup = (props: Partial<ChipProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Chip {...combinedProps} />);
};

describe('The Chip component', () => {
  it('should render the children prop', () => {
    setup();

    expect(screen.getByText('CHIP_CONTENT')).toBeInTheDocument();
  });

  describe('when passing the className', () => {
    it('should render with that className', () => {
      setup({
        className: 'bg-pink-500',
      });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass('bg-pink-500');
    });
  });
});
