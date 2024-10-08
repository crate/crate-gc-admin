import { GCSpin, NoDataView } from 'components';
import { useMemo, useState } from 'react';
import useGCLogin from 'hooks/useGCLogin';
import { useGCContext } from 'contexts';

function Auth() {
  const { gcUrl, sessionTokenKey } = useGCContext();

  const gcLogin = useGCLogin();

  const [status, setStatus] = useState<boolean | undefined>(undefined);

  const specifiedToken = new URLSearchParams(location.search).get('token');
  const specifiedRefreshToken = new URLSearchParams(location.search).get('refresh');

  useMemo(() => {
    if (!specifiedToken) {
      setStatus(false);
      return;
    }
    gcLogin({
      token: specifiedToken,
      refresh: specifiedRefreshToken,
      gcUrl: gcUrl!,
      sessionTokenKey,
    }).then(success => {
      if (success) {
        setStatus(true);
        window.location.assign('/');
      } else {
        setStatus(false);
      }
    });
  }, [specifiedToken]);

  return (
    <GCSpin spinning={status === undefined}>
      {status === false && (
        <NoDataView description="Could not authenticate to Grand Central: Invalid or no token" />
      )}
    </GCSpin>
  );
}

export default Auth;
