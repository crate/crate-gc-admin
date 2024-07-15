import CrateTabs from 'components/CrateTabs';
import { QueryStatus } from 'types/query';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import SQLResultsTable from './SQLResultsTable';
import Loader from 'components/Loader';

type Params = {
  results: QueryStatus[] | undefined;
  format?: boolean;
};

function SQLResults({ results, format }: Params) {
  function renderResult(queryResult: QueryStatus) {
    if (queryResult.status === 'ERROR' || queryResult.status === 'SUCCESS') {
      return <SQLResultsTable result={queryResult.result} format={format} />;
    } else {
      return (
        <div className="p-4">
          {queryResult.status === 'EXECUTING' ? (
            <div className="flex items-center gap-1">
              <Loader size={Loader.sizes.SMALL} /> Executing...
            </div>
          ) : queryResult.status === 'WAITING' ? (
            'Waiting for previous queries to be executed.'
          ) : queryResult.status === 'NOT_EXECUTED' ? (
            'Not executed because one of the previous queries has failed.'
          ) : null}
        </div>
      );
    }
  }

  if (!results || results.length === 0) {
    return null;
  }

  let idx = 0;

  const tabs = results.map(queryResult => {
    const i = ++idx;

    return {
      key: `${i}`,
      label: (
        <div className="flex items-center justify-between gap-1.5">
          <span>Result {i}</span>
          {queryResult.status === 'EXECUTING' ? (
            <Loader size={Loader.sizes.SMALL} />
          ) : queryResult.status === 'ERROR' ? (
            <CloseCircleOutlined className="!mr-0 text-xs text-red-600" />
          ) : queryResult.status === 'SUCCESS' ? (
            <CheckCircleOutlined className="!mr-0 text-xs text-green-600" />
          ) : queryResult.status === 'WAITING' ? (
            <ClockCircleOutlined className="!mr-0 text-xs" />
          ) : queryResult.status === 'NOT_EXECUTED' ? (
            <PauseCircleOutlined className="!mr-0 text-xs" />
          ) : null}
        </div>
      ),
      children: renderResult(queryResult),
    };
  });
  return (
    <CrateTabs
      defaultActiveKey="1"
      items={tabs}
      indentTabBar
      queryParamKeyActiveTab={null}
      className="squeezed-tabs"
    />
  );
}

export default SQLResults;
