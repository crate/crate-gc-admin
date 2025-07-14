import Checkbox, { CheckboxProps } from './Checkbox';
import { render, screen } from 'test/testUtils';

const onClickSpy = jest.fn();

const defaultProps: Omit<CheckboxProps, 'ref'> = {
  onChange: onClickSpy,
  checked: false,
};

const setup = (props: Partial<Omit<CheckboxProps, 'ref'>> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Checkbox {...combinedProps} />);
};

describe('The Checkbox component', () => {
  afterEach(() => {
    onClickSpy.mockClear();
  });

  describe('when clicking the checkbox', () => {
    it('invokes the given click handler', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('checkbox'));

      expect(onClickSpy).toHaveBeenCalled();
    });
  });

  describe('when the checkbox is disabled', () => {
    it('does not invoke the given click handler when the checkbox is clicked', async () => {
      const { user } = setup({
        disabled: true,
      });

      await user.click(screen.getByRole('checkbox'));

      expect(onClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('when the checkbox is indeterminate', () => {
    it('should render the custom indeterminate tick', async () => {
      setup({
        indeterminate: true,
      });

      expect(screen.getByTestId('check-intederminate')).not.toHaveClass('opacity-0');
    });
  });
});
