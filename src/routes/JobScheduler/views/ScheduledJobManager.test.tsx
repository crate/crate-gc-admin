import scheduledJob from '../../../../test/__mocks__/scheduledJob';
import { render, screen } from '../../../../test/testUtils';
import ScheduledJobManager, {
  ScheduledJobManagerProps,
} from './ScheduledJobManager';

const backToJobList = jest.fn();
const job = scheduledJob;

const defaultProps: ScheduledJobManagerProps = {
  backToJobList,
  job,
};

const setup = () => {
  return render(<ScheduledJobManager {...defaultProps} />);
};

describe('The "ScheduledJobManager" component', () => {
  it('renders 2 tabs', () => {
    setup();

    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  describe('the "Manage" tab', () => {
    it('renders the job form', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Manage'));

      expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
    });
  });

  describe('the "Recent" tab', () => {
    it('renders the logs table', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Recent'));

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
