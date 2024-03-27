import {
  Auth,
  Help,
  Overview,
  SQLConsole,
  Tables,
  Users,
  Nodes,
  JobScheduler,
  TableLifecycle,
} from 'routes';
import { EnterpriseScreen } from 'components';
import { Route } from 'types';

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
    path: '/sql-scheduler/*',
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <JobScheduler />
        </EnterpriseScreen>
      </div>
    ),
    label: 'Scheduler',
    key: 'sql-scheduler',
  },
  {
    path: '/table-lifecycle/*',
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <TableLifecycle />
        </EnterpriseScreen>
      </div>
    ),
    label: 'Table Lifecycle',
    key: 'table-lifecycle',
  },
  {
    path: '/tables',
    element: <Tables />,
    label: 'Tables',
    key: 'tables',
  },
  {
    path: '/nodes',
    element: <Nodes />,
    label: 'Nodes',
    key: 'nodes',
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
