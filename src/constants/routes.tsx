import UILibrary from '../routes/UILibrary';
import SQLScheduler from '../routes/SQLScheduler';
import SQLConsole from '../routes/SQLConsole/SQLConsole';
import Users from '../routes/Users/Users';
import EnterpriseScreen from '../components/EnterpriseScreen/EnterpriseScreen';
import Tables from '../routes/Tables/Tables';

const routes: Route[] = [
  { path: '/', element: <SQLConsole />, label: 'SQL', key: 'sql' },
  { path: '/tables', element: <Tables />, label: 'Tables', key: 'tables' },
  {
    path: '/ui-library',
    element: <UILibrary />,
    label: 'UI Library',
    key: 'ui-library',
  },
  {
    path: '/sql-scheduler',
    element: (
      <EnterpriseScreen>
        <SQLScheduler />
      </EnterpriseScreen>
    ),
    label: 'SQL Scheduler',
    key: 'sql-scheduler',
  },
  { path: '/users', element: <Users />, label: 'Users', key: 'users' },
];

export default routes;
