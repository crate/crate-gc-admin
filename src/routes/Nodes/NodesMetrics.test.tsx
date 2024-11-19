import { render, screen } from '../../../test/testUtils';
import NodesMetrics from '.';
import server from 'test/msw';
import { NODE_STATUS_THRESHOLD } from 'constants/database';
import prettyBytes from 'pretty-bytes';
import { VERTICAL_PROGRESS_BARS } from 'components/VerticalProgress/VerticalProgress';
import { formatNum } from 'utils';
import useSessionStore from 'src/state/session';
import { rest } from 'msw';
import { useClusterNodeStatusMock } from 'test/__mocks__/useClusterNodeStatusMock';
import { clusterNode } from 'test/__mocks__/nodes';
import { useShardsMock } from 'test/__mocks__/useShardsMock';
import { postFetch } from 'src/swr/jwt/useShards';
import { QueryResultSuccess } from 'types/query';

const setup = () => {
  return render(<NodesMetrics />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
};

const { fsStats } = useSessionStore.getState();

const changeStats = (fsUsedPercent: number, heapUsedPercent: number) => {
  // would be nicer to use structuredClone here...
  const resultsMock: QueryResultSuccess = JSON.parse(
    JSON.stringify(useClusterNodeStatusMock),
  );

  // heap
  resultsMock.rows[0][3] = {
    ...resultsMock.rows[0][3],
    used: (heapUsedPercent / 100) * resultsMock.rows[0][3].max,
  };

  // fs
  resultsMock.rows[0][4] = {
    ...resultsMock.rows[0][4],
    total: {
      ...resultsMock.rows[0][4].total,
      used: (fsUsedPercent / 100) * resultsMock.rows[0][4].total.size,
    },
  };

  return resultsMock;
};

const notMasterNode = JSON.parse(JSON.stringify(useClusterNodeStatusMock));
notMasterNode.rows[0][0] = 'NOT_MASTER_NODE';

const unreachableNode = changeStats(0, 0);
const warningNode = changeStats(
  NODE_STATUS_THRESHOLD.WARNING + 1,
  NODE_STATUS_THRESHOLD.WARNING + 1,
);
const criticalNode = changeStats(
  NODE_STATUS_THRESHOLD.CRITICAL + 1,
  NODE_STATUS_THRESHOLD.CRITICAL + 1,
);

const shards = postFetch(useShardsMock);

describe('The Nodes component', () => {
  it('renders a loader while loading the nodes', async () => {
    setup();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the "Node" cell', () => {
    it('shows the node name', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(clusterNode.name)).toBeInTheDocument();
    });

    it('shows the hostname', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(clusterNode.hostname)).toBeInTheDocument();
    });

    it('shows CrateDB version', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(`v${clusterNode.version.number}`)).toBeInTheDocument();
    });

    it('shows cluster specs', async () => {
      setup();

      await waitForTableRender();

      const clusterRam = prettyBytes(clusterNode.mem.free + clusterNode.mem.used, {
        maximumFractionDigits: 0,
      });

      expect(
        screen.getByText(
          `${clusterNode.os_info.available_processors} CPU Cores | ${clusterRam} RAM`,
        ),
      ).toBeInTheDocument();
    });

    it('shows node attributes', async () => {
      setup();

      await waitForTableRender();

      const attributes = Object.keys(clusterNode.attributes);
      expect(attributes.length).toBeGreaterThan(0);

      attributes.forEach(el => {
        expect(screen.getByText(`${el}: ${clusterNode.attributes[el]}`));
      });

      expect(screen.getByText(`v${clusterNode.version.number}`)).toBeInTheDocument();
    });

    describe('the master icon', () => {
      it('is shown if the node is master', async () => {
        setup();

        await waitForTableRender();

        expect(screen.getByTestId('master-node')).toBeInTheDocument();
      });

      it('is not shown if the node is not master', async () => {
        server.use(
          rest.post('http://localhost:4200/_sql', (req, res, ctx) => {
            const url = new URL(req.url);
            const ident = url.searchParams.get('ident');

            if (ident === '/use-cluster-node-status/undefined') {
              return res(ctx.json(notMasterNode));
            }
          }),
        );

        setup();

        await waitForTableRender();

        expect(screen.queryByTestId('master-node')).not.toBeInTheDocument();

        server.restoreHandlers();
      });
    });

    describe('the status light', () => {
      it('shows the unreachable status light when node is in unreachable status', async () => {
        server.use(
          rest.post('http://localhost:4200/_sql', (req, res, ctx) => {
            const url = new URL(req.url);
            const ident = url.searchParams.get('ident');

            if (ident === '/use-cluster-node-status/undefined') {
              return res(ctx.json(unreachableNode));
            }
          }),
        );

        setup();

        await waitForTableRender();

        expect(screen.getByTestId('unreachable-node')).toBeInTheDocument();

        server.restoreHandlers();
      });

      it('shows the warning status light when node is in warning status', async () => {
        server.use(
          rest.post('http://localhost:4200/_sql', (req, res, ctx) => {
            const url = new URL(req.url);
            const ident = url.searchParams.get('ident');

            if (ident === '/use-cluster-node-status/undefined') {
              return res(ctx.json(warningNode));
            }
          }),
        );

        setup();

        await waitForTableRender();

        expect(screen.getByTestId('warning-node')).toBeInTheDocument();

        server.restoreHandlers();
      });

      it('shows the critical status light when node is in critical status', async () => {
        server.use(
          rest.post('http://localhost:4200/_sql', (req, res, ctx) => {
            const url = new URL(req.url);
            const ident = url.searchParams.get('ident');

            if (ident === '/use-cluster-node-status/undefined') {
              return res(ctx.json(criticalNode));
            }
          }),
        );

        setup();

        await waitForTableRender();

        expect(screen.getByTestId('critical-node')).toBeInTheDocument();

        server.restoreHandlers();
      });

      it('shows the good status light when node is in good status', async () => {
        setup();

        await waitForTableRender();

        expect(screen.getByTestId('good-node')).toBeInTheDocument();
      });
    });
  });

  describe('the "Load" cell', () => {
    it('shows the 1min load', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(formatNum(clusterNode.load[1])!)).toBeInTheDocument();
    });

    it('shows the 5min load', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(formatNum(clusterNode.load[5])!)).toBeInTheDocument();
    });

    it('shows the 15min load', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(formatNum(clusterNode.load[15])!)).toBeInTheDocument();
    });

    it('shows the load progress bar', async () => {
      setup();

      await waitForTableRender();

      const max = clusterNode.os_info.available_processors;
      const current = clusterNode.load[1];
      const filled = Math.floor((current / max) * VERTICAL_PROGRESS_BARS);

      expect(screen.getByTestId('load-progress')).toBeInTheDocument();

      const verticalProgress = screen.getByTestId('load-progress');
      expect(verticalProgress.getElementsByClassName('bg-crate-blue')).toHaveLength(
        filled,
      );
    });
  });

  describe('the "Heap Usage" cell', () => {
    it('shows the used heap', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByText(prettyBytes(clusterNode.heap.used)),
      ).toBeInTheDocument();
    });

    it('shows the free heap', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByText(prettyBytes(clusterNode.heap.free)),
      ).toBeInTheDocument();
    });

    it('shows the max heap', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByText(prettyBytes(clusterNode.heap.max)),
      ).toBeInTheDocument();
    });

    it('shows the heap progress bar', async () => {
      setup();

      await waitForTableRender();

      const max = clusterNode.heap.max;
      const current = clusterNode.heap.used;
      const filled = Math.floor((current / max) * VERTICAL_PROGRESS_BARS);
      expect(screen.getByTestId('heap-progress')).toBeInTheDocument();

      const verticalProgress = screen.getByTestId('heap-progress');
      expect(verticalProgress.getElementsByClassName('bg-crate-blue')).toHaveLength(
        filled,
      );
    });
  });

  describe('the "Disk" cell', () => {
    it('shows the used disk', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByText(prettyBytes(clusterNode.fs.total.used)),
      ).toBeInTheDocument();
    });

    it('shows the available disk', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByText(prettyBytes(clusterNode.fs.total.available)),
      ).toBeInTheDocument();
    });

    it('shows the disk size', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByText(prettyBytes(clusterNode.fs.total.size)),
      ).toBeInTheDocument();
    });

    it('shows the disk progress bar', async () => {
      setup();

      await waitForTableRender();

      const max = clusterNode.fs.total.size;
      const current = clusterNode.fs.total.used;
      const filled = Math.floor((current / max) * VERTICAL_PROGRESS_BARS);

      expect(screen.getByTestId('disk-progress')).toBeInTheDocument();

      const verticalProgress = screen.getByTestId('disk-progress');

      expect(verticalProgress.getElementsByClassName('bg-crate-blue')).toHaveLength(
        filled,
      );
    });
  });

  describe('the "Disk operations" cell', () => {
    it('renders a loader initially', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('loading-fs')).toBeInTheDocument();
    });

    describe('after updating the stats', () => {
      const stats = {
        iops_write: 10,
        iops_read: 5,
        bps_write: 20,
        bps_read: 25,
      };
      beforeAll(() => {
        fsStats[clusterNode.id] = stats;
      });

      it('shows reads iops', async () => {
        setup();

        await waitForTableRender();

        expect(screen.queryByTestId('loading-fs')).not.toBeInTheDocument();

        expect(screen.getByText(`${formatNum(stats.iops_read, 0)} iops`));
      });

      it('shows write iops', async () => {
        setup();

        await waitForTableRender();

        expect(screen.queryByTestId('loading-fs')).not.toBeInTheDocument();

        expect(screen.getByText(`${formatNum(stats.iops_write, 0)} iops`));
      });

      it('shows read rate', async () => {
        setup();

        await waitForTableRender();

        expect(screen.queryByTestId('loading-fs')).not.toBeInTheDocument();

        expect(
          screen.getByText(
            `${prettyBytes(stats.bps_read, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}/s`,
          ),
        );
      });

      it('shows write rate', async () => {
        setup();

        await waitForTableRender();

        expect(screen.queryByTestId('loading-fs')).not.toBeInTheDocument();

        expect(
          screen.getByText(
            `${prettyBytes(stats.bps_write, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}/s`,
          ),
        );
      });
    });
  });

  describe('the "Shards" cell', () => {
    it('shows the initializing shards', async () => {
      setup();

      await waitForTableRender();

      const initializingShards = shards.filter(
        s => s.node_id == clusterNode.id && s.routing_state == 'INITIALIZING',
      ).length;

      expect(screen.getByTestId('initializing-shards')).toHaveTextContent(
        initializingShards.toString(),
      );
    });

    it('shows the started shards', async () => {
      setup();

      await waitForTableRender();

      const startedShards = shards
        .filter(s => s.node_id == clusterNode.id && s.routing_state == 'STARTED')
        .reduce((prev, next) => {
          return prev + next.number_of_shards;
        }, 0);

      expect(screen.getByTestId('started-shards')).toHaveTextContent(
        startedShards.toString(),
      );
    });

    it('shows the relocating shards', async () => {
      setup();

      await waitForTableRender();

      const relocatingShards = shards
        .filter(s => s.node_id == clusterNode.id && s.routing_state == 'RELOCATING')
        .reduce((prev, next) => {
          return prev + next.number_of_shards;
        }, 0);

      expect(screen.getByTestId('relocating-shards')).toHaveTextContent(
        relocatingShards.toString(),
      );
    });
  });
});
