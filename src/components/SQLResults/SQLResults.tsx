import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { truncate } from 'lodash';
import { useMemo } from 'react';
import { Tooltip } from 'antd';
import CrateTabsShad from 'components/CrateTabsShad';
import SQLResultsTable from './SQLResultsTable';
import { QueryStatus } from 'types/query';
import Loader from 'components/Loader';

export type SQLResultsProps = {
  results: QueryStatus[] | undefined;
  onDownloadResult?: (format: 'csv' | 'json') => void;
};

function SQLResults({ results, onDownloadResult }: SQLResultsProps) {
  function renderResult(queryResult: QueryStatus) {
    if (queryResult.status === 'ERROR' || queryResult.status === 'SUCCESS') {
      return (
        <SQLResultsTable
          result={queryResult.result}
          onDownloadResult={onDownloadResult}
        />
      );
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

  const tabs = useMemo(
    () =>
      results.map(queryResult => {
        const i = ++idx;

        return {
          key: `${i}`,
          label: (
            <Tooltip
              title={truncate(queryResult.result?.original_query?.query || '', {
                length: 50,
              })}
            >
              <div className="flex items-center justify-between gap-1.5 text-sm">
                <span className="whitespace-nowrap">Result {i}</span>
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
            </Tooltip>
          ),
          content: renderResult(queryResult),
        };
      }),
    [results],
  );

  return <CrateTabsShad items={tabs} hideWhenSingleTab stickyTabBar />;
}

export default SQLResults;
