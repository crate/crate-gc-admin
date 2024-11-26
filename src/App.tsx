import { Link, Route, Routes } from 'react-router-dom';
import { bottomNavigation, topNavigation } from 'constants/navigation';
import routes from 'constants/routes';
import { useEffect } from 'react';
import { ConnectionStatus } from 'types';
import { Layout, StatusBar, StatsUpdater, GcAdminAntdProvider } from 'components';
import logo from './assets/logo.svg';
import useGcApi from 'hooks/useGcApi';
import { apiGet } from 'utils/api';
import NotificationHandler from 'components/NotificationHandler';
import { root } from 'constants/paths';
import useJWTManagerStore from 'state/jwtManager';

function App() {
  const hasToken = useJWTManagerStore(state => state.hasToken);
  const setGcStatus = useJWTManagerStore(state => state.setGcStatus);
  const gcApi = useGcApi();

  useEffect(() => {
    if (!hasToken()) {
      setGcStatus(ConnectionStatus.NOT_LOGGED_IN);
      return;
    }

    apiGet(gcApi, `/api/`)
      .then(res => {
        if (res.status == 200) {
          setGcStatus(ConnectionStatus.CONNECTED);
        } else if (res.status == 401) {
          setGcStatus(ConnectionStatus.NOT_LOGGED_IN);
        } else {
          setGcStatus(ConnectionStatus.ERROR);
        }
      })
      .catch(() => {
        setGcStatus(ConnectionStatus.ERROR);
      });
  }, []);

  return (
    <GcAdminAntdProvider>
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
    </GcAdminAntdProvider>
  );
}

export default App;
