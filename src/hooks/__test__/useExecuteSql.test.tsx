import { useEffect, useState } from 'react';
import { getRequestSpy, render, screen, waitFor } from 'test/testUtils';
import useExecuteSql, { ExecuteSqlResult } from 'hooks/useExecuteSql';

function MockComponent() {
  const executeSql = useExecuteSql();
  const [response, setResponse] = useState<ExecuteSqlResult | null>(null);

  useEffect(() => {
    executeSql('SELECT 1').then(queryRes => {
      setResponse(queryRes);
    });
  });

  return (
    <div>
      {!response ? (
        'Loading'
      ) : (
        <div>
          <div data-testid="status">{response.status}</div>
          <div data-testid="data">{JSON.stringify(response.data)}</div>
          <div data-testid="success">{response.success ? 'Success' : 'Failed'}</div>
        </div>
      )}
    </div>
  );
}

const setup = () => {
  return render(<MockComponent />);
};

const waitForResults = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('status')).toBeInTheDocument();
  });
};

describe('The useExecuteSql hook', () => {
  it('executes the query', async () => {
    const executeQuerySpy = getRequestSpy('POST', 'api/_sql');
    setup();

    await waitForResults();

    expect(executeQuerySpy).toHaveBeenCalled();
  });

  it('returns the response', async () => {
    setup();

    await waitForResults();

    expect(screen.getByTestId('data')).toBeInTheDocument();
  });

  it('returns status', async () => {
    setup();

    await waitForResults();

    expect(screen.getByTestId('status')).toHaveTextContent('200');
  });

  it('returns success = true', async () => {
    setup();

    await waitForResults();

    expect(screen.getByTestId('success')).toHaveTextContent('Success');
  });
});
