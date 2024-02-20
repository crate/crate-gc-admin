import { render, screen, waitFor, within } from '../../../test/testUtils';
import JobScheduler from '.';
import { useParams } from '__mocks__/react-router-dom';
import scheduledJobs from 'test/__mocks__/scheduledJobs';

const setup = () => {
  return render(<JobScheduler />);
};

const waitForRoutesRender = async () => {
  const indexRoute = screen.getByTestId('index_path');
  const createRoute = screen.getByTestId('create_path');
  const editRoute = screen.getByTestId(':jobId_path');

  // Wait for job table in index route
  await waitFor(async () => {
    expect(
      await within(indexRoute).findByText(scheduledJobs[0].name),
    ).toBeInTheDocument();
  });

  // Wait for create route
  await waitFor(async () => {
    expect(
      await within(createRoute).findByTestId('mocked-ace-editor'),
    ).toBeInTheDocument();
  });

  // Wait for edit route
  await waitFor(async () => {
    expect(
      await within(editRoute).findByTestId('mocked-ace-editor'),
    ).toBeInTheDocument();
  });
};

describe('The "JobScheduler" component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      jobId: 'JOB_ID',
    });
  });

  it('renders the routes', async () => {
    setup();

    await waitForRoutesRender();
  });

  it('renders the headings', async () => {
    setup();

    await waitForRoutesRender();

    expect(screen.getByText('SQL Scheduler')).toBeInTheDocument();
  });
});
