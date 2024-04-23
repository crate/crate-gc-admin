import { AxiosInstance } from 'axios';
import useGcApi from 'hooks/useGcApi';
import { useEffect, useState } from 'react';
import {
  EligibleTable,
  EligibleTablesApiOutput,
  PolicyPreviewBody,
  TPolicyPartitioningInput,
  TPolicyPreviewBody,
  TPolicyTargetInput,
} from 'types';
import { TableListEntry } from 'types/cratedb';
import { apiPost } from 'utils';
import { isTargetDeleted } from '../tablePoliciesUtils/policies';

const getPreview = async (gcApi: AxiosInstance, policy: TPolicyPreviewBody) => {
  const preview = await apiPost<EligibleTablesApiOutput>(
    gcApi,
    '/api/policies/preview/',
    policy,
    undefined,
    false,
  );

  return preview.data;
};

type UsePolicyPreviewProps = {
  targets: TPolicyTargetInput[];
  tables: TableListEntry[];
  partitioning: TPolicyPartitioningInput;
};
export default function usePolicyPreview({
  targets,
  tables,
  partitioning,
}: UsePolicyPreviewProps) {
  const gcApi = useGcApi();
  const [eligibleTables, setEligibleTables] = useState<null | EligibleTable[]>(null);

  // Get Preview
  useEffect(() => {
    const policyPreviewBody: TPolicyPreviewBody = {
      targets: targets.filter(target => {
        return isTargetDeleted(target, tables);
      }),
      partitioning,
    } satisfies TPolicyPreviewBody;

    if (PolicyPreviewBody.safeParse(policyPreviewBody).success) {
      getPreview(gcApi, policyPreviewBody).then(tables => {
        if (tables) {
          setEligibleTables(tables.eligible_tables);
        } else {
          setEligibleTables(null);
        }
      });
    } else {
      setEligibleTables(null);
    }
  }, [
    targets,
    partitioning.column_name,
    partitioning.operation,
    partitioning.unit,
    partitioning.value,
  ]);

  return {
    eligibleTables,
  };
}
