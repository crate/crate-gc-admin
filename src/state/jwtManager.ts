import { create } from 'zustand';
// import { compare } from 'compare-versions';
import { jwtDecode } from 'jwt-decode';
import { ConnectionStatus } from 'types';

// const MINIMUM_JWT_CRATE_VERSION = '5.8.2';

export const DELETE_ME_CLUSTER_KEY = 'default';

type Cluster = { crate_version: string; fqdn: string; id: string };
type Headers = {
  Authorization?: string;
  'Content-Type': string;
};

type JWTManagerStoreCluster = {
  clusterUrl: string;
  clusterVersion?: string;
  gcStatus: ConnectionStatus;
  gcUrl: string;
  isLocalConnection: boolean;
  isJWTEnabled: boolean;
  sessionTokenKey?: string;
  tokenIsReady: boolean;
};

export type JWTManagerStore = {
  clusters: { [key: string]: JWTManagerStoreCluster };
  debug: () => void;
  getCluster: (clusterId: string | undefined) => JWTManagerStoreCluster; // to remove
  getClusterKey: (clusterId?: string) => string;
  getHeaders: (clusterId?: string) => Promise<Headers>;
  getToken: (clusterId?: string) => Promise<string>;
  getUrl: (clusterId: string | undefined, identifier?: string) => string;
  hasToken: (clusterId?: string) => boolean;
  login: (
    clusterId: string | undefined,
    token: string,
    refresh?: string,
  ) => Promise<boolean>;
  setGcStatus: (status: ConnectionStatus) => void;
  updateCluster: (cluster: Cluster) => void;
};

// on load, assume we are in the local "admin UI" mode
// if we are in the cloud console, this will updated from code in
// the cloud itself
const initialState = {
  clusters: {
    default: {
      clusterUrl: 'http://localhost:4200',
      isLocalConnection: true, // true === "admin UI" mode
      sessionTokenKey: 'grand_central_token',

      // adminui specific vars
      gcStatus: ConnectionStatus.PENDING,

      // cloud specific vars
      clusterVersion: undefined,
      gcUrl: 'http://localhost:5050',
      isJWTEnabled: false,
      tokenIsReady: false,
    },
  },
};

const useJWTManagerStore = create<JWTManagerStore>((set, get) => ({
  ...initialState,

  debug: () => {
    console.log(get().clusters);
  },

  getCluster: clusterId => {
    return get().clusters[get().getClusterKey(clusterId)];
  },

  getClusterKey: clusterId => {
    return clusterId || 'default';
  },

  getHeaders: async clusterId => {
    const headers: Headers = {
      'Content-Type': 'application/json; charset=utf-8',
    };

    const cluster = get().getCluster(clusterId);
    if (cluster.isLocalConnection) {
      const token = await get().getToken(clusterId);
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  getToken: async clusterId => {
    const cluster = get().getCluster(clusterId);

    // fetch token from session storage
    let tokenIsValid = false;
    let token = sessionStorage.getItem(cluster.sessionTokenKey!);

    // if token exists, validate it
    if (token) {
      tokenIsValid = validateToken(token);
    }

    // if token doesn't exist or it is invalid, generate a new one
    if (!tokenIsValid) {
      const res = await fetch(
        `/api/v2/clusters/${get().getClusterKey(clusterId)}/jwt/`,
      );
      const json = await res.json();
      token = json.token;
      get().login(token!, json.refresh);
    }

    // returns a "guaranteed" working token
    return token as string;
  },

  getUrl: (clusterId, identifier) => {
    const cluster = get().getCluster(clusterId);
    let url = `${cluster.gcUrl}/api/_sql?error_trace&types`;
    if (cluster.isLocalConnection || cluster.isJWTEnabled) {
      url = `${cluster.clusterUrl}/_sql?error_trace&types`;
    }

    if (identifier) {
      url = `${url}&ident=${identifier}`;
    }

    return url;
  },

  hasToken: clusterId => {
    const cluster = get().getCluster(clusterId);
    return !!sessionStorage.getItem(cluster.sessionTokenKey!);
  },

  login: async (clusterId, token, refresh) => {
    const cluster = get().getCluster(clusterId);
    const clusterKey = get().getClusterKey(clusterId);

    // init querystring
    let qs = `?token=${encodeURIComponent(token)}`;
    if (refresh) {
      qs += `&refresh=${encodeURIComponent(refresh)}`;
    }

    // attempt to authenticate with the token
    try {
      const resAuth = await fetch(`${cluster.gcUrl!}/api/auth${qs}`);
      if (resAuth.status == 200) {
        sessionStorage.setItem(cluster.sessionTokenKey!, token);
        set(state => ({
          clusters: {
            ...state.clusters,
            [clusterKey]: {
              ...state.clusters[clusterKey],
              gcStatus: ConnectionStatus.CONNECTED,
            },
          },
        }));
        return true;
      }
    } catch (e) {
      //
    }

    return false;
  },

  // only used in adminui, hence the hardcoded "default" clusterId
  setGcStatus: status => {
    set(state => ({
      clusters: {
        ...state.clusters,
        default: {
          ...state.clusters.default,
          gcStatus: status,
        },
      },
    }));
  },

  // used only in the cloud-ui:
  // updates the values in the store when the cluster changes
  // via the <JWTManagerWrapper> component
  updateCluster: async (cluster: Cluster) => {
    console.log(cluster);
    /*
    let hasUpdated = false;

    // update only the clusterVersion when it changes
    const newVersion = getClusterVersion(cluster);
    if (cluster?.id === get().clusterId && newVersion !== get().clusterVersion) {
      set({
        clusterVersion: newVersion,
        isJWTEnabled: compare(newVersion, MINIMUM_JWT_CRATE_VERSION, '>='),
        tokenIsReady: false,
      });
      hasUpdated = true;
    }

    // update state when the cluster changes
    if (cluster?.id !== get().clusterId) {
      set({
        clusterId: cluster.id,
        clusterUrl: `https://${cluster?.fqdn.replace(/\.$/, ':4200')}`,
        clusterVersion: getClusterVersion(cluster),
        gcStatus: ConnectionStatus.CONNECTED,
        gcUrl: `https://${cluster.fqdn.replace('.', '.gc.').replace(/\.$/, '')}`,
        isLocalConnection: false,
        isJWTEnabled: compare(
          getClusterVersion(cluster),
          MINIMUM_JWT_CRATE_VERSION,
          '>=',
        ),
        sessionTokenKey: `grand-central-token.${cluster.id}`,
        tokenIsReady: false,
      });
      hasUpdated = true;
    }

    // pre-fetch a new token if we don't have a valid one
    if (hasUpdated) {
      await get().getToken();
      set({ tokenIsReady: true });
    }

    */
  },
}));

// remove any non-stable (i.e. nightly) version numbering to just
// return the core x.x.x semver version number
// const getClusterVersion = (cluster: Cluster) => {
//   return cluster.crate_version.includes('-')
//     ? cluster.crate_version.split('-')[1]
//     : cluster.crate_version;
// };

// checks true if a given token is valid and has not expired
const validateToken = (token: string) => {
  try {
    const decodedToken = jwtDecode(token);

    // check for token expiry
    if (decodedToken.exp) {
      const expiry = decodedToken.exp;
      const now = Math.floor(new Date().getTime() / 1000);

      // this is a bit arbitrary, but let's say that a token
      // is valid if it has 10 seconds life still left
      return expiry - now > 10;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

export default useJWTManagerStore;
