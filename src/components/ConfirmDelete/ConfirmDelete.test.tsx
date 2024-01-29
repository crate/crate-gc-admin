import ConfirmDelete, { ConfirmDeleteProps } from './ConfirmDelete';
import { render, waitFor, screen } from '../../../test/testUtils';

const defaultProps: ConfirmDeleteProps = {
  confirmText: 'confirmText',
  prompt: 'A custom prompt',
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Delete Project',
  visible: true,
  disclaimer: 'Disclaimer',
};

const setup = (props: Partial<ConfirmDeleteProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(
    <ConfirmDelete {...combinedProps}>
      <div data-testid="child-nodes">the children</div>
    </ConfirmDelete>,
  );
};

describe('The ConfirmDelete component', () => {
  afterEach(() => {
    (defaultProps.onCancel as jest.Mock).mockClear();
    (defaultProps.onConfirm as jest.Mock).mockClear();
  });

  it('displays the provided title correctly', () => {
    setup();

    expect(screen.getByText('Delete Project')).toBeInTheDocument();
  });

  it('displays the built-in disclaimer message by default', () => {
    setup();

    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
  });

  it('displays the provided prompt correctly', () => {
    setup();

    expect(screen.getByText('A custom prompt')).toBeInTheDocument();
  });

  it('displays a custom disclaimer message if it is given', () => {
    setup({
      disclaimer: 'if you do this there is no going back',
    });

    expect(
      screen.getByText('if you do this there is no going back'),
    ).toBeInTheDocument();
  });

  it('displays a the child nodes if they are given', () => {
    setup();

    expect(screen.getByTestId('child-nodes')).toBeInTheDocument();
  });

  it('contains a disabled button to confirm as long as the confirm text is not entered', async () => {
    const { user } = setup();

    expect(screen.getByText('Confirm').parentElement).toBeDisabled();

    await user.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(0);
    });
  });

  it('confirms if the confirm text has been entered and the confirm button clicked', async () => {
    const { user } = setup();

    await user.type(screen.getByRole('textbox'), 'confirmText');

    await user.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('closes if the cancel button is clicked', async () => {
    const { user } = setup();

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
