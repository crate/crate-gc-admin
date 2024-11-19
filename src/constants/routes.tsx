import {
  Auth,
  Automation,
  Help,
  Nodes,
  Overview,
  SQLConsole,
  Tables,
  TablesShards,
  Users,
} from 'routes';
import { EnterpriseScreen } from 'components';
import { Route } from 'types';
import {
  auth,
  automation,
  help,
  nodes,
  root,
  sql,
  tables,
  tablesShards,
  users,
} from './paths';

const routes: Route[] = [
  {
    path: auth.path,
    element: <Auth />,
  },
  {
    path: root.path,
    element: (
      <div className="p-4">
        <Overview />
      </div>
    ),
    label: 'Overview',
    key: 'overview',
  },
  {
    path: help.path,
    element: (
      <div className="p-4">
        <Help />
      </div>
    ),
    label: 'Help',
    key: 'help',
  },
  {
    path: sql.path,
    element: <SQLConsole />,
    label: 'SQL',
    key: 'sql',
  },
  {
    path: `${automation.path}/*`,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <Automation />
        </EnterpriseScreen>
      </div>
    ),
    label: 'Automation',
    key: 'automation',
  },
  {
    path: tablesShards.path,
    element: <TablesShards />,
    label: 'Shards',
    key: 'tablesShards',
  },
  {
    path: tables.path,
    element: <Tables />,
    label: 'Tables',
    key: 'tables',
  },
  {
    path: nodes.path,
    element: <Nodes />,
    label: 'Nodes',
    key: 'nodes',
  },
  {
    path: users.path,
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
