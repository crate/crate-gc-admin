import useSWR from 'swr';
import swrCORSFetch from 'src/swr/swrCORSFetch';
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
  TaskLog,
} from 'types';
import useGcApi from 'hooks/useGcApi';
import useJWTManagerStore from 'state/jwtManager';

const gcApiKeyBuilder = (key: string) => {
  const gcUrl = useJWTManagerStore(state => state.gcUrl);
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

export const useGCGetScheduledJobsAllLogs = () => {
  const gcApi = useGcApi();
  const swrFetch = swrCORSFetch(gcApi);

  return useSWR<TaskLog[]>(
    gcApiKeyBuilder(`/api/scheduled-jobs/all/logs?limit=100`),
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
