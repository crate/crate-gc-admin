import Button from '../Button';

export type SubmitButtonGroupProps = {
  cancelLabel?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  disabled?: boolean;
  form?: string;
  loading?: boolean;
  onCancel: () => void;
  onSubmit?: () => void;
  warn?: boolean;
};

function SubmitButtonGroup({
  cancelLabel = null,
  confirmLabel = null,
  onCancel,
  warn = false,
  disabled = false,
  loading = false,
  onSubmit,
  form,
}: SubmitButtonGroupProps) {
  return (
    <div className="flex justify-end">
      <Button
        className="mr-2"
        disabled={loading}
        onClick={onCancel}
        type={Button.types.BUTTON}
        kind={Button.kinds.SECONDARY}
      >
        {cancelLabel || 'Cancel'}
      </Button>
      <Button
        disabled={disabled}
        form={form}
        loading={loading}
        onClick={onSubmit}
        type={Button.types.SUBMIT}
        warn={warn}
      >
        {confirmLabel || 'Confirm'}
      </Button>
    </div>
  );
}

export default SubmitButtonGroup;
