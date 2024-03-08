import { useParams } from 'react-router-dom';
import { ScheduledJobForm } from '../views';
import { useGCGetScheduledJob } from 'hooks/swrHooks';
import { Loader } from 'components';

export default function ScheduledJobsEdit() {
  const { jobId } = useParams();
  const { data: job, isLoading, isValidating } = useGCGetScheduledJob(jobId!);

  return isLoading || isValidating || !job ? (
    <Loader />
  ) : (
    <ScheduledJobForm type="edit" job={job} />
  );
}
