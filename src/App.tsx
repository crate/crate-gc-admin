import { Link, Route, Routes } from 'react-router-dom';
import { bottomNavigation, topNavigation } from 'constants/navigation';
import routes from 'constants/routes';
import { useMemo, useState } from 'react';
import { ConnectionStatus, GCContextProvider } from 'contexts';
import { Layout, StatusBar, StatsUpdater } from 'components';
import logo from './assets/logo.svg';
import useGcApi from 'hooks/useGcApi';
import { apiGet } from 'utils/api';
import { GRAND_CENTRAL_SESSION_TOKEN_KEY } from 'constants/session';
import NotificationHandler from 'components/NotificationHandler';
import { root } from 'constants/paths';

function App() {
  const [gcStatus, setGCStatus] = useState(ConnectionStatus.PENDING);
  const gcApi = useGcApi();

  useMemo(() => {
    apiGet(gcApi, `/api/`)
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
      sessionTokenKey={GRAND_CENTRAL_SESSION_TOKEN_KEY}
    >
      <StatsUpdater />
      <Layout
        topbarLogo={
          <Link to={root.build()}>
            <img alt="CrateDB logo" src={logo} />
          </Link>
        }
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
