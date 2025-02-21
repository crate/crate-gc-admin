import { render, screen } from 'test/testUtils';
import Chip, { ChipProps } from './Chip';
import { COLOR_STYLES_MAP } from './ChipConstants';

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

  it('displays a blue chip by default', () => {
    setup();

    expect(screen.getByText('CHIP_CONTENT')).toHaveClass(
      COLOR_STYLES_MAP[Chip.colors.BLUE],
    );
  });

  describe('when passing the className', () => {
    it('should render with that className', () => {
      setup({
        className: 'bg-pink-500',
      });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass('bg-pink-500');
    });
  });

  describe('Adjusting the chip color', () => {
    it('can display a gray chip', () => {
      setup({ color: Chip.colors.GRAY });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass(
        COLOR_STYLES_MAP[Chip.colors.GRAY],
      );
    });

    it('can display a blue chip', () => {
      setup({ color: Chip.colors.BLUE });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass(
        COLOR_STYLES_MAP[Chip.colors.BLUE],
      );
    });

    it('can display a orange chip', () => {
      setup({ color: Chip.colors.ORANGE });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass(
        COLOR_STYLES_MAP[Chip.colors.ORANGE],
      );
    });

    it('can display a red chip', () => {
      setup({ color: Chip.colors.RED });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass(
        COLOR_STYLES_MAP[Chip.colors.RED],
      );
    });

    it('can display a green chip', () => {
      setup({ color: Chip.colors.GREEN });

      expect(screen.getByText('CHIP_CONTENT')).toHaveClass(
        COLOR_STYLES_MAP[Chip.colors.GREEN],
      );
    });
  });

  describe('Adjusting the chip icon', () => {
    it('can display a spinner icon', () => {
      setup({ icon: Chip.icons.SPINNER });

      expect(screen.getByTestId('chip-spinner-icon')).toBeInTheDocument();
    });
  });
});
