import CrateTabs from '../CrateTabs';
import { QueryResults } from '../../types/query';
import SQLResultsTable from './SQLResultsTable';

type Params = {
  results: QueryResults | undefined;
  format?: boolean;
};

function SQLResults({ results, format }: Params) {
  if (!results) {
    return null;
  }

  // multiple results returned: display as tabs
  if (Array.isArray(results)) {
    let idx = 0;

    const tabs = results.map(o => {
      const i = ++idx;
      return {
        key: `${i}`,
        label: `Result ${i}`,
        children: <SQLResultsTable result={o} format={format} />,
      };
    });
    return <CrateTabs defaultActiveKey="1" items={tabs} />;
  }

  // single result returned: display as table
  return <SQLResultsTable result={results} format={format} />;
}

export default SQLResults;
