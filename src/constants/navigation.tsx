import {
  CodeOutlined,
  DatabaseOutlined,
  QuestionCircleOutlined,
  ToolOutlined,
  UserOutlined,
  ClusterOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { automation, help, root, sql, tables, users } from './paths';

export const topNavigation = [
  {
    icon: <ToolOutlined />,
    label: <span>Overview</span>,
    path: root.path,
    type: 'internal' as const,
  },
  {
    icon: <CodeOutlined />,
    label: <span>SQL console</span>,
    path: sql.path,
    type: 'internal' as const,
  },
  {
    icon: <DatabaseOutlined />,
    label: <span>Tables</span>,
    path: tables.path,
    type: 'internal' as const,
  },
  {
    icon: <ClusterOutlined />,
    label: <span>Nodes</span>,
    path: '/nodes',
    type: 'internal' as const,
  },
  {
    icon: <CalendarOutlined />,
    label: <span>Automation</span>,
    path: automation.path,
    type: 'internal' as const,
  },
  {
    icon: <UserOutlined />,
    label: <span>Users</span>,
    path: users.path,
    type: 'internal' as const,
  },
];

export const bottomNavigation = [
  {
    icon: <QuestionCircleOutlined />,
    label: <span>Help</span>,
    path: help.path,
    type: 'internal' as const,
  },
];
