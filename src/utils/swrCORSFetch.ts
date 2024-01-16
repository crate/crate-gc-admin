export default async (resource: RequestInfo | URL) => {
  const res = await fetch(resource, {
    credentials: 'include',
    mode: 'cors',
  });
  return res.json();
};
