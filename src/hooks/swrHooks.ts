import useSWR from 'swr';
import swrCORSFetch from '../utils/swrCORSFetch';
import { useEffect, useState } from 'react';
import { apiGet } from './api';
import { SQLJob, SQLJobLog } from '../types';

export const useGCGetScheduledJobs = (url: string) => {
  return useSWR<SQLJob[]>(`${url}/api/scheduled-jobs/`, swrCORSFetch);
};

export const useGCGetScheduledJobLogs = (url: string, job: SQLJob) => {
  return useSWR<SQLJobLog[]>(
    `${url}/api/scheduled-jobs/${job.id}/log`,
    swrCORSFetch,
  );
};

// NOTE: This Hook will be removed when API will return the last_execution
export const useGCGetScheduledJobLastLogs = (url: string, jobs: SQLJob[]) => {
  const [jobsToReturn, setJobsToReturn] = useState<SQLJob[]>([]);

  useEffect(() => {
    const promises = jobs.map(async (job: SQLJob) => {
      const lastLog = await apiGet<SQLJobLog[]>(
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
          last_execution: lastLog && lastLog.end,
        };
      });

      if (JSON.stringify(newJobs) !== JSON.stringify(jobsToReturn)) {
        setJobsToReturn(newJobs);
      }
    });
  }, [jobs]);

  return jobsToReturn;
};
