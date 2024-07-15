import { useEffect } from 'react';
import { getRequestSpy, render, screen, waitFor } from 'test/testUtils';
import useExecuteMultiSql from 'hooks/useExecuteMultiSql';

type MockComponentProps = { query: string };
function MockComponent({ query }: MockComponentProps) {
  const { executeSqlWithStatus, queryResults, resetResults } = useExecuteMultiSql();

  useEffect(() => {
    executeSqlWithStatus(query);
  }, []);

  return (
    <div>
      {!queryResults ? (
        'Loading'
      ) : (
        <div>
          <div data-testid="number-of-queries">{queryResults.length}</div>
          {queryResults.map((el, index) => {
            return (
              <div key={index}>
                <div data-testid={`status-${index}`}>{el.status}</div>
                {el.result && (
                  <div data-testid={`data-${index}`}>
                    {'error' in el.result
                      ? el.result.error.message
                      : el.result?.rows}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <button onClick={resetResults}>Reset</button>
    </div>
  );
}

const defaultProps: MockComponentProps = {
  query: 'SELECT 1; SELECT 2',
};

const setup = (props: Partial<MockComponentProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<MockComponent {...combinedProps} />);
};

const waitForResults = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('number-of-queries')).toBeInTheDocument();
  });
};

describe('The useExecuteSql hook', () => {
  describe('when queries are valid', () => {
    it('executes all the queries', async () => {
      const executeQuerySpy = getRequestSpy('POST', 'api/_sql');

      setup();
      await waitForResults();

      expect(screen.getByTestId('number-of-queries')).toHaveTextContent('2');

      expect(executeQuerySpy).toHaveBeenCalledTimes(2);
    });

    it('gets all the statuses', async () => {
      setup();
      await waitForResults();

      expect(screen.getByTestId('status-0')).toHaveTextContent('SUCCESS');
      expect(screen.getByTestId('status-1')).toHaveTextContent('SUCCESS');
    });

    it('returns all the responses', async () => {
      setup();

      await waitForResults();
      // wait for all the results
      await waitFor(() => {
        expect(screen.getByTestId('data-1')).toBeInTheDocument();
      });

      expect(screen.getByTestId('data-0')).toBeInTheDocument();
      expect(screen.getByTestId('data-1')).toBeInTheDocument();
    });
  });

  describe('when the query is invalid', () => {
    it('gives the errors', async () => {
      setup({
        query: 'FNDAFJKNDJK',
      });
      await waitForResults();

      expect(screen.getByTestId('status-0')).toHaveTextContent('ERROR');
    });
  });
});
