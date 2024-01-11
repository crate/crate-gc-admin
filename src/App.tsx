import { Route, Routes } from 'react-router-dom';
import Burger from './components/Burger';
import Navigation from './components/Navigation';
import routes from './constants/routes';
import React, { useMemo, useState } from 'react';
import { ConnectionStatus, isGcConnected } from './utilities/gc/connectivity';
import { GCContext } from './utilities/context';

function App() {
  const [gcStatus, setGCStatus] = useState(ConnectionStatus.PENDING);

  useMemo(() => {
    isGcConnected(process.env.REACT_APP_GRAND_CENTRAL_URL).then(setGCStatus);
  }, []);

  const gcUrl = process.env.REACT_APP_GRAND_CENTRAL_URL;
  const crateUrl = 'http://localhost:4200';

  const getSQLUrl = () => {
    switch (gcStatus) {
      case ConnectionStatus.CONNECTED:
        return `${gcUrl}/api/_sql?multi=true`;
      case ConnectionStatus.NOT_CONFIGURED:
      case ConnectionStatus.NOT_LOGGED_IN:
        return `${crateUrl}/_sql`;
      default:
        return;
    }
  };

  return (
    <div className="bg-white flex h-dvh max-h-screen">
      <div className="bg-crate-blue hidden md:block">
        <Navigation routes={routes} />
      </div>
      <div className="basis-full">
        <div className="flex justify-end p-4 md:hidden">
          <Burger routes={routes} />
        </div>
        <div className="p-4">
          <GCContext.Provider
            value={{
              gcStatus,
              gcUrl: gcUrl,
              crateUrl: crateUrl,
              sqlUrl: getSQLUrl(),
            }}
          >
            <Routes>
              {routes.map(route => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Routes>
          </GCContext.Provider>
        </div>
      </div>
    </div>
  );
}

export default App;
