import { Route, Routes } from 'react-router-dom';
import Burger from './components/Burger';
import Navigation from './components/Navigation';
import routes from './constants/routes';
import { useMemo, useState } from 'react';
import { ConnectionStatus, isGcConnected } from './utils/gc/connectivity';
import { GCContextProvider } from './contexts';
import GCStatusIndicator from './components/GCStatusIndicator/GCStatusIndicator';
import StatusBar from './components/StatusBar/StatusBar';
import NotificationHandler from './components/NotificationHandler';

function App() {
  const [gcStatus, setGCStatus] = useState(ConnectionStatus.PENDING);

  useMemo(() => {
    isGcConnected(process.env.REACT_APP_GRAND_CENTRAL_URL).then(setGCStatus);
  }, []);

  const gcUrl = process.env.REACT_APP_GRAND_CENTRAL_URL;
  const crateUrl = process.env.REACT_APP_CRATE_URL;

  const getSQLUrl = () => {
    switch (gcStatus) {
      case ConnectionStatus.CONNECTED:
        return `${gcUrl}/api/_sql?multi=true&types`;
      default:
        return `${crateUrl}/_sql?types`;
    }
  };

  return (
    <GCContextProvider
      gcStatus={gcStatus}
      gcUrl={gcUrl}
      crateUrl={crateUrl}
      sqlUrl={getSQLUrl()}
    >
      <div className="bg-white min-h-dvh">
        <div className="bg-neutral-800 flex w-full px-6 py-3 h-[5vh]">
          <StatusBar />
        </div>
        <div className="flex min-h-[95vh]">
          <div className="bg-crate-blue hidden md:block">
            <Navigation routes={routes} />
            <div className="mt-4 border-dashed border-t pt-4 border-slate-600">
              <GCStatusIndicator />
            </div>
          </div>
          <div className="basis-full">
            <div className="flex justify-end p-4 md:hidden">
              <Burger routes={routes} />
            </div>
            <div className="p-4 w-full h-full">
              <Routes>
                {routes.map(route => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </div>
          </div>
        </div>
      </div>
      <NotificationHandler />
    </GCContextProvider>
  );
}

export default App;
