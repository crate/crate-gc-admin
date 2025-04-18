import { PropsWithChildren } from 'react';
import useMessage from 'hooks/useMessage';

export type CopyToClipboardProps = {
  successMessage?: string;
  textToCopy: string;
  testId?: string;
  onClick?: () => void;
};

function CopyToClipboard({
  children,
  successMessage = 'Copied',
  textToCopy,
  testId = 'copy-to-clipboard-button',
  onClick,
}: PropsWithChildren<CopyToClipboardProps>) {
  const { showSuccessMessage } = useMessage();

  return (
    <button
      data-testid={testId}
      onClick={() => {
        navigator.clipboard.writeText(textToCopy);
        showSuccessMessage(successMessage);

        if (onClick) {
          onClick();
        }
      }}
      type="button"
    >
      {children}
    </button>
  );
}

export default CopyToClipboard;
