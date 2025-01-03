import { http, HttpResponse } from 'msw';

const clusterJWT = http.get('/api/v2/clusters/undefined/jwt', () => {
  return HttpResponse.json(
    {
      data: { cluster_id: 'my-local-test-cluster' },
      status: 200,
      success: true,
    },
    { status: 200 },
  );
});

const clusterAuth = http.get('http://localhost:5050/api/auth', () => {
  return HttpResponse.json({}, { status: 200 });
});

export const jwtHandlers = [clusterJWT, clusterAuth];
