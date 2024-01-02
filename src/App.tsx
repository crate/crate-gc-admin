import React, {useEffect, useState} from 'react';
import { Button } from "@crate/crate-ui-components";

function App() {

  const [status, setStatus] = useState(false);
  const [cluster, setCluster] = useState(null);

  useEffect(() => {
    const doFetch = async () => {
      const response = await fetch(`${process.env.REACT_APP_GRAND_CENTRAL_URL}/api/`, {
        method: 'GET', credentials: 'include'
      });
      if (response.status === 200) {
        setStatus(true);
      }
      const json = await response.json();
      setCluster(json.cluster_id);
    }

    doFetch();
  }, []);

  return (
      <div className="p-4 flex gap-4">
          <p>
              Are we logged in: {status ? "Yes" : "No"}
          </p>
          <p>
              Cluster: {cluster}
          </p>
          <p>
              Grand Central Backend
              at: <b>{process.env.REACT_APP_GRAND_CENTRAL_URL ? process.env.REACT_APP_GRAND_CENTRAL_URL : "Please set env REACT_APP_GRAND_CENTRAL_URL"}</b>
          </p>
          <Button kind={Button.kinds.PRIMARY}>Primary Button</Button>
          <Button kind={Button.kinds.SECONDARY}>Secondary Button</Button>
          <Button kind={Button.kinds.TERTIARY}>Tertiary Button</Button>
          <Button loading>Loading Button</Button>
      </div>
  );
}

export default App;
