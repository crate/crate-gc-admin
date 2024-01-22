import moment from 'moment';
import scheduledJobLogs from '../../../../test/__mocks__/scheduledJobLogs';
import scheduledJobs from '../../../../test/__mocks__/scheduledJobs';
import server, { customScheduledJobLogsGetResponse } from '../../../../test/msw';
import { customScheduledJobGetResponse } from '../../../../test/msw';
import {
  getRequestSpy,
  render,
  screen,
  waitFor,
  within,
} from '../../../../test/testUtils';
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
  it('renders a loader while loading scheduled jobs', () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();
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
      it('shows a success icon for active not-in-error jobs', async () => {
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
        expect(screen.getByTestId('active-icon')).toHaveClass('bg-green-500');
      });

      it('shows a non-active icon for non-active not-in-error jobs', async () => {
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
        expect(screen.getByTestId('active-icon')).toHaveClass('bg-red-500');
      });

      it('shows an error icon for in-error jobs', async () => {
        // Show only one job with errors
        const job: Job = scheduledJobs[0];
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query error',
        };
        server.use(customScheduledJobGetResponse([job]));
        server.use(customScheduledJobLogsGetResponse([log]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${job.id}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByTestId('active-icon')).toBeInTheDocument();
        expect(screen.getByTestId('active-icon')).toHaveClass('bg-gray-500');
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

        const formattedDate = moment(log.end).format('MMMM Do YYYY, HH:mm');
        expect(screen.getByTestId('last-execution')).toHaveTextContent(
          formattedDate,
        );
      });

      it('displays green text and success icon if last execution has no error', async () => {
        setup();

        await waitForTableRender();

        expect(screen.getByTestId('last-execution')).toHaveClass('text-green-500');
        expect(screen.getByTestId('last-execution-icon')).toHaveClass(
          'bg-green-500',
        );
      });

      it('displays red text and error icon if last execution has an error', async () => {
        // Show only one job with errors
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query error',
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        setup();

        await waitForTableRender();

        expect(screen.getByTestId('last-execution')).toHaveClass('text-red-500');
        expect(screen.getByTestId('last-execution-icon')).toHaveClass('bg-red-500');
      });
    });

    describe('the "Next Due" cell', () => {
      const job = scheduledJobs[0];

      beforeEach(() => {
        // Render only one job (for simplicity)
        server.use(customScheduledJobGetResponse([job]));
      });

      it('displays the next due date and time for not-in-error jobs', async () => {
        setup();

        await waitForTableRender();

        const formattedDate = moment(job.next_run_time).format(
          'MMMM Do YYYY, HH:mm',
        );
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
      });

      it('displays "Cancelled" (in red) for in-error jobs', async () => {
        // Show only one job with errors
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query error',
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        setup();

        await waitForTableRender();

        expect(screen.getByText('Cancelled')).toBeInTheDocument();
        expect(screen.getByText('Cancelled')).toHaveClass('text-red-500');
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

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      it('calls delete API when dialog is submitted', async () => {
        const deleteJobSpy = getRequestSpy('DELETE', '/api/scheduled-jobs/:jobId');
        const { user } = setup();

        await waitForTableRender();

        await user.click(screen.getByText('Delete'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await user.type(
          within(screen.getByRole('dialog')).getByRole('textbox'),
          job.name,
        );

        await user.click(within(screen.getByRole('dialog')).getByText('Confirm'));

        expect(deleteJobSpy).toHaveBeenCalled();
      });
    });
  });
});