import { Loader } from 'components';
import { useParams } from 'react-router-dom';
import { PolicyForm } from '../views';
import { useGCGetPolicy } from 'hooks/swrHooks';

export default function EditPolicy() {
  const { policyId } = useParams();
  const { data: policy, isLoading, isValidating } = useGCGetPolicy(policyId!);

  return isLoading || isValidating || !policy ? (
    <Loader />
  ) : (
    <PolicyForm type="edit" policy={policy} />
  );
}
