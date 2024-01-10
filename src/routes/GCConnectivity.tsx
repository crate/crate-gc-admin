import { useEffect, useState } from 'react';

function GCConnectivity() {
  const [status, setStatus] = useState(false);
  const [cluster, setCluster] = useState(null);

  useEffect(() => {
    const doFetch = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_GRAND_CENTRAL_URL}/api/`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      if (response.status === 200) {
        setStatus(true);
      }
      const json = await response.json();
      setCluster(json.cluster_id);
    };

    doFetch();
  }, []);

  return (
    <>
      <h1 className="mb-2 text-2xl">Grand Central Connectivity</h1>
      <p>Are we logged in: {status ? 'Yes' : 'No'}</p>
      <p>Cluster: {cluster}</p>
      <p>
        Grand Central Backend at:{' '}
        <b>
          {process.env.REACT_APP_GRAND_CENTRAL_URL
            ? process.env.REACT_APP_GRAND_CENTRAL_URL
            : 'Please set env REACT_APP_GRAND_CENTRAL_URL'}
        </b>
      </p>
    </>
  );
}

export default GCConnectivity;
