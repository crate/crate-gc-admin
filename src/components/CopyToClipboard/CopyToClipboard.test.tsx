import { render, screen } from 'test/testUtils';
import CopyToClipboard, { CopyToClipboardProps } from './CopyToClipboard';

const defaultProps: CopyToClipboardProps = {
  textToCopy: 'example-string',
};

const setup = (props: Partial<CopyToClipboardProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(
    <CopyToClipboard {...combinedProps}>
      <span>Click to copy</span>
    </CopyToClipboard>,
  );
};

describe('the CopyToClipboard component', () => {
  it('displays the child contents', () => {
    setup();

    expect(screen.getByText('Click to copy')).toBeInTheDocument();
  });

  it('uses the test-id', () => {
    setup();

    expect(screen.getByTestId('copy-to-clipboard-button')).toBeInTheDocument();
  });

  describe('when the user clicks the button', () => {
    it('copies the text to the clipboard', async () => {
      const { user } = setup();
      const writeTextMock = jest
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue();

      await user.click(screen.getByTestId('copy-to-clipboard-button'));

      expect(writeTextMock).toHaveBeenCalledWith('example-string');
    });

    it('displays a success message', async () => {
      const { user } = setup();

      await user.click(screen.getByTestId('copy-to-clipboard-button'));

      expect(await screen.findByText('Copied')).toBeInTheDocument();
    });

    it('calls the additionalClickHandler callback', async () => {
      const additionalClickHandlerSpy = jest.fn();
      const { user } = setup({ additionalClickHandler: additionalClickHandlerSpy });

      await user.click(screen.getByTestId('copy-to-clipboard-button'));

      expect(await screen.findByText('Copied')).toBeInTheDocument();
      expect(additionalClickHandlerSpy).toHaveBeenCalled();
    });
  });
});
