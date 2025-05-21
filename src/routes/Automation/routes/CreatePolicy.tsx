import { PolicyForm } from '../views';

type CreatePolicyProps = {
  onCreatePolicy?: () => void;
  pathPrefix?: string;
};

export default function CreatePolicy({
  onCreatePolicy,
  pathPrefix,
}: CreatePolicyProps) {
  return <PolicyForm type="add" onSave={onCreatePolicy} pathPrefix={pathPrefix} />;
}
