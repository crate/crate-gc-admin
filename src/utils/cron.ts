import cronstrue from 'cronstrue';

export const cronParser = (cron: string) => {
  try {
    return cronstrue.toString(cron);
  } catch (e) {
    return null;
  }
};
