import { render, screen } from 'test/testUtils';
import SQLResultsTable, { SQLResultsTableProps } from './SQLResultsTable';
import { useSchemaTreeMock } from 'test/__mocks__/useSchemaTreeMock';
import _ from 'lodash';
import { QueryResult } from 'types/query';
import { CRATEDB_ERROR_CODES_DOCS } from 'constants/defaults';

const cols = _.zip(useSchemaTreeMock.col_types, useSchemaTreeMock.cols).flatMap(
  arr => {
    const [type, col] = arr;
    return {
      col: col!,
      type: type!,
    };
  },
);

const errorQueryResponse: QueryResult = {
  error: {
    message: 'EXAMPLE_ERROR_MESSAGE',
    code: 4000,
  },
  error_trace: 'EXAMPLE_ERROR_TRACE',
};

const onDownloadResultMock = jest.fn();
const defaultProps: SQLResultsTableProps = {
  result: useSchemaTreeMock,
  onDownloadResult: onDownloadResultMock,
};

const setup = (props?: Partial<SQLResultsTableProps>) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<SQLResultsTable {...combinedProps} />);
};

describe('The SQLResultsTable component', () => {
  afterEach(() => {
    onDownloadResultMock.mockReset();
  });

  it('displays the numbers of rows', () => {
    setup();

    expect(screen.getByText('1 row'));
  });

  it('displays the query execution time', () => {
    setup();

    expect(
      screen.getByText(
        `${(Math.round(useSchemaTreeMock.duration) / 1000).toFixed(3)} seconds`,
      ),
    );
  });

  it('displays a format selector', () => {
    setup();

    expect(screen.getByTestId('format-selector')).toBeInTheDocument();
  });

  it('displays a download button', () => {
    setup();

    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('displays all columns', () => {
    setup();

    cols.forEach(col => {
      expect(screen.getByText(col.col)).toBeInTheDocument();
    });
  });

  describe('the format selector', () => {
    it('has the "Pretty" and "Raw" options', () => {
      setup();

      expect(screen.getByText('Pretty')).toBeInTheDocument();
      expect(screen.getByText('Raw')).toBeInTheDocument();
    });

    it('the "Pretty" option is selected by default', () => {
      setup();

      expect(screen.getByText('Pretty').parentElement).toHaveClass(
        'ant-radio-button-wrapper-checked',
      );
      expect(screen.getByText('Raw').parentElement).not.toHaveClass(
        'ant-radio-button-wrapper-checked',
      );
    });

    it('clicking on another option changes the format', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Raw'));

      expect(screen.getByText('Pretty').parentElement).not.toHaveClass(
        'ant-radio-button-wrapper-checked',
      );
      expect(screen.getByText('Raw').parentElement).toHaveClass(
        'ant-radio-button-wrapper-checked',
      );
    });
  });

  describe('the Copy button', () => {
    it('copies the results to the clipboard', async () => {
      const { user } = setup();
      const writeTextMock = jest
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue();

      await user.click(screen.getByText('Copy'));

      expect(writeTextMock).toHaveBeenCalled();
    });

    it('shows the "Copied" success message', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Copy'));

      expect(screen.getByText('Copied')).toBeInTheDocument();
    });
  });

  describe('the Download button', () => {
    it('opens a menu', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Download'));

      expect(screen.getByText('Export as .csv')).toBeInTheDocument();
      expect(screen.getByText('Export as .json')).toBeInTheDocument();
    });

    describe('clicking on "Export as .csv"', () => {
      it('downloads the CSV file', async () => {
        const { user } = setup();

        await user.click(screen.getByText('Download'));

        expect(screen.getByText('Export as .csv').getAttribute('href')).toMatch(
          /^data:text\/csv;charset=utf-8,/,
        );
      });

      it('the file name is query-results-{TIMESTAMP}.csv', async () => {
        const { user } = setup();

        await user.click(screen.getByText('Download'));

        expect(screen.getByText('Export as .csv').getAttribute('download')).toMatch(
          /^query-results-\d+\.csv/,
        );
      });

      it('calls the onDownloadResult callback with format = csv', async () => {
        const { user } = setup();

        await user.click(screen.getByText('Download'));
        await user.click(screen.getByText('Export as .csv'));

        expect(onDownloadResultMock).toHaveBeenCalledWith('csv');
      });
    });

    describe('clicking on "Export as .json"', () => {
      it('downloads the JSON file', async () => {
        const { user } = setup();

        await user.click(screen.getByText('Download'));

        expect(screen.getByText('Export as .json').getAttribute('href')).toMatch(
          /^data:application\/json;charset=utf-8,/,
        );
      });

      it('the file name is query-results-{TIMESTAMP}.json', async () => {
        const { user } = setup();

        await user.click(screen.getByText('Download'));

        expect(screen.getByText('Export as .json').getAttribute('download')).toMatch(
          /^query-results-\d+\.json/,
        );
      });

      it('calls the onDownloadResult callback with format = json', async () => {
        const { user } = setup();

        await user.click(screen.getByText('Download'));
        await user.click(screen.getByText('Export as .json'));

        expect(onDownloadResultMock).toHaveBeenCalledWith('json');
      });
    });
  });

  describe('when the query has an error', () => {
    it('shows an error chip', () => {
      setup({
        result: errorQueryResponse,
      });

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('shows an error-code documentation link', () => {
      setup({
        result: errorQueryResponse,
      });

      expect(screen.getByText(errorQueryResponse.error.code!)).toHaveAttribute(
        'href',
        CRATEDB_ERROR_CODES_DOCS,
      );
    });

    it('shows the error message', () => {
      setup({
        result: errorQueryResponse,
      });

      expect(screen.getByText(errorQueryResponse.error.message)).toBeInTheDocument();
    });

    it('shows the error trace switch', () => {
      setup({
        result: errorQueryResponse,
      });

      expect(screen.getByText('Show error trace')).toBeInTheDocument();
    });

    describe('when the "Show error trace" switch is enabled', () => {
      it('shows the error trace', async () => {
        const { user } = setup({
          result: errorQueryResponse,
        });

        await user.click(screen.getByText('Show error trace'));

        expect(
          screen.getByText(errorQueryResponse.error_trace!),
        ).toBeInTheDocument();
      });
    });
  });
});
