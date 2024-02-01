import useSWR from 'swr';
import swrCORSFetch from '../utils/swrCORSFetch';
import { useEffect, useState } from 'react';
import { apiGet } from './api';
import { Job, JobLog } from '../types';
import {
  getAllocations,
  getClusterInfo,
  getCurrentUser,
  getNodes,
  getQueryStats,
  getShards,
  getTables,
} from '../utils/queries.ts';

export const useGCGetScheduledJobs = (url: string) => {
  return useSWR<Job[]>(`${url}/api/scheduled-jobs/`, swrCORSFetch, {
    refreshInterval: 10 * 1000,
  });
};

export const useGCGetScheduledJobLogs = (url: string, job: Job) => {
  return useSWR<JobLog[]>(`${url}/api/scheduled-jobs/${job.id}/log`, swrCORSFetch, {
    refreshInterval: 10 * 1000,
  });
};

// NOTE: This Hook will be removed when API will return the last_execution
export const useGCGetScheduledJobLastLogs = (url: string, jobs: Job[]) => {
  const [jobsToReturn, setJobsToReturn] = useState<Job[]>([]);

  useEffect(() => {
    const promises = jobs.map(async (job: Job) => {
      const lastLog = await apiGet<JobLog[]>(
        `${url}/api/scheduled-jobs/${job.id}/log?limit=1`,
        null,
        {
          credentials: 'include',
        },
      );
      return lastLog.data ? lastLog.data[0] : undefined;
    });

    Promise.all(promises).then(logResults => {
      const newJobs = jobs.map((job, jobIndex) => {
        const lastLog = logResults[jobIndex];

        return {
          ...job,
          last_execution: lastLog,
        };
      });

      if (JSON.stringify(newJobs) !== JSON.stringify(jobsToReturn)) {
        setJobsToReturn(newJobs);
      }
    });
  }, [jobs]);

  return jobsToReturn;
};

export const useGetNodeStatus = (url: string | undefined) => {
  return useSWR(
    // We do not use the url as the swr key, because we'll have many of these SWR fetches from the same url
    url ? `swr-fetch-node-info` : null,
    () => getNodes(url),
    {
      refreshInterval: 5000,
    },
  );
};

export const useGetCluster = (url: string | undefined) => {
  return useSWR(
    // We do not use the url as the swr key, because we'll have many of these SWR fetches from the same url
    url ? `swr-fetch-cluster-info` : null,
    () => getClusterInfo(url),
  );
};

export const useGetCurrentUser = (url: string | undefined) => {
  return useSWR(url ? `swr-fetch-user` : null, () => getCurrentUser(url));
};

export const useGetTables = (url: string | undefined) => {
  return useSWR(url ? `swr-fetch-tables` : null, () => getTables(url), {
    refreshInterval: 5000,
  });
};

export const useGetShards = (url: string | undefined) => {
  return useSWR(url ? `swr-fetch-shards` : null, () => getShards(url), {
    refreshInterval: 5000,
  });
};

export const useGetAllocations = (url: string | undefined) => {
  return useSWR(url ? `swr-fetch-allocations` : null, () => getAllocations(url), {
    refreshInterval: 5000,
  });
};

export const useGetQueryStats = (url: string | undefined) => {
  return useSWR(url ? `swr-fetch-query-stats` : null, () => getQueryStats(url), {
    refreshInterval: 5000,
  });
};
