import React, { useContext } from 'react';
import { ConnectionStatus } from '../../utilities/gc/connectivity';
import { GCContext } from '../../utilities/context';

function renderStatus(status: ConnectionStatus) {
  const prefix = 'Grand Central';
  let actual = <b>Checking ..."</b>;
  switch (status) {
    case ConnectionStatus.CONNECTED:
      actual = <span className="text-green-500">Connected</span>;
      break;
    case ConnectionStatus.NOT_LOGGED_IN:
      actual = <span className="text-yellow-500">Not logged in</span>;
      break;
    case ConnectionStatus.NOT_CONFIGURED:
      actual = <b>Not configured</b>;
      break;
    case ConnectionStatus.ERROR:
      actual = <b>Error checking status</b>;
      break;
    default:
      break;
  }
  return (
    <div>
      {prefix}: {actual}
    </div>
  );
}

function GCStatusIndicator() {
  const { gcStatus } = useContext(GCContext);

  return renderStatus(gcStatus);
}

export default GCStatusIndicator;
