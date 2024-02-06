import { Auth, Help, Overview, SQLConsole, Tables, Users } from '../routes';
import EnterpriseScreen from '../components/EnterpriseScreen';
import { Route } from '../types';
import ScheduledJobs from '../routes/JobScheduler';

const routes: Route[] = [
  {
    path: '/auth',
    element: <Auth />,
  },
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
    path: '/help',
    element: (
      <div className="p-4">
        <Help />
      </div>
    ),
    label: 'Help',
    key: 'help',
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
    path: '/tables',
    element: <Tables />,
    label: 'Tables',
    key: 'tables',
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
