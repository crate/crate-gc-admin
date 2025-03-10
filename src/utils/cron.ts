import cronstrue from 'cronstrue';

export const cronParser = (cron: string | undefined) => {
  if (!cron) {
    return null;
  }
  const stringSplitted = cron.trim().split(/\s+/);
  if (stringSplitted.length > 5) {
    // To have min granularity of minutes (instead of seconds)
    return null;
  }
  try {
    return cronstrue.toString(cron);
  } catch {
    return null;
  }
};
