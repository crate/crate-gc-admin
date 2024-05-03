import useSWR from 'swr';
import swrCORSFetch from 'utils/swrCORSFetch';
import { useEffect, useState } from 'react';
import { apiGet } from 'utils/api';
import {
  EnrichedPolicy,
  Job,
  JobLog,
  JobLogWithName,
  Policy,
  PolicyLog,
  PolicyLogWithName,
} from 'types';
import useGcApi from 'hooks/useGcApi';
import {
  useGetClusterInfoQuery,
  useGetNodesQuery,
  useGetCurrentUserQuery,
  useGetTablesQuery,
  useGetShardsQuery,
  useGetAllocationsQuery,
  useGetQueryStatsQuery,
  useGetPartitionedTablesQuery,
} from 'hooks/queryHooks';
import { useGCContext } from 'contexts';

const gcApiKeyBuilder = (key: string) => {
  const { gcUrl } = useGCContext();
  return `${gcUrl}${key}`;
};

export const useGCGetScheduledJobs = () => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<Job[]>(gcApiKeyBuilder(`/api/scheduled-jobs/`), swrFetch, {
    refreshInterval: 30 * 1000,
  });
};

export const useGCGetScheduledJob = (jobId: string) => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);

  return useSWR<Job>(gcApiKeyBuilder(`/api/scheduled-jobs/${jobId}`), swrFetch);
};

export const useGCGetScheduledJobLogs = (job: Job) => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<JobLog[]>(
    gcApiKeyBuilder(`/api/scheduled-jobs/${job.id}/log`),
    swrFetch,
    {
      refreshInterval: 30 * 1000,
    },
  );
};

export const useGCGetScheduledJobsLogs = () => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<JobLogWithName[]>(
    gcApiKeyBuilder(`/api/scheduled-jobs/logs?limit=100`),
    swrFetch,
    {
      refreshInterval: 30 * 1000,
    },
  );
};

// NOTE: This Hook will be removed when API will return the last_execution
export const useGCGetPoliciesEnriched = (policies: Policy[]) => {
  const [policiesToReturn, setPoliciesToReturn] = useState<EnrichedPolicy[]>([]);
  const gcApi = useGcApi();

  useEffect(() => {
    const promises = policies.map(async (policy: Policy) => {
      const lastLog = await apiGet<PolicyLog[]>(
        gcApi,
        `/api/policies/${policy.id}/log?limit=2`,
        {
          credentials: 'include',
        },
      );

      return lastLog.data ? lastLog.data : undefined;
    });

    Promise.all(promises).then(logResults => {
      const newPolicies: EnrichedPolicy[] = policies.map((policy, policyIndex) => {
        const jobLogs = logResults[policyIndex];
        if (typeof jobLogs === 'undefined') {
          return {
            ...policy,
            last_execution: undefined,
            running: false,
          };
        }

        const lastLog = jobLogs.filter(log => log.end !== null)[0];

        return {
          ...policy,
          last_execution: lastLog,
          running: jobLogs && jobLogs[0] && jobLogs[0].end === null ? true : false,
        } satisfies EnrichedPolicy;
      });

      if (JSON.stringify(newPolicies) !== JSON.stringify(policiesToReturn)) {
        setPoliciesToReturn(newPolicies);
      }
    });
  }, [policies]);

  return { policiesToReturn, setPoliciesToReturn };
};

export const useGCGetPolicy = (policyId: string) => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);

  return useSWR<Policy>(gcApiKeyBuilder(`/api/policies/${policyId}`), swrFetch);
};

export const useGetNodeStatus = () => {
  const getNodes = useGetNodesQuery();
  return useSWR(
    // We do not use the url as the swr key, because we'll have many of these SWR fetches from the same url
    `swr-fetch-node-info`,
    () => getNodes(),
    {
      refreshInterval: 5000,
    },
  );
};

export const useGetCluster = () => {
  const getClusterInfo = useGetClusterInfoQuery();
  return useSWR(
    // We do not use the url as the swr key, because we'll have many of these SWR fetches from the same url
    `swr-fetch-cluster-info`,
    () => getClusterInfo(),
    {
      refreshInterval: 5000,
    },
  );
};

export const useGetCurrentUser = () => {
  const getCurrentUser = useGetCurrentUserQuery();
  return useSWR(`swr-fetch-user`, () => getCurrentUser());
};

export const useGetTables = (includeSystemTables: boolean = true) => {
  const getTables = useGetTablesQuery(includeSystemTables);
  return useSWR(
    `swr-fetch-tables-${includeSystemTables ? 'all' : 'non-system'}`,
    () => getTables(),
    {
      refreshInterval: 5000,
    },
  );
};

export const useGetPartitionedTables = (includeSystemTables: boolean = true) => {
  const getTables = useGetPartitionedTablesQuery(includeSystemTables);
  return useSWR(
    `swr-fetch-partitioned-tables-${includeSystemTables ? 'all' : 'non-system'}`,
    () => getTables(),
    {
      refreshInterval: 5000,
    },
  );
};

export const useGetShards = () => {
  const getShards = useGetShardsQuery();
  return useSWR(`swr-fetch-shards`, () => getShards(), {
    refreshInterval: 5000,
  });
};

export const useGetAllocations = () => {
  const getAllocations = useGetAllocationsQuery();
  return useSWR(`swr-fetch-allocations`, () => getAllocations(), {
    refreshInterval: 5000,
  });
};

export const useGetQueryStats = () => {
  const getQueryStats = useGetQueryStatsQuery();
  return useSWR(`swr-fetch-query-stats`, () => getQueryStats(), {
    refreshInterval: 5000,
  });
};

export const useGCGetPolicies = () => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);

  return useSWR<Policy[]>(gcApiKeyBuilder(`/api/policies/`), swrFetch, {
    refreshInterval: 30 * 1000,
  });
};

export const useGCGetSchemas = (includeTables: boolean = true) => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<Policy[]>(
    gcApiKeyBuilder(`/api/data/schemas/?include_tables=${includeTables}`),
    swrFetch,
  );
};

export const useGCGetPoliciesLogs = () => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<PolicyLogWithName[]>(
    gcApiKeyBuilder(`/api/policies/logs?limit=100`),
    swrFetch,
    {
      refreshInterval: 30 * 1000,
    },
  );
};
