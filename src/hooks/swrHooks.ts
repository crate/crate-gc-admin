import useSWR from 'swr';
import swrCORSFetch from 'utils/swrCORSFetch';
import { useEffect, useState } from 'react';
import { apiGet } from 'utils/api';
import { EnrichedJob, Job, JobLog, JobLogWithName } from 'types';
import useGcApi from 'hooks/useGcApi';
import {
  useGetClusterInfoQuery,
  useGetNodesQuery,
  useGetCurrentUserQuery,
  useGetTablesQuery,
  useGetShardsQuery,
  useGetAllocationsQuery,
  useGetQueryStatsQuery,
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
export const useGCGetScheduledJobEnriched = (jobs: Job[]) => {
  const [jobsToReturn, setJobsToReturn] = useState<EnrichedJob[]>([]);
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
      const newJobs: EnrichedJob[] = jobs.map((job, jobIndex) => {
        const jobLogs = logResults[jobIndex];
        if (typeof jobLogs === 'undefined') {
          return {
            ...job,
            last_execution: undefined,
            running: false,
          };
        }

        const lastLog = jobLogs.filter(log => log.end !== null)[0];

        return {
          ...job,
          last_execution: lastLog,
          running: jobLogs && jobLogs[0] && jobLogs[0].end === null ? true : false,
        };
      });

      if (JSON.stringify(newJobs) !== JSON.stringify(jobsToReturn)) {
        setJobsToReturn(newJobs);
      }
    });
  }, [jobs]);

  return { jobsToReturn, setJobsToReturn };
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
