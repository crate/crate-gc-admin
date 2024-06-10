import Logs, { JOBS_LOGS_TABLE_PAGE_SIZE } from './Logs';
import { render, screen, within } from 'test/testUtils';
import server, { customAllLogsGetResponse } from 'test/msw';
import moment from 'moment';
import { JobLogWithName, PolicyLogWithName } from 'types';
import { DATE_FORMAT, DURATION_FORMAT } from 'constants/defaults';
import {
  scheduledJobErrorLog,
  scheduledJobLog,
  scheduledJobLogsWithName,
  scheduledJobRunning,
} from 'test/__mocks__/scheduledJobLogs';
import { getLogDuration } from 'utils';
import { automationEditJob, automationEditPolicy } from 'constants/paths';
import { policyErrorLog, policyLog } from 'test/__mocks__/policiesLogs';

const setup = () => {
  return render(<Logs />);
};

const setupLog = (log: JobLogWithName | PolicyLogWithName) => {
  server.use(customAllLogsGetResponse([log]));
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
};

const getLogId = (el: JobLogWithName | PolicyLogWithName) =>
  `${el.job_id}_${el.start}`;

describe('The "Logs" component', () => {
  beforeEach(() => {
    // Show only one log, without error
    setupLog(scheduledJobLog);
  });

  it('renders a loader while loading logs', async () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      server.use(customAllLogsGetResponse(scheduledJobLogsWithName));
      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = JOBS_LOGS_TABLE_PAGE_SIZE;

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

  describe('the "Name" cell', () => {
    it('displays the task name', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(scheduledJobLog.job_name)).toBeInTheDocument();
    });

    it('displays the task name and "Running" for running tasks', async () => {
      setupLog(scheduledJobRunning);
      setup();

      await waitForTableRender();

      expect(screen.getByText(scheduledJobRunning.job_name)).toBeInTheDocument();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    describe('when task is a scheduled job', () => {
      it('clicking on the name navigates to edit job page', async () => {
        setup();

        await waitForTableRender();

        expect(screen.getByText(scheduledJobLog.job_name)).toHaveAttribute(
          'href',
          `.${automationEditJob.build({ jobId: scheduledJobLog.job_id })}`,
        );
      });
    });

    describe('when task is a policy', () => {
      beforeEach(() => {
        setupLog(policyLog);
      });

      it('clicking on the name navigates to edit policy page', async () => {
        setup();

        await waitForTableRender();

        expect(screen.getByText(policyLog.job_name)).toHaveAttribute(
          'href',
          `.${automationEditPolicy.build({
            policyId: policyLog.job_id,
          })}`,
        );
      });
    });
  });

  describe('the "Execution Time" cell', () => {
    it('displays the log start execution date and time along with time difference', async () => {
      setup();

      await waitForTableRender();

      const formattedDate = moment.utc(scheduledJobLog.start).format(DATE_FORMAT);
      expect(screen.getByTestId('execution-time')).toHaveTextContent(formattedDate);
      expect(screen.getByTestId('execution-time-difference')).toBeInTheDocument();
    });

    it('displays green success icon if log has no error', async () => {
      setup();

      await waitForTableRender();

      const icon = screen.getByTestId('execution-time-icon');

      expect(icon).toHaveClass('bg-green-600');
      expect(icon.getElementsByClassName('anticon-check')[0]).toBeInTheDocument();
    });

    it('displays red error icon if last execution has an error', async () => {
      // Show only one job with errors
      setupLog(scheduledJobErrorLog);

      setup();

      await waitForTableRender();

      const icon = screen.getByTestId('execution-time-icon');

      expect(icon).toHaveClass('bg-red-600');
      expect(icon.getElementsByClassName('anticon-close')[0]).toBeInTheDocument();
    });
  });

  describe('the "Run Time" cell', () => {
    it('displays the running duration of the log', async () => {
      setup();

      await waitForTableRender();

      const duration = getLogDuration(scheduledJobLog);
      const durationFormatted = moment.utc(duration! * 1000).format(DURATION_FORMAT);

      expect(screen.getByText(durationFormatted)).toBeInTheDocument();
    });

    it('displays - for running tasks', async () => {
      setupLog(scheduledJobRunning);
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('duration')).toHaveTextContent('-');
    });
  });

  describe('the "status" cell', () => {
    it('displays - for logs without errors', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('status-success')).toHaveTextContent('-');
    });

    it('displays - for running tasks', async () => {
      setupLog(scheduledJobRunning);
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('status-running')).toHaveTextContent('-');
    });

    describe('for logs with errors', () => {
      describe('when the task is a scheduled job', () => {
        // Show only one log, with error
        beforeEach(() => {
          setupLog(scheduledJobErrorLog);
        });

        it('displays the error message if execution has an error', async () => {
          const { container } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(
            `[data-row-key="${getLogId(scheduledJobErrorLog)}"]`,
          );
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText(scheduledJobErrorLog.error!)).toBeInTheDocument();
        });

        it('displays a "View Details" button if execution has an error', async () => {
          const { container } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(
            `[data-row-key="${getLogId(scheduledJobErrorLog)}"]`,
          );
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText('View Details')).toBeInTheDocument();
        });

        describe('the "View Details" button', () => {
          it('opens a dialog with error details when clicked', async () => {
            const { container, user } = setup();

            await waitForTableRender();

            const tableRow = container.querySelector(
              `[data-row-key="${getLogId(scheduledJobErrorLog)}"]`,
            );
            expect(tableRow).toBeInTheDocument();

            expect(screen.getByText('View Details')).toBeInTheDocument();

            await user.click(screen.getByText('View Details'));

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(
              within(screen.getByRole('dialog')).getByText(
                scheduledJobErrorLog.statements!['0'].sql,
              ),
            ).toBeInTheDocument();
          });

          it('the "OK" button inside the dialog will close it', async () => {
            const { container, user } = setup();

            await waitForTableRender();

            const tableRow = container.querySelector(
              `[data-row-key="${getLogId(scheduledJobErrorLog)}"]`,
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

      describe('when the task is a policy', () => {
        // Show only one log, with error
        beforeEach(() => {
          setupLog(policyErrorLog);
        });

        it('displays the formatted error message if execution has an error', async () => {
          const { container } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(
            `[data-row-key="${getLogId(policyErrorLog)}"]`,
          );
          expect(tableRow).toBeInTheDocument();

          expect(
            screen.getByText(
              'Set Replica(s) failed for table(s): policy_tests.parted_table on 2 partition(s).',
            ),
          ).toBeInTheDocument();
        });
      });
    });
  });
});
