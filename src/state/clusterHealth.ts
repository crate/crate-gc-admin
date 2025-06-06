// the state in this file is not persisted to localStorage
// use this for cluster health management only

import { create } from 'zustand';
import { FSStats, LoadAverage } from 'types/cratedb';

type ClusterHealth = {
  load: LoadAverage[];
  fsStats: { [key: string]: FSStats };
};

type ClusterHealthStore = {
  clusterHealth: Record<string, ClusterHealth>;
  setClusterHealth: (clusterId: string, health: ClusterHealth) => void;
};

const initialState = {
  clusterHealth: {},
};

const useClusterHealthStore = create<ClusterHealthStore>(set => ({
  ...initialState,

  setClusterHealth: (clusterId: string, health: ClusterHealth) => {
    set(state => {
      return {
        clusterHealth: {
          ...state.clusterHealth,
          [clusterId]: health,
        },
      };
    });
  },
}));

export default useClusterHealthStore;
