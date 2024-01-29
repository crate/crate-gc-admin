import { render, screen } from '../../../test/testUtils';
import StatusLight, { StatusLightProps } from './StatusLight';
import { AVAILABLE_LIGHT_COLORS, COLOR_STYLES_MAP } from './StatusLightContants';

const defaultProps = {
  color: AVAILABLE_LIGHT_COLORS.GREEN,
  message: 'your entity is available',
  pulse: false,
};
const setup = (props: Partial<StatusLightProps>) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<StatusLight {...combinedProps} />);
};

describe('The StatusLight component', () => {
  describe('Adjusting the lights color', () => {
    it('can display a green light', () => {
      const { container } = setup({ color: StatusLight.colors.GREEN });

      expect(container.querySelector('circle')).toHaveClass(
        COLOR_STYLES_MAP[StatusLight.colors.GREEN],
      );
    });

    it('can display a yellow light', () => {
      const { container } = setup({ color: StatusLight.colors.YELLOW });

      expect(container.querySelector('circle')).toHaveClass(
        COLOR_STYLES_MAP[StatusLight.colors.YELLOW],
      );
    });

    it('can display a red light', () => {
      const { container } = setup({ color: StatusLight.colors.RED });

      expect(container.querySelector('circle')).toHaveClass(
        COLOR_STYLES_MAP[StatusLight.colors.RED],
      );
    });
  });

  describe('When displaying a message', () => {
    it('displays the given message text', () => {
      setup({ message: 'Your entity is ready' });

      expect(screen.getByText('Your entity is ready')).toBeInTheDocument();
    });
  });

  describe('When the pulse prop is true', () => {
    it('animates the opacity of the light', () => {
      const { container } = setup({ color: StatusLight.colors.GREEN, pulse: true });

      expect(container.querySelector('animate')).not.toBeNull();
    });
  });

  describe('When the pulse prop is false', () => {
    it('does not animate the opacity of the light', () => {
      const { container } = setup({ color: StatusLight.colors.GREEN, pulse: false });

      expect(container.querySelector('animate')).toBeNull();
    });
  });
});
