import {
  Auth,
  Help,
  Overview,
  SQLConsole,
  Tables,
  Users,
  Nodes,
  JobScheduler,
  TablePolicies,
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
    element: <SQLConsole />,
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
    path: '/table-policies/*',
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <TablePolicies />
        </EnterpriseScreen>
      </div>
    ),
    label: 'Table Policies',
    key: 'table-policies',
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
