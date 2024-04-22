import React from 'react';
import { Result } from 'antd';
import Button from 'components/Button';
import { ConnectionStatus, useGCContext } from 'contexts';

type EnterpriseScreenProps = {
  children: React.ReactElement;
};

function EnterpriseScreen({ children }: EnterpriseScreenProps) {
  const { gcStatus } = useGCContext();
  if (gcStatus == ConnectionStatus.CONNECTED) {
    return children;
  }

  let title = 'Please enable Grand Central to access this feature.';

  if (gcStatus == ConnectionStatus.NOT_LOGGED_IN) {
    title = 'Please link your cluster to CrateDB Cloud to access this feature.';
  }

  return (
    <Result
      title={title}
      extra={<Button key="console">Learn More (does nothing)</Button>}
    />
  );
}

export default EnterpriseScreen;
