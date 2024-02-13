import { Route, Routes } from 'react-router-dom';
import { bottomNavigation, topNavigation } from './constants/navigation';
import routes from './constants/routes';
import { useMemo, useState } from 'react';
import { ConnectionStatus, GCContextProvider } from './contexts';
import Layout from './components/Layout';
import StatusBar from './components/StatusBar';
import NotificationHandler from './components/NotificationHandler';
import logo from './assets/logo.svg';
import StatsUpdater from './components/StatsUpdater';
import useGcApi from './hooks/useGcApi.ts';
import { apiGet } from './utils/api.ts';
import { GRAND_CENTRAL_TOKEN_COOKIE } from './constants/cookie.ts';

function App() {
  const [gcStatus, setGCStatus] = useState(ConnectionStatus.PENDING);
  const gcApi = useGcApi();

  useMemo(() => {
    apiGet(gcApi, `/api/`, {})
      .then(res => {
        if (res.status == 200) {
          setGCStatus(ConnectionStatus.CONNECTED);
        } else if (res.status == 401) {
          setGCStatus(ConnectionStatus.NOT_LOGGED_IN);
        } else {
          setGCStatus(ConnectionStatus.ERROR);
        }
      })
      .catch(() => {
        setGCStatus(ConnectionStatus.ERROR);
      });
  }, []);

  const gcUrl = process.env.REACT_APP_GRAND_CENTRAL_URL;
  const crateUrl = process.env.REACT_APP_CRATE_URL;

  return (
    <GCContextProvider
      gcStatus={gcStatus}
      gcUrl={gcUrl}
      crateUrl={crateUrl}
      sessionCookieName={GRAND_CENTRAL_TOKEN_COOKIE}
    >
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
