import ClusterHealthManager, {
  ClusterHealthManagerProps,
} from './ClusterHealthManager';
import { useClusterNodeStatusMock } from 'test/__mocks__/useClusterNodeStatusMock';
import { useClusterInfoMock } from 'test/__mocks__/useClusterInfoMock';
import server, { customExecuteJWTQueryResponse } from 'test/msw';
import { act, render, waitFor } from '../../../test/testUtils';
import useClusterHealthStore from 'state/clusterHealth';
import { QueryResultSuccess } from 'types/query';

const CLUSTER_ID = 'test-cluster-id';
const defaultProps: ClusterHealthManagerProps = {
  clusterId: CLUSTER_ID,
};

const setup = (props: Partial<ClusterHealthManagerProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<ClusterHealthManager {...combinedProps} />);
};

const makeNodeRow = (diskUsed: number, diskSize: number) => {
  const row = JSON.parse(JSON.stringify(useClusterNodeStatusMock.rows[0]));
  row[4].total.used = diskUsed;
  row[4].total.size = diskSize;
  return row;
};

const mockNodeStatus = (rows: [][]) => {
  const nodeMock: QueryResultSuccess = { ...useClusterNodeStatusMock, rows };
  server.use(
    customExecuteJWTQueryResponse({ '/use-cluster-node-status': nodeMock }),
  );
};

describe('ClusterHealthManager', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    act(() => {
      useClusterHealthStore.setState({ clusterHealth: {} });
    });
  });

  afterAll(() => {
    server.close();
  });

  describe('load', () => {
    it('populates the store with load data when nodes are available', async () => {
      setup();

      await waitFor(() => {
        const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
        expect(health).toBeDefined();
        expect(health.load.length).toBeGreaterThan(0);
      });
    });

    it('stores the averaged load values across all nodes', async () => {
      setup();

      await waitFor(() => {
        const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
        const latest = health?.load[health.load.length - 1];
        expect(latest?.['1']).toBe(8);
        expect(latest?.['5']).toBe(4);
        expect(latest?.['15']).toBe(2);
      });
    });
  });

  describe('diskWatermark', () => {
    describe("disk usage is below the cluster's LOW threshold", () => {
      beforeEach(() => {
        mockNodeStatus([makeNodeRow(0, 100)]);
      });

      it('is null when disk usage is below the LOW threshold', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBeNull();
        });
      });
    });

    describe("disk usage is above the cluster's LOW threshold", () => {
      beforeEach(() => {
        mockNodeStatus([makeNodeRow(87, 100)]);
      });

      it('sets LOW level when disk usage exceeds the LOW threshold (default 85%)', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBe('LOW');
        });
      });
    });

    describe("disk usage is above the cluster's HIGH threshold", () => {
      beforeEach(() => {
        mockNodeStatus([makeNodeRow(92, 100)]);
      });

      it('sets HIGH level when disk usage exceeds the HIGH threshold', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBe('HIGH');
        });
      });
    });

    describe("disk usage is above the cluster's FLOOD_STAGE threshold", () => {
      beforeEach(() => {
        mockNodeStatus([makeNodeRow(97, 100)]);
      });

      it('sets FLOOD_STAGE level when disk usage exceeds the FLOOD_STAGE threshold', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBe('FLOOD_STAGE');
        });
      });
    });

    describe('when the watermark thresholds are coming from cluster settings', () => {
      beforeEach(() => {
        const clusterRow = JSON.parse(JSON.stringify(useClusterInfoMock.rows[0]));
        clusterRow[3].cluster.routing.allocation.disk.watermark = { low: '70%' };
        const clusterMock: QueryResultSuccess = {
          ...useClusterInfoMock,
          rows: [clusterRow],
        };

        server.use(
          customExecuteJWTQueryResponse({
            '/use-cluster-node-status': {
              ...useClusterNodeStatusMock,
              rows: [makeNodeRow(75, 100)],
            },
            '/use-cluster-info': clusterMock,
          }),
        );
      });

      it('uses custom watermark thresholds from cluster settings', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBe('LOW');
        });
      });
    });

    describe('when two nodes have different disk usage levels', () => {
      beforeEach(() => {
        mockNodeStatus([makeNodeRow(97, 100), makeNodeRow(87, 100)]);
      });

      it('reports the highest watermark level when multiple nodes have different levels', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBe('FLOOD_STAGE');
        });
      });
    });

    describe('when there is no disk size returned', () => {
      beforeEach(() => {
        mockNodeStatus([]);
      });
      it('is null for nodes with zero disk size', async () => {
        setup();
        await waitFor(() => {
          const health = useClusterHealthStore.getState().clusterHealth[CLUSTER_ID];
          expect(health?.diskWatermark?.disksWatermarkStatus).toBeUndefined();
        });
      });
    });
  });
});
