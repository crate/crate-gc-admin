import { PropsWithChildren } from 'react';
import QueryStackTraceModal, {
  QueryStackTraceModalProps,
} from './QueryStackTraceModal';
import { render, screen } from 'test/testUtils';

const onCloseSpy = jest.fn();

const defaultProps: QueryStackTraceModalProps = {
  modalTitle: 'Modal Title',
  visible: true,
  onClose: onCloseSpy,
  query: 'SELECT 1;',
  queryError: 'ERROR_DETAIL',
  timestamp: '2024-01-19T07:58:00.033000+00:00',
};

const setup = (
  props: Partial<PropsWithChildren<QueryStackTraceModalProps>> = {},
) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<QueryStackTraceModal {...combinedProps} />);
};

describe('The "QueryStackTraceModal" component', () => {
  afterEach(() => {
    onCloseSpy.mockReset();
  });

  it('displays the provided title correctly', () => {
    setup();

    expect(screen.getByText(defaultProps.modalTitle)).toBeInTheDocument();
  });

  it('displays the provided content correctly', () => {
    setup();

    expect(screen.getByText(defaultProps.query)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.queryError)).toBeInTheDocument();
  });

  it('closes if the ok button is clicked', async () => {
    const { user } = setup();

    await user.click(screen.getByText('OK'));

    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('closes if the "x" button is clicked', async () => {
    const { user } = setup();

    await user.click(
      screen
        .getAllByRole('button')
        .find(el => el.classList.contains('ant-modal-close'))!,
    );

    expect(onCloseSpy).toHaveBeenCalled();
  });
});
