import CrateTabs from 'components/CrateTabs';
import { QueryResults } from 'types/query';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
      const isError = 'error' in o;

      return {
        key: `${i}`,
        label: (
          <div className="flex items-center justify-between gap-1.5">
            <span>Result {i}</span>
            {isError ? (
              <CloseCircleOutlined className="!mr-0 text-xs text-red-600" />
            ) : (
              <CheckCircleOutlined className="!mr-0 text-xs" />
            )}
          </div>
        ),
        children: <SQLResultsTable result={o} format={format} />,
      };
    });
    return <CrateTabs defaultActiveKey="1" items={tabs} indentTabBar />;
  }

  // single result returned: display as table
  return <SQLResultsTable result={results} format={format} />;
}

export default SQLResults;
