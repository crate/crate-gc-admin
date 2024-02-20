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
      expect(await screen.findByText('Jobs')).toBeInTheDocument();
    });

    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  describe('the "Jobs" tab', () => {
    it('renders the job form', async () => {
      const { user } = setup();

      await waitFor(async () => {
        expect(await screen.findByText('Jobs')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Jobs'));

      await waitFor(async () => {
        expect(await screen.findByText(scheduledJobs[0].name)).toBeInTheDocument();
      });
    });
  });

  describe('the "Recent" tab', () => {
    it('renders the logs table', async () => {
      const { user } = setup();

      await waitFor(async () => {
        expect(await screen.findByText('Recent')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Recent'));

      await waitFor(async () => {
        expect(
          await screen.findByText(scheduledJobLogsWithName[0].job_name),
        ).toBeInTheDocument();
      });
    });
  });
});
