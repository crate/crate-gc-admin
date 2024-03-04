import { render, screen } from 'test/testUtils';
import { DEFAULT_ELEMENTS_PER_PAGE, DataTable, DataTableProps } from './DataTable';
import { SampleData, colDef, generateData } from './test/dataTableTestUtils';

const data = generateData();
const columns = colDef;

const defaultProps: DataTableProps<SampleData, unknown> = {
  data,
  columns,
};

const setup = (props: Partial<DataTableProps<SampleData, unknown>> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<DataTable {...combinedProps} />);
};

// Utility function to check that the whole element is in the table
const checkElementInTable = (el: SampleData) => {
  expect(screen.getByText(el.name)).toBeInTheDocument();
};

const getNumberOfRows = (container: HTMLElement) => {
  const noResults = screen.queryByText(/No results/);
  if (noResults) {
    return 0;
  }

  return container.getElementsByTagName('tbody')[0].getElementsByTagName('tr')
    .length;
};

describe('The DataTable component', () => {
  it('renders a table', () => {
    setup();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  describe('the columns', () => {
    const firstElement = data[0];

    it('uses the specified column header', () => {
      setup({ data: [firstElement] });

      columns.forEach(col => {
        expect(screen.getByText(col.header as string)).toBeInTheDocument();
      });
    });

    it('uses the specified column value', () => {
      setup({ data: [firstElement] });

      expect(screen.getByRole('table')).toBeInTheDocument();

      checkElementInTable(firstElement);
    });

    describe('the sorting button', () => {
      it('should NOT be present if enabledSorting = false', async () => {
        // Disable sorting
        setup({
          columns: [
            {
              ...colDef[0],
              enableSorting: false,
            },
          ],
        });

        expect(screen.queryByTestId('sorting_button_name')).not.toBeInTheDocument();
      });

      it('should be present if enabledSorting = true', () => {
        setup();

        expect(screen.getByTestId('sorting_button_name')).toBeInTheDocument();
      });

      it('should toggle sort if clicked', async () => {
        const { user } = setup();

        // Before clicking it should be not sorted
        expect(screen.getByTestId('head_col_name')).toHaveAttribute(
          'data-sorting',
          'false',
        );

        await user.click(screen.getByTestId('sorting_button_name'));

        // After clicking it should be DESC
        expect(screen.getByTestId('head_col_name')).toHaveAttribute(
          'data-sorting',
          'desc',
        );

        await user.click(screen.getByTestId('sorting_button_name'));

        // After clicking it again should be ASC
        expect(screen.getByTestId('head_col_name')).toHaveAttribute(
          'data-sorting',
          'asc',
        );
      });

      it('should be sorted by default when passing a correct defaultSorting prop', async () => {
        setup({
          defaultSorting: [
            {
              id: 'name',
              desc: true,
            },
          ],
        });

        // Before clicking it should be not sorted
        expect(screen.getByTestId('head_col_name')).toHaveAttribute(
          'data-sorting',
          'desc',
        );
      });
    });
  });

  describe('the pagination', () => {
    it('should display the pagination where current page is the first', () => {
      setup();

      expect(screen.getByTestId('datatable-pagination')).toBeInTheDocument();
      // Prev arrow should be disabled, next arrow should be enabled
      expect(screen.getByTestId('pagination-prev-arrow')).toBeDisabled();
      expect(screen.getByTestId('pagination-next-arrow')).toBeEnabled();

      // First button should not be in the document, while last button should be
      expect(screen.queryByTestId('pagination-first')).not.toBeInTheDocument();
      expect(screen.getByTestId('pagination-last')).toBeInTheDocument();

      // Current page is 1
      expect(screen.getByTestId('pagination-page-1')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('should show "DEFAULT_ELEMENTS_PER_PAGE" elements per page by default', () => {
      const { container } = setup();

      // There should be only DEFAULT_ELEMENTS_PER_PAGE table rows per page
      expect(getNumberOfRows(container)).toBe(DEFAULT_ELEMENTS_PER_PAGE);
    });

    it('should show the specified elements per page by passing the prop', () => {
      const { container } = setup({
        elementsPerPage: 10,
      });

      // There should be only 10 table rows per page
      expect(getNumberOfRows(container)).toBe(10);
    });
  });

  describe('when table is empty', () => {
    it('should show "No results" label', () => {
      setup({
        data: [],
      });

      expect(screen.getByText(/No results/)).toBeInTheDocument();
    });

    it('should show custom no result label if passing noResultsLabel prop', () => {
      setup({
        data: [],
        noResultsLabel: 'CUSTOM_NO_RESULT',
      });

      expect(screen.getByText('CUSTOM_NO_RESULT')).toBeInTheDocument();
    });
  });

  describe('the filters', () => {
    it('should be hidden by default', () => {
      setup();

      expect(screen.queryByTestId('datatable-filters')).not.toBeInTheDocument();
    });

    it('should render only filters for columns with enableColumnFilter = true', () => {
      setup({
        enableFilters: true,
      });

      expect(screen.getByTestId('datatable-filter-name')).toBeInTheDocument();
      expect(
        screen.queryByTestId('datatable-filter-surname'),
      ).not.toBeInTheDocument();
    });

    describe('when enableFilters = true', () => {
      it('filters should be present', () => {
        setup({
          enableFilters: true,
        });

        expect(screen.getByTestId('datatable-filters')).toBeInTheDocument();
      });

      it('selecting a filter value should filter the rows correctly', async () => {
        const { user, container } = setup({
          enableFilters: true,
        });

        await user.click(screen.getByTestId('datatable-filter-name'));

        await user.click(screen.getByTestId('datatable-filter-name-select-NAME_0'));

        expect(getNumberOfRows(container)).toBe(1);
      });

      describe('the search box', () => {
        it('should be hidden by default', () => {
          setup({
            enableFilters: true,
          });

          expect(
            screen.queryByTestId('datatable-searchbox'),
          ).not.toBeInTheDocument();
        });

        it('should be present if enableSearchBox = true', () => {
          setup({
            enableFilters: true,
            enableSearchBox: true,
          });

          expect(screen.queryByTestId('datatable-searchbox')).toBeInTheDocument();
        });

        it('changing the value trigger table filter', async () => {
          const { user, container } = setup({
            enableFilters: true,
            enableSearchBox: true,
          });

          await user.click(screen.getByTestId('datatable-searchbox'));

          await user.type(screen.getByTestId('datatable-searchbox'), 'NOT_PRESENT');

          await user.click(screen.getByTestId('datatable-searchbox'));

          expect(getNumberOfRows(container)).toBe(0);
        });
      });
    });
  });
});
