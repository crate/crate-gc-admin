import { useParams } from '__mocks__/react-router-dom';
import EditJob from './EditJob';
import { render, screen, waitFor } from 'test/testUtils';
import scheduledJob from 'test/__mocks__/scheduledJob';

const job = scheduledJob;

const setup = () => {
  return render(<EditJob />);
};

describe('The "EditJob" component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      jobId: 'JOB_ID',
    });
  });

  it('renders the edit job form', async () => {
    setup();

    await waitFor(async () => {
      expect(await screen.findByTestId('mocked-ace-editor')).toBeInTheDocument();
    });

    expect(await screen.findByTestId('mocked-ace-editor')).toHaveValue(job.sql);
  });
});
