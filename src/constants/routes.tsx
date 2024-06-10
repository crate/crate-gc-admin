import { Auth, Help, Overview, SQLConsole, Tables, Users, Nodes } from 'routes';
import { EnterpriseScreen } from 'components';
import { Route } from 'types';
import { auth, automation, help, nodes, root, sql, tables, users } from './paths';
import Automation from 'routes/Automation';

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
