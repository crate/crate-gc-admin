import {
  Auth,
  Help,
  Nodes,
  Overview,
  SQLConsole,
  Tables,
  TablesShards,
  Users,
} from 'routes';
import {
  AutomationJobsTable,
  AutomationCreateJob,
  AutomationEditJob,
  AutomationPoliciesTable,
  AutomationCreatePolicy,
  AutomationEditPolicy,
  AutomationLogs,
} from 'routes/Automation';
import { EnterpriseScreen, Heading } from 'components';
import { Route } from 'types';
import {
  auth,
  automationScheduledJobs,
  automationCreateJob,
  automationEditJob,
  automationTablePolicies,
  automationCreatePolicy,
  automationEditPolicy,
  automationLogs,
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
    path: automationScheduledJobs.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Scheduled Jobs
            </Heading>
            <AutomationJobsTable />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Scheduled Jobs',
    key: 'scheduledJobs',
  },
  {
    path: automationCreateJob.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Create Scheduled Job
            </Heading>
            <AutomationCreateJob />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Create Scheduled Job',
    key: 'createJob',
  },
  {
    path: automationEditJob.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Edit Scheduled Job
            </Heading>
            <AutomationEditJob />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Create Scheduled Job',
    key: 'createJob',
  },
  {
    path: automationTablePolicies.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Table Policies
            </Heading>
            <AutomationPoliciesTable />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Table Policies',
    key: 'tablepolicies',
  },
  {
    path: automationCreatePolicy.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Create TablePolicy
            </Heading>
            <AutomationCreatePolicy />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Create Table Policy',
    key: 'createPolicy',
  },
  {
    path: automationEditPolicy.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Edit Table Policy
            </Heading>
            <AutomationEditPolicy />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Edit Table Policy',
    key: 'editPolicy',
  },
  {
    path: automationLogs.path,
    element: (
      <div className="p-4">
        <EnterpriseScreen>
          <>
            <Heading level={Heading.levels.h1} className="mb-2">
              Automation Logs
            </Heading>
            <AutomationLogs />
          </>
        </EnterpriseScreen>
      </div>
    ),
    label: 'Logs',
    key: 'automationLogs',
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
