import { Route, Routes } from 'react-router-dom';
import { bottomNavigation, topNavigation } from './constants/navigation';
import routes from './constants/routes';
import { useMemo, useState } from 'react';
import { ConnectionStatus, isGcConnected } from './utils/gc/connectivity';
import { GCContextProvider } from './contexts';
import Layout from './components/Layout';
import StatusBar from './components/StatusBar';
import NotificationHandler from './components/NotificationHandler';
import logo from './assets/logo.svg';
import StatsUpdater from './components/StatsUpdater';

function App() {
  const [gcStatus, setGCStatus] = useState(ConnectionStatus.PENDING);

  useMemo(() => {
    isGcConnected(process.env.REACT_APP_GRAND_CENTRAL_URL).then(setGCStatus);
  }, []);

  const gcUrl = process.env.REACT_APP_GRAND_CENTRAL_URL;
  const crateUrl = process.env.REACT_APP_CRATE_URL;

  return (
    <GCContextProvider gcStatus={gcStatus} gcUrl={gcUrl} crateUrl={crateUrl}>
      <StatsUpdater />
      <Layout
        topbarLogo={<img alt="CrateDB logo" src={logo} />}
        topbarContent={<StatusBar />}
        bottomNavigation={bottomNavigation}
        topNavigation={topNavigation}
      >
        <Routes>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Layout>
      <NotificationHandler />
    </GCContextProvider>
  );
}

export default App;
