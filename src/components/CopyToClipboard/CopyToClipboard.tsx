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
      onClick={async () => {
        // We very occasionally see a `NotAllowedError` exception when the document is not focused.
        // The try/catch block is a workaround to handle this gracefully, but it happens so infrequently
        // it is not worth the effort required to handle it better.
        try {
          if (!document.hasFocus()) {
            window.focus();
          }
          await navigator.clipboard.writeText(textToCopy);
          showSuccessMessage(successMessage);
          additionalClickHandler?.();
        } catch {
          //
        }
      }}
      type="button"
    >
      {children}
    </button>
  );
}

export default CopyToClipboard;
