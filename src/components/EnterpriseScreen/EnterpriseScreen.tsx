import React, { useContext } from 'react';
import { GCContext } from '../../utilities/context';
import { ConnectionStatus } from '../../utilities/gc/connectivity';
import { Result } from 'antd';
import { Button } from '@crate.io/crate-ui-components';

type Params = {
  children: React.JSX.Element;
};

function EnterpriseScreen({ children }: Params) {
  const { gcStatus } = useContext(GCContext);
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
