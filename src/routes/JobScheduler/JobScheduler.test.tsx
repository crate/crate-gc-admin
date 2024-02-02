import { render, screen, waitFor } from '../../../test/testUtils';
import scheduledJobs from '../../../test/__mocks__/scheduledJobs';
import JobScheduler from '.';

const setup = () => {
  return render(<JobScheduler />);
};

describe('The "JobScheduler" component', () => {
  it('renders the jobs table', async () => {
    setup();

    await screen.findByRole('table');
  });

  it('renders an "Add New Job" button', async () => {
    setup();

    await screen.findByRole('table');

    expect(screen.getByText('Add New Job')).toBeInTheDocument();
  });

  describe('the "Add New Job" button', () => {
    it('opens the "ScheduledJobForm" form with type = add', async () => {
      const { user } = setup();

      await screen.findByRole('table');

      await user.click(screen.getByText('Add New Job'));

      expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('');
    });
  });

  describe('the "Manage" button in the jobs table', () => {
    it('opens the "ScheduledJobManager"', async () => {
      const { user } = setup();

      await screen.findByRole('table');
      await waitFor(async () => {
        expect(await screen.findByText(scheduledJobs[0].name)).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Manage')[0]);

      expect(screen.getByTestId('mocked-ace-editor')).not.toHaveValue('');
    });
  });
});
