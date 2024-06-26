import { Loader } from 'components';
import { useParams } from 'react-router-dom';
import { PolicyForm } from '../views';
import { useApiCall } from 'hooks/useApiCall';
import useGcApi from 'hooks/useGcApi';
import { Policy } from 'types';

type EditPolicyProps = {
  onEditPolicy?: () => void;
};

export default function EditPolicy({ onEditPolicy }: EditPolicyProps) {
  const { policyId } = useParams();
  const gcApi = useGcApi();
  const { data: policy, loading } = useApiCall<Policy>({
    axiosInstance: gcApi,
    url: `/api/policies/${policyId}`,
    method: 'GET',
  });

  return loading || !policy ? (
    <Loader />
  ) : (
    <PolicyForm type="edit" policy={policy} onSave={onEditPolicy} />
  );
}
