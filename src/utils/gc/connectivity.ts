enum ConnectionStatus {
  CONNECTED,
  NOT_CONFIGURED,
  NOT_LOGGED_IN,
  ERROR,
  PENDING,
}

async function isGcConnected(gc_url: string | undefined) {
  if (!gc_url) {
    return ConnectionStatus.NOT_CONFIGURED;
  }
  let response;
  try {
    response = await fetch(`${gc_url}/api/`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (e) {
    return ConnectionStatus.ERROR;
  }
  if (response.status == 200) {
    return ConnectionStatus.CONNECTED;
  } else if (response.status == 401) {
    return ConnectionStatus.NOT_LOGGED_IN;
  }
  return ConnectionStatus.ERROR;
}

export { ConnectionStatus, isGcConnected };
