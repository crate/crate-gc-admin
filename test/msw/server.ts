import { SetupServer, setupServer } from 'msw/node';
import { handlers } from './handlers';

const server: SetupServer = setupServer(...handlers);

export default server;
