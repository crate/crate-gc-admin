import { useParams } from 'react-router-dom';
import { useApiCall } from 'hooks/useApiCall';
import useGcApi from 'hooks/useGcApi';
import { PolicyForm } from '../views';
import { Loader } from 'components';
import { Policy } from 'types';

type EditPolicyProps = {
  onEditPolicy?: () => void;
  pathPrefix?: string;
};

export default function EditPolicy({ onEditPolicy, pathPrefix }: EditPolicyProps) {
  const { policyId } = useParams();
  const gcApi = useGcApi();
  const { data: policy, loading } = useApiCall<Policy>({
    axiosInstance: gcApi,
    url: `/api/policies/${policyId}`,
    method: 'GET',
  });

  return loading || !policy ? (
    <Loader size={Loader.sizes.MEDIUM} />
  ) : (
    <PolicyForm
      type="edit"
      policy={policy}
      onSave={onEditPolicy}
      pathPrefix={pathPrefix}
    />
  );
}
