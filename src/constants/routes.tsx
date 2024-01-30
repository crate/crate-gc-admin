import SQLConsole from '../routes/SQLConsole/SQLConsole';
import Users from '../routes/Users/Users';
import EnterpriseScreen from '../components/EnterpriseScreen';
import Tables from '../routes/Tables';
import { Route } from '../types';
import ScheduledJobs from '../routes/JobScheduler';
import Overview from '../routes/Overview/Overview.tsx';

const routes: Route[] = [
  {
    path: '/',
    element: (
      <div className="p-4">
        <Overview />
      </div>
    ),
    label: 'Overview',
    key: 'overview',
  },
  {
    path: '/sql',
    element: (
      <div className="p-4">
        <SQLConsole />
      </div>
    ),
    label: 'SQL',
    key: 'sql',
  },
  {
    path: '/tables',
    element: <Tables />,
    label: 'Tables',
    key: 'tables',
  },
  {
    path: '/sql-scheduler',
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <ScheduledJobs />
        </EnterpriseScreen>
      </div>
    ),
    label: 'Scheduler',
    key: 'sql-scheduler',
  },
  {
    path: '/users',
    element: (
      <div className="p-4">
        <Users />
      </div>
    ),
    label: 'Users',
    key: 'users',
  },
];

export default routes;
