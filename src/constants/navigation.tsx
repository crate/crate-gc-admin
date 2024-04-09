import {
  CodeOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  QuestionCircleOutlined,
  ToolOutlined,
  UserOutlined,
  ClusterOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';

export const topNavigation = [
  {
    icon: <ToolOutlined />,
    label: <span>Overview</span>,
    path: '/',
    type: 'internal' as const,
  },
  {
    icon: <CodeOutlined />,
    label: <span>SQL console</span>,
    path: '/sql',
    type: 'internal' as const,
  },
  {
    icon: <DatabaseOutlined />,
    label: <span>Tables</span>,
    path: '/tables',
    type: 'internal' as const,
  },
  {
    icon: <ClusterOutlined />,
    label: <span>Nodes</span>,
    path: '/nodes',
    type: 'internal' as const,
  },
  {
    icon: <ClockCircleOutlined />,
    label: <span>SQL scheduler</span>,
    path: '/sql-scheduler',
    type: 'internal' as const,
  },
  {
    icon: <ScheduleOutlined />,
    label: <span>Table Policies</span>,
    path: '/table-policies',
    type: 'internal' as const,
  },
  {
    icon: <UserOutlined />,
    label: <span>Users</span>,
    path: '/users',
    type: 'internal' as const,
  },
];

export const bottomNavigation = [
  {
    icon: <QuestionCircleOutlined />,
    label: <span>Help</span>,
    path: '/help',
    type: 'internal' as const,
  },
];
