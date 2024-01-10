import GCConnectivity from '../routes/GCConnectivity';
import UILibrary from '../routes/UILibrary';
import SQLScheduler from '../routes/SQLScheduler';

const routes: Route[] = [
  { path: '/', element: <GCConnectivity />, label: 'GC Connectivity' },
  { path: '/ui-library', element: <UILibrary />, label: 'UI Library' },
  { path: '/sql-scheduler', element: <SQLScheduler />, label: 'SQL Scheduler' },
];

export default routes;
