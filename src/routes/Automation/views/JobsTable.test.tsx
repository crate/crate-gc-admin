import moment from 'moment';
import { scheduledJobLogs } from 'test/__mocks__/scheduledJobLogs';
import scheduledJobs from 'test/__mocks__/scheduledJobs';
import server from 'test/msw';
import { customScheduledJobGetResponse } from 'test/msw';
import { getRequestSpy, render, screen, waitFor } from 'test/testUtils';
import { Job, JobLog } from 'types';
import { cronParser } from 'utils/cron';
import JobsTable, { JOBS_TABLE_PAGE_SIZE } from './JobsTable';
import { DATE_FORMAT } from 'constants/defaults';
import { navigateMock } from '__mocks__/react-router-dom';
import { sortByString } from 'utils';
import { automationEditJob, automationLogs } from 'constants/paths';

const onDeleteSpy = jest.fn();

const setup = (onDeleteJob?: () => void) => {
  return render(<JobsTable onDeleteJob={onDeleteJob} />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
  await waitFor(async () => {
    expect(await screen.findByText(scheduledJobs[0].name)).toBeInTheDocument();
  });
};

describe('The "JobsTable" component', () => {
  afterEach(() => {
    onDeleteSpy.mockClear();
  });

  const job = scheduledJobs[0];

  beforeEach(() => {
    // Render only one job (for simplicity)
    server.use(customScheduledJobGetResponse([job]));
  });

  it('renders a loader while loading scheduled jobs', async () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      server.use(customScheduledJobGetResponse(scheduledJobs));

      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = JOBS_TABLE_PAGE_SIZE;

      // Check that we have pagination in our table
      expect(scheduledJobs.length).toBeGreaterThan(ITEMS_PER_PAGE);

      scheduledJobs.sort(sortByString('name')).forEach((job, jobIndex) => {
        const tableRow = container.querySelector(`[data-row-key="${job.id}"]`);

        if (jobIndex < ITEMS_PER_PAGE) {
          expect(tableRow).toBeInTheDocument();
        } else {
          expect(tableRow).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('the "active" cell', () => {
    it('shows an active switch if job is enabled', async () => {
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

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
    });

    it('shows a deactivated switch is job is disabled', async () => {
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

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');
    });

    it('clicking on the switch calls job update API', async () => {
      const updateJobSpy = getRequestSpy('PUT', '/api/scheduled-jobs/:jobId');
      const { user } = setup();

      await waitForTableRender();

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(updateJobSpy).toHaveBeenCalled();
      });

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('the "Job Name" cell', () => {
    it('renders job name', async () => {
      setup();
      await waitForTableRender();

      expect(screen.getByText(job.name)).toBeInTheDocument();
    });

    it('displays "Running" for running jobs', async () => {
      const job: Job = {
        ...scheduledJobs[0],
        last_job_logs: [
          {
            ...scheduledJobLogs[0],
            end: null,
          },
        ],
      };
      server.use(customScheduledJobGetResponse([job]));

      setup();

      await waitForTableRender();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });
  });

  describe('the "Schedule" cell', () => {
    it('renders the CRON string along with CRON explanation', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(`${job.cron}`)).toBeInTheDocument();
      expect(screen.getByText(`${cronParser(job.cron)}`)).toBeInTheDocument();
    });
  });

  describe('the "Last Execution" cell', () => {
    const lastJobLog: JobLog = scheduledJobLogs[0];

    beforeEach(() => {
      const job: Job = {
        ...scheduledJobs[0],
        last_job_logs: [lastJobLog],
      };
      server.use(customScheduledJobGetResponse([job]));
    });

    it('renders the last execution date and time along with time difference', async () => {
      // Render only one job
      setup();

      await waitForTableRender();

      const formattedDate = moment.utc(lastJobLog.end).format(DATE_FORMAT);
      expect(screen.getByTestId('last-execution')).toHaveTextContent(formattedDate);
      expect(screen.getByTestId('last-execution-difference')).toBeInTheDocument();
    });

    it('clicking on the last execution timestamp will navigate to job logs', async () => {
      // Render only one job
      setup();

      await waitForTableRender();

      expect(
        screen.getByTestId('last-execution').getElementsByTagName('a')[0],
      ).toHaveAttribute(
        'href',
        `${automationLogs.path}?name=${encodeURIComponent(job.name)}`,
      );
    });

    it('displays green success icon if last execution has no error', async () => {
      setup();

      await waitForTableRender();

      const icon = screen.getByTestId('last-execution-icon');

      expect(icon).toHaveClass('bg-green-600');
      expect(icon.getElementsByClassName('anticon-check')[0]).toBeInTheDocument();
    });

    it('displays red error icon if last execution has an error', async () => {
      // Show only one job with errors
      const lastJobLog: JobLog = scheduledJobLogs[0];

      const job: Job = {
        ...scheduledJobs[0],
        last_job_logs: [
          {
            ...lastJobLog,
            error: 'Query error',
            statements: {
              '0': {
                error: 'QUERY_ERROR',
                sql: 'SELECT 1;',
              },
            },
          },
        ],
      };
      server.use(customScheduledJobGetResponse([job]));

      setup();

      await waitForTableRender();

      const icon = screen.getByTestId('last-execution-icon');

      expect(icon).toHaveClass('bg-red-600');
      expect(icon.getElementsByClassName('anticon-close')[0]).toBeInTheDocument();
    });

    it('displays - for job that have no executions', async () => {
      const job: Job = scheduledJobs[0];

      server.use(customScheduledJobGetResponse([job]));

      setup();

      await waitForTableRender();

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('displays last execution of the next to last if last is running', async () => {
      const lastJobLog: JobLog = scheduledJobLogs[0];
      const nextToLastJobLog: JobLog = scheduledJobLogs[1];

      const job: Job = {
        ...scheduledJobs[0],
        last_job_logs: [{ ...lastJobLog, end: null }, nextToLastJobLog],
      };
      server.use(customScheduledJobGetResponse([job]));
      setup();

      await waitForTableRender();

      expect(screen.getByText('RUNNING')).toBeInTheDocument();

      const formattedDate = moment.utc(nextToLastJobLog.end).format(DATE_FORMAT);
      expect(screen.getByTestId('last-execution')).toHaveTextContent(formattedDate);
      expect(screen.getByTestId('last-execution-difference')).toBeInTheDocument();
    });
  });

  describe('the "Next Due" cell', () => {
    it('displays the next due timestamp along with time difference for enabled jobs', async () => {
      setup();

      await waitForTableRender();

      const formattedDate = moment.utc(job.next_run_time).format(DATE_FORMAT);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
      expect(screen.getByTestId('next-execution-difference')).toBeInTheDocument();
    });

    it('displays - for disabled jobs', async () => {
      // Show only one non-active job
      const job: Job = {
        ...scheduledJobs[0],
        enabled: false,
        next_run_time: undefined,
        last_job_logs: [scheduledJobLogs[0]],
      };
      server.use(customScheduledJobGetResponse([job]));

      setup();

      await waitForTableRender();

      expect(screen.getByText('-')).toBeInTheDocument();
      const formattedDate = moment
        .utc(scheduledJobs[0].next_run_time)
        .format(DATE_FORMAT);
      expect(screen.queryByText(formattedDate)).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('next-execution-difference'),
      ).not.toBeInTheDocument();
    });
  });

  describe('the "Manage" button', () => {
    it('navigates to edit job page', async () => {
      const { user, container } = setup();

      await waitForTableRender();

      await user.click(container.getElementsByClassName('anticon-edit')[0]);

      expect(navigateMock).toHaveBeenCalledWith(
        automationEditJob.build({
          jobId: job.id,
        }),
      );
    });
  });

  describe('the "Delete" button', () => {
    it('opens a dialog', async () => {
      const { user, container } = setup();

      await waitForTableRender();

      await user.click(container.getElementsByClassName('anticon-delete')[0]);

      expect(
        screen.getByText('Are you sure to delete this job?'),
      ).toBeInTheDocument();
    });

    it('calls delete API when dialog is submitted', async () => {
      const deleteJobSpy = getRequestSpy('DELETE', '/api/scheduled-jobs/:jobId');
      const { user, container } = setup();

      await waitForTableRender();

      await user.click(container.getElementsByClassName('anticon-delete')[0]);

      expect(
        screen.getByText('Are you sure to delete this job?'),
      ).toBeInTheDocument();

      await user.click(screen.getByText('OK'));

      expect(deleteJobSpy).toHaveBeenCalled();
    });

    describe('when an onDeleteJob event is used', () => {
      it('calls the event handler', async () => {
        const { user, container } = setup(onDeleteSpy);

        await waitForTableRender();

        await user.click(container.getElementsByClassName('anticon-delete')[0]);

        expect(
          screen.getByText('Are you sure to delete this job?'),
        ).toBeInTheDocument();

        await user.click(screen.getByText('OK'));

        expect(onDeleteSpy).toHaveBeenCalled();
      });
    });
  });
});
