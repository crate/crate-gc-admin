import { ConnectionStatus } from 'types';
import useJWTManagerStore from 'state/jwtManager';

function renderStatus(status: ConnectionStatus) {
  const prefix = 'GC';
  let actual = <b>Checking ...</b>;
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
      actual = <b>Unavailable</b>;
      break;
    default:
      break;
  }
  return (
    <div className="mx-auto block max-w-96 border-crate-border-dark bg-slate-600 px-4 py-2 text-white">
      {prefix}: {actual}
    </div>
  );
}

function GCStatusIndicator() {
  const gcStatus = useJWTManagerStore(state => state.gcStatus);

  return renderStatus(gcStatus);
}

export default GCStatusIndicator;
