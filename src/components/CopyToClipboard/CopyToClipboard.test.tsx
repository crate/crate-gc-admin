import CopyToClipboard, { CopyToClipboardProps } from './CopyToClipboard';
import { render, screen } from 'test/testUtils';

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
      const writeTextMock = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue();

      await user.click(screen.getByTestId('copy-to-clipboard-button'));

      expect(writeTextMock).toHaveBeenCalledWith('example-string');
    });

    it('displays a success message', async () => {
      const { user } = setup();

      await user.click(screen.getByTestId('copy-to-clipboard-button'));

      expect((await screen.findAllByText('Copied')).length).toBeGreaterThan(0);
    });

    it('calls the additionalClickHandler callback', async () => {
      const additionalClickHandlerSpy = vi.fn();
      const { user } = setup({ additionalClickHandler: additionalClickHandlerSpy });

      await user.click(screen.getByTestId('copy-to-clipboard-button'));

      // findAllByText handles the case where the previous test's "Copied"
      // message is still animating out alongside the new one.
      expect((await screen.findAllByText('Copied')).length).toBeGreaterThan(0);
      expect(additionalClickHandlerSpy).toHaveBeenCalled();
    });
  });
});
