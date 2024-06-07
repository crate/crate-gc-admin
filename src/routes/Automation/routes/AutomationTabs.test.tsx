import { useLocation } from '__mocks__/react-router-dom';
import AutomationTabs from './AutomationTabs';
import { render, screen, waitFor } from 'test/testUtils';
import scheduledJobs from 'test/__mocks__/scheduledJobs';
import { scheduledJobLogsWithName } from 'test/__mocks__/scheduledJobLogs';
import policies from 'test/__mocks__/policies';

const setup = () => {
  return render(<AutomationTabs />);
};

const waitForTabRender = async () => {
  await waitFor(async () => {
    expect(await screen.findByText('Scheduled Jobs')).toBeInTheDocument();
  });
};

describe('The "AutomationTabs" component', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({
      pathname: '',
    });
  });

  it('renders 3 tabs', async () => {
    setup();

    await waitForTabRender();

    expect(screen.getByText('Scheduled Jobs')).toBeInTheDocument();
    expect(screen.getByText('Table Policies')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  describe('the "Scheduled Jobs" tab', () => {
    it('renders the jobs table', async () => {
      const { user } = setup();

      await waitForTabRender();

      await user.click(screen.getByText('Scheduled Jobs'));

      await waitFor(async () => {
        expect(await screen.findByText(scheduledJobs[0].name)).toBeInTheDocument();
      });
    });
  });

  describe('the "Table Policies" tab', () => {
    it('renders the policies table', async () => {
      const { user } = setup();

      await waitForTabRender();

      await user.click(screen.getByText('Table Policies'));

      await waitFor(async () => {
        expect(await screen.findByText(policies[0].name)).toBeInTheDocument();
      });
    });
  });

  describe('the "Logs" tab', () => {
    it('renders the logs table', async () => {
      const { user } = setup();

      await waitForTabRender();

      await user.click(screen.getByText('Logs'));

      await waitFor(async () => {
        expect(
          await screen.findByText(scheduledJobLogsWithName[0].job_name),
        ).toBeInTheDocument();
      });
    });
  });
});
