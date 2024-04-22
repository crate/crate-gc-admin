import { NodeStatusInfo } from 'types/cratedb';

export const clusterNodes: NodeStatusInfo[] = [
  {
    id: 'BFHeuv7bRGyPFSYNS2k8eQ',
    name: 'cratedb',
    hostname: '9fb7b3dfbded',
    heap: {
      used: 889502872,
      free: 1257980776,
      max: 2147483648,
      probe_timestamp: 1713516274938,
    },
    fs: {
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
    load: {
      '1': 8,
      '5': 4,
      '15': 2,
      probe_timestamp: 1713516274941,
    },
    version: {
      number: '5.6.4',
    },
    crate_cpu_usage: 0,
    available_processors: 16,
    rest_url: '172.23.0.2:4200',
    os_info: {
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
    timestamp: 1713516274933,
    attributes: {
      attribute_key: 'attribute_value',
    },
    mem: {
      free_percent: 22,
      used_percent: 78,
      used: 6429339648,
      free: 1800056832,
    },
  },
  {
    id: 'xXT-4KS1SO20mf7kY6DfWA',
    name: 'cratedb02',
    hostname: 'bbf3a78ed507',
    heap: {
      used: 1060020480,
      free: 1087463168,
      max: 2147483648,
      probe_timestamp: 1713516274938,
    },
    fs: {
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
    load: {
      '1': 0.03,
      '5': 0.06,
      '15': 0.02,
      probe_timestamp: 1713516274939,
    },
    version: {
      number: '5.6.4',
    },
    crate_cpu_usage: 0,
    available_processors: 16,
    rest_url: '172.23.0.3:4200',
    os_info: {
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
    timestamp: 1713516274933,
    attributes: {},
    mem: {
      free_percent: 22,
      used_percent: 78,
      used: 6429339648,
      free: 1800056832,
    },
  },
  {
    id: '5QAukOpWQDCTzn61eI6TfQ',
    name: 'cratedb03',
    hostname: 'fd9750a7404c',
    heap: {
      used: 99154384,
      free: 2048329264,
      max: 2147483648,
      probe_timestamp: 1713516274938,
    },
    fs: {
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
    load: {
      '1': 0.03,
      '5': 0.06,
      '15': 0.02,
      probe_timestamp: 1713516274940,
    },
    version: {
      number: '5.6.4',
    },
    crate_cpu_usage: 0,
    available_processors: 16,
    rest_url: '172.23.0.4:4200',
    os_info: {
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
    timestamp: 1713516274933,
    attributes: {
      attribute1: 'value1',
      attribute3: 'value3',
      attribute2: 'value2',
    },
    mem: {
      free_percent: 22,
      used_percent: 78,
      used: 6429339648,
      free: 1800056832,
    },
  },
];

export const clusterNode: NodeStatusInfo = clusterNodes[0];
