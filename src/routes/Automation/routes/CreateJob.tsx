import { JobForm } from '../views';

type CreateJobProps = {
  onCreateJob?: () => void;
};

export default function CreateJob({ onCreateJob }: CreateJobProps) {
  return <JobForm type="add" onSave={onCreateJob} />;
}
