import React from 'react';
import { ConnectionStatus } from '../../utils/gc/connectivity';
import { useGCContext } from '../../utils/context';

function renderStatus(status: ConnectionStatus) {
  const prefix = 'GC';
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
    <div className="block max-w-96 mx-auto px-4 py-2 border-crate-border-dark bg-slate-600 text-white">
      {prefix}: {actual}
    </div>
  );
}

function GCStatusIndicator() {
  const { gcStatus } = useGCContext();

  return renderStatus(gcStatus);
}

export default GCStatusIndicator;
