import { useLocation } from '../../../../__mocks__/react-router-dom';
import ScheduledJobs from './ScheduledJobs';
import { render, screen, waitFor } from '../../../../test/testUtils';
import scheduledJobs from 'test/__mocks__/scheduledJobs';
import { scheduledJobLogsWithName } from 'test/__mocks__/scheduledJobLogs';

const setup = () => {
  return render(<ScheduledJobs />);
};

describe('The "ScheduledJobs" component', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({
      pathname: '',
    });
  });

  it('renders 2 tabs', async () => {
    setup();

    await waitFor(async () => {
      expect(await screen.findByText('Overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  describe('the "Overview" tab', () => {
    it('renders the job form', async () => {
      const { user } = setup();

      await waitFor(async () => {
        expect(await screen.findByText('Overview')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Overview'));

      await waitFor(async () => {
        expect(await screen.findByText(scheduledJobs[0].name)).toBeInTheDocument();
      });
    });
  });

  describe('the "Logs" tab', () => {
    it('renders the logs table', async () => {
      const { user } = setup();

      await waitFor(async () => {
        expect(await screen.findByText('Logs')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Logs'));

      await waitFor(async () => {
        expect(
          await screen.findByText(scheduledJobLogsWithName[0].job_name),
        ).toBeInTheDocument();
      });
    });
  });
});
