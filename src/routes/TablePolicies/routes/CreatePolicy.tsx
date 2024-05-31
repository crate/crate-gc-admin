import { PolicyForm } from '../views';

type CreatePolicyProps = {
  onCreatePolicy?: () => void;
};

export default function CreatePolicy({ onCreatePolicy }: CreatePolicyProps) {
  return <PolicyForm type="add" onSave={onCreatePolicy} />;
}
