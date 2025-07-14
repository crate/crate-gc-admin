import { useParams } from 'react-router-dom';
import { useApiCall } from 'hooks/useApiCall';
import useGcApi from 'hooks/useGcApi';
import { Loader } from 'components';
import { JobForm } from '../views';
import { Job } from 'types';

type EditJobProps = {
  onEditJob?: () => void;
  pathPrefix?: string;
};

export default function EditJob({ onEditJob, pathPrefix }: EditJobProps) {
  const { jobId } = useParams();
  const gcApi = useGcApi();
  const { data: job, loading } = useApiCall<Job>({
    axiosInstance: gcApi,
    url: `/api/scheduled-jobs/${jobId}`,
    method: 'GET',
  });

  return loading || !job ? (
    <Loader size={Loader.sizes.MEDIUM} />
  ) : (
    <JobForm type="edit" job={job} onSave={onEditJob} pathPrefix={pathPrefix} />
  );
}
