import { render, within, screen } from 'test/testUtils';
import SubmitButtonGroup, { SubmitButtonGroupProps } from './SubmitButtonGroup';

const onCancelMock = jest.fn();
const onSubmitMock = jest.fn();

const defaultProps: SubmitButtonGroupProps = {
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm',
  onCancel: onCancelMock,
  disabled: false,
  loading: false,
  onSubmit: onSubmitMock,
};

const setup = (props: Partial<SubmitButtonGroupProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<SubmitButtonGroup {...combinedProps} />);
};

describe('The SubmitButtonGroup component', () => {
  afterEach(() => {
    onCancelMock.mockReset();
  });

  describe('the cancel button', () => {
    it('binds the onCancel handler to the cancel button click', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Cancel'));

      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    it('uses the default button style to differentiate this button from the submit button', () => {
      setup();

      expect(screen.getAllByRole('button')[0].textContent).toBe('Cancel');
    });
  });

  describe('disabling the submit button', () => {
    it('enables the submit button by default', () => {
      setup();

      expect(screen.getByText('Confirm').parentElement!).not.toBeDisabled();
    });

    it('disables the submit button if the disabled prop is true', () => {
      setup({ disabled: true });

      expect(screen.getByText('Confirm').parentElement!).toBeDisabled();
    });
  });

  describe('when the button is in a loading state', () => {
    it('put the primary button into the loading state', () => {
      setup({ loading: true });

      expect(
        within(screen.getAllByRole('button')[1]).getByRole('alert'),
      ).toBeInTheDocument();
    });

    it('disables the secondary button', () => {
      setup({ loading: true });

      expect(screen.getAllByRole('button')[0]).toBeDisabled();
    });
  });

  describe('passing custom button labels', () => {
    it('defaults the label of the cancel button to the string `Cancel`', () => {
      setup();

      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('defaults the label of the submit button to the string `Confirm`', () => {
      setup();

      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('sets the label of the cancel button to the value passed in the cancelLabel prop', () => {
      setup({ cancelLabel: 'foo cancel' });

      expect(screen.getByText('foo cancel')).toBeInTheDocument();
    });

    it('sets the label of the submit button to the value passed in the confirmLabel prop', () => {
      setup({ confirmLabel: 'foo confirm' });

      expect(screen.getByText('foo confirm')).toBeInTheDocument();
    });
  });
});
