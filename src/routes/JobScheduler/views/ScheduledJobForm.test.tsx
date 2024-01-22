import scheduledJob from '../../../../test/__mocks__/scheduledJob';
import { getRequestSpy, render, screen, waitFor } from '../../../../test/testUtils';
import { Job } from '../../../types';
import ScheduledJobForm from './ScheduledJobForm';

const backToJobList = jest.fn();

const setupAdd = () => {
  return render(<ScheduledJobForm type="add" backToJobList={backToJobList} />);
};
const setupEdit = (job: Job) => {
  return render(
    <ScheduledJobForm type="edit" job={job} backToJobList={backToJobList} />,
  );
};

describe('The "ScheduledJobForm" component', () => {
  afterEach(() => {
    backToJobList.mockClear();
  });

  it('displays an empty form', () => {
    setupAdd();

    expect(screen.getByRole('form')).toBeInTheDocument();

    expect(screen.getByLabelText(/Job Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Name/)).toHaveValue('');

    expect(screen.getByLabelText(/Schedule/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Schedule/)).toHaveValue('');

    expect(screen.getByLabelText(/Active/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active/)).toBeChecked();

    expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('');
  });

  describe('the "Job Name" field', () => {
    it('gives validation error if submitted empty', async () => {
      const { user } = setupAdd();

      await user.click(screen.getByText('Save'));

      expect(screen.getByText('Job Name is a required field.')).toBeInTheDocument();
    });
  });

  describe('the "Schedule" field', () => {
    it('gives validation error if submitted empty', async () => {
      const { user } = setupAdd();

      await user.click(screen.getByText('Save'));

      expect(screen.getByText('Schedule is a required field.')).toBeInTheDocument();
    });

    it('gives validation error if filled with invalid CRON schedule format', async () => {
      const { user } = setupAdd();

      await user.type(screen.getByLabelText(/Schedule/), '*');

      expect(screen.getByText('Invalid CRON schedule.')).toBeInTheDocument();
    });
  });

  describe('the "SQL" field', () => {
    it('gives validation error if submitted empty', async () => {
      const { user } = setupAdd();

      await user.click(screen.getByText('Save'));

      expect(screen.getByText('SQL is a required field.')).toBeInTheDocument();
    });
  });

  describe('the "Cancel" button', () => {
    it('calls "backToJobList" callback', async () => {
      const { user } = setupAdd();

      await user.click(screen.getByText('Cancel'));

      expect(backToJobList).toHaveBeenCalled();
    });
  });

  describe('the "Save" button', () => {
    it('creates a new job', async () => {
      const createJobSpy = getRequestSpy('POST', '/api/scheduled-jobs/');
      const { user } = setupAdd();

      await user.type(screen.getByLabelText(/Job Name/), 'JOB_NAME');
      await user.type(screen.getByLabelText(/Schedule/), '* * * * *');
      await user.type(screen.getByTestId('mocked-ace-editor'), 'SELECT 1;');

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(createJobSpy).toHaveBeenCalled();
      });

      expect(backToJobList).toHaveBeenCalled();
    });
  });

  describe('when type is "edit"', () => {
    it('display a pre-filled form with job details', async () => {
      setupEdit(scheduledJob);

      expect(screen.getByRole('form')).toBeInTheDocument();

      expect(screen.getByLabelText(/Job Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Job Name/)).toHaveValue(scheduledJob.name);

      expect(screen.getByLabelText(/Schedule/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Schedule/)).toHaveValue(scheduledJob.cron);

      expect(screen.getByLabelText(/Active/)).toBeInTheDocument();

      if (scheduledJob.enabled) {
        expect(screen.getByLabelText(/Active/)).toBeChecked();
      } else {
        expect(screen.getByLabelText(/Active/)).not.toBeChecked();
      }

      expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue(scheduledJob.sql);
    });

    describe('the "Save" button', () => {
      it('updates the job', async () => {
        const updateJobSpy = getRequestSpy('PUT', '/api/scheduled-jobs/:jobId');
        const { user } = setupEdit(scheduledJob);

        await user.click(screen.getByLabelText(/Job Name/));
        await user.clear(screen.getByLabelText(/Job Name/));
        await user.type(screen.getByLabelText(/Job Name/), 'JOB_NAME');

        await user.click(screen.getByLabelText(/Schedule/));
        await user.clear(screen.getByLabelText(/Schedule/));
        await user.type(screen.getByLabelText(/Schedule/), '* * * * *');

        await user.click(screen.getByTestId('mocked-ace-editor'));
        await user.clear(screen.getByTestId('mocked-ace-editor'));
        await user.type(screen.getByTestId('mocked-ace-editor'), 'SELECT 1;');

        await user.click(screen.getByText('Save'));

        await waitFor(() => {
          expect(updateJobSpy).toHaveBeenCalled();
        });

        expect(backToJobList).toHaveBeenCalled();
      });
    });
  });
});
