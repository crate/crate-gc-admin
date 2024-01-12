import UILibrary from '../routes/UILibrary';
import SQLScheduler from '../routes/SQLScheduler';
import SQLConsole from '../routes/SQLConsole/SQLConsole';
import Users from '../routes/Users/Users';
import EnterpriseScreen from '../components/EnterpriseScreen/EnterpriseScreen';

const routes: Route[] = [
  { path: '/', element: <SQLConsole />, label: 'SQL' },
  { path: '/ui-library', element: <UILibrary />, label: 'UI Library' },
  {
    path: '/sql-scheduler',
    element: (
      <EnterpriseScreen>
        <SQLScheduler />
      </EnterpriseScreen>
    ),
    label: 'SQL Scheduler',
  },
  { path: '/users', element: <Users />, label: 'Users' },
];

export default routes;
