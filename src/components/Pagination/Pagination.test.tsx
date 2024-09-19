import { render, screen } from 'test/testUtils';
import Pagination, { PaginationProps } from './Pagination';

const onPageChangeSpy = jest.fn();

const defaultProps: PaginationProps = {
  pageSize: 100,
  currentPage: 2,
  totalPages: 12,
  className: 'pagination',
  testId: 'pagination',
  onPageChange: onPageChangeSpy,
  onPageSizeChange: jest.fn(),
};

const setup = (props: Partial<PaginationProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Pagination {...combinedProps} />);
};

describe('the Pagination component', () => {
  it('displays the pagination component with the given testId', () => {
    setup();

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('highlights the currently selected page', () => {
    setup();

    expect(screen.getByTestId('pagination-page-1')).not.toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId('pagination-page-2')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId('pagination-page-3')).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('displays the total number of pages', () => {
    setup();

    expect(
      screen.getByTestId('pagination-last')?.querySelector('span'),
    ).toHaveTextContent('12');
  });

  it('displays the page size change combobox', () => {
    setup();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  describe('when the user clicks a different page', () => {
    it('calls the onPageChange function', async () => {
      const { user } = setup();

      await user.click(screen.getByTestId('pagination-page-1'));

      expect(onPageChangeSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('when the hidePageSize attribute is set', () => {
    it('does not displays the page size combobox', () => {
      setup({ hidePageSize: true });

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });
});
