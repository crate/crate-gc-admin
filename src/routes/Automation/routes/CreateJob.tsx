import { JobForm } from '../views';

type CreateJobProps = {
  onCreateJob?: () => void;
  pathPrefix?: string;
};

export default function CreateJob({ onCreateJob, pathPrefix }: CreateJobProps) {
  return <JobForm type="add" onSave={onCreateJob} pathPrefix={pathPrefix} />;
}
