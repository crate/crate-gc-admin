import { render, screen, waitFor } from 'test/testUtils';
import CrateTable, { CrateTableProps } from './CrateTable';

type DataType = {
  name: string;
};
const defaultProps: CrateTableProps<DataType> = {
  dataSource: [{ name: 'First row' }, { name: 'Second row' }],
  columns: [
    {
      title: 'Name column',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
  ],
  emptyText: 'No data found',
  rowClassName: () => 'row-class-name',
  rowKey: element => `row-key-${element.name.replace(/\s/, '').toLowerCase()}`,
  showHeader: true,
};

const expandedRowRender = () => {
  return <div data-testid="expanded-row">expanded row</div>;
};

const setup = (props = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<CrateTable {...combinedProps} />);
};

describe('The CrateTable component', () => {
  it('displays the header of the table', () => {
    setup();

    expect(screen.getByText('Name column')).toBeInTheDocument();
  });

  it('does not display the header if it should not be shown', () => {
    setup({ showHeader: false });

    expect(screen.queryByText('Name column')).not.toBeInTheDocument();
  });

  it('displays a loading indicator while there is no data', () => {
    setup({ dataSource: null });

    expect(screen.getByTestId('crate-table-loading-spinner')).toBeInTheDocument();
  });

  it('displays the data', () => {
    setup();

    expect(screen.getByText('First row')).toBeInTheDocument();
    expect(screen.getByText('Second row')).toBeInTheDocument();
  });

  it('displays the empty text if there is an empty list as data source', () => {
    setup({ dataSource: [] });

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('displays the default empty text if there is an empty list as data source and no empty text', () => {
    setup({ dataSource: [], emptyText: undefined });

    expect(screen.getAllByText('No data')).toHaveLength(3);
  });

  it('displays an expand icon', () => {
    setup({
      expandable: {
        expandedRowRender,
      },
    });

    expect(screen.getAllByText('+').length).toBe(2);
  });

  describe('when a row is expanded', () => {
    it('displays the additional information', async () => {
      const { user } = setup({
        expandable: {
          expandedRowRender,
        },
      });

      await user.click(screen.getAllByText('+')[0]);

      await waitFor(() => {
        expect(screen.getByTestId('expanded-row')).toBeInTheDocument();
      });
    });

    it('displays a collapse icon', async () => {
      const { user } = setup({
        expandable: {
          expandedRowRender,
        },
      });

      await user.click(screen.getAllByText('+')[0]);

      await waitFor(() => {
        expect(screen.getByText('−')).toBeInTheDocument();
      });
    });
  });
});
