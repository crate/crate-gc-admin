import { bottomNavigation, topNavigation } from 'constants/navigation';
import { Link, Route, Routes } from 'react-router-dom';
import { root } from 'constants/paths';
import routes from 'constants/routes';
import { apiGet } from 'utils/api';
import { useEffect } from 'react';
import { Layout, StatusBar, GcAdminAntdProvider } from 'components';
import ClusterHealthManager from 'components/ClusterHealthManager';
import NotificationHandler from 'components/NotificationHandler';
import useJWTManagerStore from 'state/jwtManager';
import { ConnectionStatus } from 'types';
import useGcApi from 'hooks/useGcApi';
import logo from './assets/logo.svg';

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
      <ClusterHealthManager clusterId="" />
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
