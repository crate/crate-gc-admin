import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GCSpin, NoDataView } from 'components';
import useJWTManagerStore from 'state/jwtManager';

function Auth() {
  const login = useJWTManagerStore(state => state.login);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<boolean | undefined>(undefined);

  // get tokens from the url
  const specifiedToken = searchParams.get('token');
  const specifiedRefreshToken = searchParams.get('refresh');

  const doLogin = async () => {
    const result = await login(specifiedToken!, specifiedRefreshToken || undefined);
    setStatus(result);
    if (result) {
      window.location.assign('/');
    }
  };

  useEffect(() => {
    if (!specifiedToken) {
      setStatus(false);
      return;
    }
    doLogin();
  }, [specifiedToken]);

  return (
    <GCSpin spinning={status === undefined}>
      {status === false && (
        <NoDataView description="Could not authenticate to Grand Central: Invalid or missing token" />
      )}
    </GCSpin>
  );
}

export default Auth;
