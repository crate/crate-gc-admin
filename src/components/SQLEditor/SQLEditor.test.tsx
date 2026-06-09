import { render, screen, waitFor } from 'test/testUtils';
import SQLEditor, { SQLEditorProps } from './SQLEditor';

const onExecute = jest.fn();
const onChange = jest.fn();
const setShowHistory = jest.fn();
const onViewHistory = jest.fn();
const defaultProps: SQLEditorProps = {
  onExecute,
  onChange,
  results: [],
};

const setup = async (props: Partial<SQLEditorProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  const renderResult = render(<SQLEditor {...combinedProps} />);

  // wait for tables render
  await waitFor(() => {
    expect(screen.getByTestId('tables-tree')).toBeInTheDocument();
  });

  return renderResult;
};

describe('The SQLEditor component', () => {
  it('displays the editor', async () => {
    await setup();

    expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
  });

  describe('the value', () => {
    it('its empty by default', async () => {
      await setup();

      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('');
    });

    it('its initialized with the value prop', async () => {
      await setup({
        value: 'CUSTOM_VALUE',
      });

      expect(screen.getByText('CUSTOM_VALUE')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('CUSTOM_VALUE');
    });

    it('changing the value trigger the onChange', async () => {
      const { user } = await setup();

      await user.type(screen.getByTestId('mocked-ace-editor'), 'CUSTOM_QUERY');

      expect(onChange).toHaveBeenCalled();
    });
  });

  it('displays the title', async () => {
    await setup({
      title: 'CUSTOM_TITLE',
    });

    expect(screen.getByText('CUSTOM_TITLE')).toBeInTheDocument();
  });

  it('displays error message if errorMessage prop is passed ', async () => {
    await setup({
      errorMessage: 'ERROR_MESSAGE',
    });

    expect(screen.getByText('ERROR_MESSAGE')).toBeInTheDocument();
  });

  it('displays red border if aria-invalid prop is passed ', async () => {
    await setup({
      'aria-invalid': 'true',
    });

    expect(screen.getByTestId('ace-editor-wrapper')).toHaveClass('border-red-600');
  });

  describe('the "Execute" button', () => {
    it('is shown by default', async () => {
      await setup();

      expect(screen.getByText('Execute')).toBeInTheDocument();
    });

    it('can be hidden by sedding showRunButton: false', async () => {
      await setup({
        showRunButton: false,
      });

      expect(screen.queryByText('Execute')).not.toBeInTheDocument();
    });

    it('can have a custom text by passing runButtonLabel', async () => {
      await setup({
        runButtonLabel: 'CUSTOM_EXECUTE_TEXT',
      });

      expect(screen.getByText('CUSTOM_EXECUTE_TEXT')).toBeInTheDocument();
    });
  });

  describe('the "History" button', () => {
    it('is hidden by default', async () => {
      await setup();

      expect(screen.queryByText('History')).not.toBeInTheDocument();
    });

    it('is shown if setShowHistory prop is passed', async () => {
      await setup({
        setShowHistory,
      });

      expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('clicking on it triggers setShowHistory', async () => {
      const { user } = await setup({
        setShowHistory,
      });

      await user.click(screen.getByText('History'));

      expect(setShowHistory).toHaveBeenCalledWith(true);
    });

    describe('when an onViewHistory event function is passed', () => {
      it('clicking on it triggers onViewHistory', async () => {
        const { user } = await setup({ setShowHistory, onViewHistory });

        await user.click(screen.getByText('History'));

        expect(onViewHistory).toHaveBeenCalled();
      });
    });
  });

  describe('when localStorageKey is set', () => {
    const LOCAL_STORAGE_VALUE_KEY = 'crate.gc.admin.test.';
    const LOCAL_STORAGE_HISTORY_KEY = 'crate.gc.admin.test-history.';

    const initializeLocalStorage = (value: string, history: string) => {
      localStorage.setItem(LOCAL_STORAGE_VALUE_KEY, value);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, history);
    };

    it('uses the saved value in local storage by default', async () => {
      initializeLocalStorage('CUSTOM_QUERY', '[]');
      await setup({
        localStorageKey: 'test',
      });

      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('CUSTOM_QUERY');
    });
  });
});
