import { QueryResultSuccess } from 'types/query';

export const useClusterNodeStatusMock: QueryResultSuccess = {
  col_types: [],
  cols: [],
  rows: [
    [
      'BFHeuv7bRGyPFSYNS2k8eQ',
      'cratedb',
      '9fb7b3dfbded',
      {
        used: 889502872,
        free: 1257980776,
        max: 2147483648,
        probe_timestamp: 1713516274938,
      },
      {
        disks: [
          {
            available: 674506829824,
            used: 299311636480,
            dev: '/data (/dev/mapper/data_qZbu7-root)',
            size: 973818466304,
          },
        ],
        data: [
          {
            dev: '/data (/dev/mapper/data_qZbu7-root)',
            path: '/data/data/nodes/0',
          },
        ],
        total: {
          bytes_written: 0,
          size: 1000240963584,
          available: 851841318912,
          reads: 0,
          bytes_read: 0,
          used: 148399644672,
          writes: 0,
        },
      },
      {
        '1': 8,
        '5': 4,
        '15': 2,
        probe_timestamp: 1713516274941,
      },
      {
        number: '5.6.4',
        build_snapshot: false,
        minimum_index_compatibility_version: '4.0.0',
        minimum_wire_compatibility_version: '4.0.0',
        build_hash: '5db11af8fd8c8f717338f6c64b36a78e39794905',
      },
      0,
      16,
      '172.23.0.2:4200',
      {
        available_processors: 16,
        name: 'Linux',
        jvm: {
          vm_vendor: 'Eclipse Adoptium',
          vm_version: '21.0.2+13-LTS',
          version: '21.0.2',
          vm_name: 'OpenJDK 64-Bit Server VM',
        },
        arch: 'amd64',
        version: '6.5.11-linuxkit',
      },
      1730783047800,
      {
        attribute_key: 'attribute_value',
      },
      {
        free_percent: 22,
        used_percent: 78,
        used: 6429339648,
        free: 1800056832,
        probe_timestamp: 1730783047812,
      },
    ],
  ],
  rowcount: 1,
  duration: 123.45,
};
