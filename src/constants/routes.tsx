import SQLConsole from '../routes/SQLConsole/SQLConsole';
import Users from '../routes/Users/Users';
import EnterpriseScreen from '../components/EnterpriseScreen/EnterpriseScreen';
import Tables from '../routes/Tables/Tables';
import { Route } from '../types';
import ScheduledJobs from '../routes/JobScheduler';
import Overview from '../routes/Overview/Overview.tsx';

const routes: Route[] = [
  { path: '/', element: <Overview />, label: 'Overview', key: 'overview' },
  { path: '/sql', element: <SQLConsole />, label: 'SQL', key: 'sql' },
  { path: '/tables', element: <Tables />, label: 'Tables', key: 'tables' },
  {
    path: '/sql-scheduler',
    element: (
      <EnterpriseScreen>
        <ScheduledJobs />
      </EnterpriseScreen>
    ),
    label: 'Scheduler',
    key: 'sql-scheduler',
  },
  { path: '/users', element: <Users />, label: 'Users', key: 'users' },
];

export default routes;
