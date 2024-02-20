import ScheduledJobLogs, { JOB_LOG_TABLE_PAGE_SIZE } from './ScheduledJobLogs';
import { render, screen, within } from '../../../../test/testUtils';
import server, { customAllScheduledJobLogsGetResponse } from '../../../../test/msw';
import moment from 'moment';
import { JobLogWithName } from '../../../types';
import { DATE_FORMAT, DURATION_FORMAT } from 'constants/defaults';
import { scheduledJobLogsWithName } from 'test/__mocks__/scheduledJobLogs';
import { navigateMock } from '__mocks__/react-router-dom';
import { getLogDuration } from '../utils/logs';

const setup = () => {
  return render(<ScheduledJobLogs />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
};

const getLogId = (el: JobLogWithName) => `${el.job_id}_${el.start}`;

describe('The "ScheduledJobLogs" component', () => {
  const log: JobLogWithName = {
    ...scheduledJobLogsWithName[0],
    error: null,
    statements: {
      '0': {
        duration: 0.1,
        sql: 'SELECT 1;',
      },
    },
  };
  const errorLog: JobLogWithName = {
    ...log,
    error: 'Query error',
    statements: {
      '0': {
        error: 'QUERY_ERROR',
        sql: 'SELECT 1;',
      },
    },
  };
  const runningJob: JobLogWithName = {
    ...log,
    end: null,
  };
  beforeEach(() => {
    // Show only one log, without error
    server.use(customAllScheduledJobLogsGetResponse([log]));
  });

  it('renders a loader while loading job logs', async () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      server.use(customAllScheduledJobLogsGetResponse(scheduledJobLogsWithName));
      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = JOB_LOG_TABLE_PAGE_SIZE;

      scheduledJobLogsWithName.forEach((log, logIndex) => {
        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
        );
        if (logIndex < ITEMS_PER_PAGE) {
          expect(tableRow).toBeInTheDocument();
        } else {
          expect(tableRow).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('the "Job Name" cell', () => {
    it('displays the Job Name', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(log.job_name)).toBeInTheDocument();
    });

    it('displays the Job Name and "Running" for running jobs', async () => {
      const log: JobLogWithName = runningJob;
      server.use(customAllScheduledJobLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByText(log.job_name)).toBeInTheDocument();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    it('displays the edit icon that navigates to edit job page', async () => {
      const { container, user } = setup();

      await waitForTableRender();

      expect(screen.getByText(log.job_name)).toBeInTheDocument();
      await user.click(container.getElementsByClassName('anticon-edit')[0]);
      expect(navigateMock).toHaveBeenCalledWith(log.job_id);
    });
  });

  describe('the "Execution Time" cell', () => {
    it('displays the log start execution date and time along with time difference', async () => {
      setup();

      await waitForTableRender();

      const formattedDate = moment.utc(log.start).format(DATE_FORMAT);
      expect(screen.getByTestId('execution-time')).toHaveTextContent(formattedDate);
      expect(screen.getByTestId('execution-time-difference')).toBeInTheDocument();
    });
  });

  describe('the "Run Time" cell', () => {
    it('displays the running duration of the log', async () => {
      setup();

      await waitForTableRender();

      const duration = getLogDuration(log);
      const durationFormatted = moment.utc(duration! * 1000).format(DURATION_FORMAT);

      expect(screen.getByText(durationFormatted)).toBeInTheDocument();
    });

    it('displays n/a for running jobs', async () => {
      const log: JobLogWithName = runningJob;
      server.use(customAllScheduledJobLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('duration')).toHaveTextContent('n/a');
    });
  });

  describe('the "status" cell', () => {
    describe('for logs without error', () => {
      it('shows a success icon', async () => {
        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
        );
        expect(tableRow).toBeInTheDocument();

        const icon = screen.getByTestId('status-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('bg-green-600');
        expect(
          screen
            .getByTestId('status-icon')
            .getElementsByClassName('anticon-check')[0],
        ).toBeInTheDocument();
      });

      it('displays "Success"', async () => {
        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
        );
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    describe('for logs with errors', () => {
      // Show only one log, with error
      const log: JobLogWithName = errorLog;
      beforeEach(() => {
        server.use(customAllScheduledJobLogsGetResponse([log]));
      });

      it('shows an error icon for failed jobs', async () => {
        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
        );
        expect(tableRow).toBeInTheDocument();

        const icon = screen.getByTestId('status-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('bg-red-600');
        expect(
          screen
            .getByTestId('status-icon')
            .getElementsByClassName('anticon-close')[0],
        ).toBeInTheDocument();
      });

      it('displays the error message if execution has an error', async () => {
        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
        );
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByText(log.error!)).toBeInTheDocument();
      });

      it('displays a "View Details" button if execution has an error', async () => {
        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
        );
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByText('View Details')).toBeInTheDocument();
      });

      describe('the "View Details" button', () => {
        it('opens a dialog with error details when clicked', async () => {
          const { container, user } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(
            `[data-row-key="${getLogId(log)}"]`,
          );
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText('View Details')).toBeInTheDocument();

          await user.click(screen.getByText('View Details'));

          expect(screen.getByRole('dialog')).toBeInTheDocument();
          expect(
            within(screen.getByRole('dialog')).getByText(log.statements!['0'].sql),
          ).toBeInTheDocument();
        });

        it('the "OK" button inside the dialog will close it', async () => {
          const { container, user } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(
            `[data-row-key="${getLogId(log)}"]`,
          );
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText('View Details')).toBeInTheDocument();

          await user.click(screen.getByText('View Details'));

          expect(screen.getByRole('dialog')).toBeInTheDocument();

          await user.click(within(screen.getByRole('dialog')).getByText('OK'));

          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });
    });

    it('displays n/a for running jobs', async () => {
      const log: JobLogWithName = runningJob;
      server.use(customAllScheduledJobLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('status-running')).toHaveTextContent('n/a');
    });
  });
});
