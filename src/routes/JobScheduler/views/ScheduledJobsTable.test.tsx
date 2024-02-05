import moment from 'moment';
import scheduledJobLogs from '../../../../test/__mocks__/scheduledJobLogs';
import scheduledJobs from '../../../../test/__mocks__/scheduledJobs';
import server, { customScheduledJobLogsGetResponse } from '../../../../test/msw';
import { customScheduledJobGetResponse } from '../../../../test/msw';
import { getRequestSpy, render, screen, waitFor } from '../../../../test/testUtils';
import { Job, JobLog } from '../../../types';
import { cronParser } from '../../../utils/cron';
import ScheduledJobsTable, {
  JOBS_TABLE_PAGE_SIZE,
  ScheduledJobsTableProps,
} from './ScheduledJobsTable';

const onManage = jest.fn();

const defaultProps: ScheduledJobsTableProps = {
  onManage,
};

const setup = () => {
  return render(<ScheduledJobsTable {...defaultProps} />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
  await waitFor(async () => {
    expect(await screen.findByText(scheduledJobs[0].name)).toBeInTheDocument();
  });
};

describe('The "ScheduledJobsTable" component', () => {
  it('renders a loader while loading scheduled jobs', async () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = JOBS_TABLE_PAGE_SIZE;

      // Check that we have pagination in our table
      expect(scheduledJobs.length).toBeGreaterThan(ITEMS_PER_PAGE);

      scheduledJobs.forEach((job, jobIndex) => {
        const tableRow = container.querySelector(`[data-row-key="${job.id}"]`);

        if (jobIndex < ITEMS_PER_PAGE) {
          expect(tableRow).toBeInTheDocument();
        } else {
          expect(tableRow).not.toBeInTheDocument();
        }
      });
    });

    describe('the "active" cell', () => {
      it('shows a green clock icon for active jobs', async () => {
        // Show only one active job
        const job: Job = {
          ...scheduledJobs[0],
          enabled: true,
        };
        server.use(customScheduledJobGetResponse([job]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${job.id}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByTestId('active-icon')).toBeInTheDocument();
        expect(
          screen
            .getByTestId('active-icon')
            .getElementsByClassName('anticon-clock-circle')[0],
        ).toHaveClass('text-green-600');
      });

      it('shows a gray pause icon for non-active jobs', async () => {
        // Show only one non-active job
        const job: Job = {
          ...scheduledJobs[0],
          enabled: false,
        };
        server.use(customScheduledJobGetResponse([job]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${job.id}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByTestId('active-icon')).toBeInTheDocument();
        expect(
          screen
            .getByTestId('active-icon')
            .getElementsByClassName('anticon-pause-circle')[0],
        ).toHaveClass('text-gray-600');
      });
    });

    describe('the "Job Name" cell', () => {
      it('renders job name', async () => {
        setup();
        const job = scheduledJobs[0];

        await waitForTableRender();

        expect(screen.getByText(job.name)).toBeInTheDocument();
      });
    });

    describe('the "Schedule" cell', () => {
      it('renders the CRON string along with CRON explanation', async () => {
        // Render only one job
        const job = scheduledJobs[0];
        server.use(customScheduledJobGetResponse([job]));

        setup();

        await waitForTableRender();

        expect(
          screen.getByText(`${job.cron} (${cronParser(job.cron)?.toLowerCase()})`),
        ).toBeInTheDocument();
      });
    });

    describe('the "Last Execution" cell', () => {
      const job = scheduledJobs[0];

      beforeEach(() => {
        // Render only one job (for simplicity)
        server.use(customScheduledJobGetResponse([job]));
      });

      it('renders the last execution date and time', async () => {
        // Render only one job
        const log: JobLog = scheduledJobLogs[0];

        setup();

        await waitForTableRender();

        const formattedDate = moment.utc(log.end).format('MMMM Do YYYY, HH:mm');
        expect(screen.getByTestId('last-execution')).toHaveTextContent(
          formattedDate,
        );
      });

      it('displays green text and success icon if last execution has no error', async () => {
        setup();

        await waitForTableRender();

        expect(
          screen
            .getByTestId('last-execution-icon')
            .getElementsByClassName('anticon-check-circle')[0],
        ).toHaveClass('text-green-600');
      });

      it('displays red error icon if last execution has an error', async () => {
        // Show only one job with errors
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query error',
          statements: {
            '0': {
              error: 'QUERY_ERROR',
              sql: 'SELECT 1;',
            },
          },
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        setup();

        await waitForTableRender();

        expect(
          screen
            .getByTestId('last-execution-icon')
            .getElementsByClassName('anticon-close-circle')[0],
        ).toHaveClass('text-red-600');
      });
    });

    describe('the "Next Due" cell', () => {
      const job = scheduledJobs[0];

      beforeEach(() => {
        // Render only one job (for simplicity)
        server.use(customScheduledJobGetResponse([job]));
      });

      it('displays the next due timestamp for non-running jobs', async () => {
        setup();

        await waitForTableRender();

        const formattedDate = moment
          .utc(job.next_run_time)
          .format('MMMM Do YYYY, HH:mm');
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
      });

      it('displays "Running" for running jobs', async () => {
        const log: JobLog = {
          ...scheduledJobLogs[0],
          end: null,
        };
        server.use(customScheduledJobLogsGetResponse([log]));
        setup();

        await waitForTableRender();
        expect(screen.getByText('Running...')).toBeInTheDocument();
      });
    });

    describe('the "Manage" button', () => {
      const job = scheduledJobs[0];

      beforeEach(() => {
        // Render only one job (for simplicity)
        server.use(customScheduledJobGetResponse([job]));
      });

      it('calls "onManage" callback', async () => {
        const { user } = setup();

        await waitForTableRender();

        await user.click(screen.getByText('Manage'));

        expect(onManage).toHaveBeenCalled();
      });
    });

    describe('the "Delete" button', () => {
      const job = scheduledJobs[0];

      beforeEach(() => {
        // Render only one job (for simplicity)
        server.use(customScheduledJobGetResponse([job]));
      });

      it('opens a dialog', async () => {
        const { user } = setup();

        await waitForTableRender();

        await user.click(screen.getByText('Delete'));

        expect(
          screen.getByText('Are you sure to delete this job?'),
        ).toBeInTheDocument();
      });

      it('calls delete API when dialog is submitted', async () => {
        const deleteJobSpy = getRequestSpy('DELETE', '/api/scheduled-jobs/:jobId');
        const { user } = setup();

        await waitForTableRender();

        await user.click(screen.getByText('Delete'));

        expect(
          screen.getByText('Are you sure to delete this job?'),
        ).toBeInTheDocument();

        await user.click(screen.getByText('OK'));

        expect(deleteJobSpy).toHaveBeenCalled();
      });
    });
  });
});
