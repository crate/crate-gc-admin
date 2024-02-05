import useSWR from 'swr';
import swrCORSFetch from '../utils/swrCORSFetch';
import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';
import { Job, JobLog } from '../types';
import useGcApi from './useGcApi';
import {
  useGetClusterInfoQuery,
  useGetNodesQuery,
  useGetCurrentUserQuery,
  useGetTablesQuery,
  useGetShardsQuery,
  useGetAllocationsQuery,
  useGetQueryStatsQuery,
} from './queryHooks';

export const useGCGetScheduledJobs = () => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<Job[]>(`/api/scheduled-jobs/`, swrFetch, {
    refreshInterval: 10 * 1000,
  });
};

export const useGCGetScheduledJobLogs = (job: Job) => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);
  return useSWR<JobLog[]>(`/api/scheduled-jobs/${job.id}/log`, swrFetch, {
    refreshInterval: 10 * 1000,
  });
};

// NOTE: This Hook will be removed when API will return the last_execution
export const useGCGetScheduledJobLastLogs = (jobs: Job[]) => {
  const [jobsToReturn, setJobsToReturn] = useState<Job[]>([]);
  const gcApi = useGcApi();

  useEffect(() => {
    const promises = jobs.map(async (job: Job) => {
      const lastLog = await apiGet<JobLog[]>(
        gcApi,
        `/api/scheduled-jobs/${job.id}/log?limit=2`,
        null,
        {
          credentials: 'include',
        },
      );

      return lastLog.data ? lastLog.data : undefined;
    });

    Promise.all(promises).then(logResults => {
      const newJobs: Job[] = jobs.map((job, jobIndex) => {
        const lastLog = logResults[jobIndex];

        return {
          ...job,
          last_executions: lastLog,
        };
      });

      if (JSON.stringify(newJobs) !== JSON.stringify(jobsToReturn)) {
        setJobsToReturn(newJobs);
      }
    });
  }, [jobs]);

  return jobsToReturn;
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
  );
};

export const useGetCurrentUser = () => {
  const getCurrentUser = useGetCurrentUserQuery();
  return useSWR(`swr-fetch-user`, () => getCurrentUser());
};

export const useGetTables = () => {
  const getTables = useGetTablesQuery();
  return useSWR(`swr-fetch-tables`, () => getTables(), {
    refreshInterval: 5000,
  });
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
