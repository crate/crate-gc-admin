import { PropsWithChildren } from 'react';
import useMessage from 'hooks/useMessage';

export type CopyToClipboardProps = {
  successMessage?: string;
  textToCopy: string;
  testId?: string;
  additionalClickHandler?: () => void;
};

function CopyToClipboard({
  children,
  successMessage = 'Copied',
  textToCopy,
  testId = 'copy-to-clipboard-button',
  additionalClickHandler,
}: PropsWithChildren<CopyToClipboardProps>) {
  const { showSuccessMessage } = useMessage();

  return (
    <button
      data-testid={testId}
      onClick={() => {
        navigator.clipboard.writeText(textToCopy);
        showSuccessMessage(successMessage);

        if (additionalClickHandler) {
          additionalClickHandler();
        }
      }}
      type="button"
    >
      {children}
    </button>
  );
}

export default CopyToClipboard;
