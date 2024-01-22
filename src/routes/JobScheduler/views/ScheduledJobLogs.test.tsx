import scheduledJob from '../../../../test/__mocks__/scheduledJob';
import ScheduledJobLogs, {
  JOB_LOG_TABLE_PAGE_SIZE,
  ScheduledJobLogsProps,
} from './ScheduledJobLogs';
import { render, screen, within } from '../../../../test/testUtils';
import scheduledJobLogs from '../../../../test/__mocks__/scheduledJobLogs';
import server, { customScheduledJobLogsGetResponse } from '../../../../test/msw';
import moment from 'moment';
import { JobLog } from '../../../types';

const defualtProps: ScheduledJobLogsProps = {
  job: scheduledJob,
};

const setup = () => {
  return render(<ScheduledJobLogs {...defualtProps} />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
};

describe('The "ScheduledJobLogs" component', () => {
  it('renders a loader while loading job logs', () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = JOB_LOG_TABLE_PAGE_SIZE;

      // Check that we have pagination in our table
      expect(scheduledJobLogs.length).toBeGreaterThan(ITEMS_PER_PAGE);

      scheduledJobLogs.forEach((log, logIndex) => {
        const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);

        if (logIndex < ITEMS_PER_PAGE) {
          expect(tableRow).toBeInTheDocument();
        } else {
          expect(tableRow).not.toBeInTheDocument();
        }
      });
    });

    describe('the "status" cell', () => {
      it('shows a success icon for non-failed jobs', async () => {
        // Show only one log, without error
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: null,
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByTestId('status-icon')).toBeInTheDocument();
        expect(screen.getByTestId('status-icon')).toHaveClass('bg-green-500');
      });

      it('shows an error icon for failed jobs', async () => {
        // Show only one log, with error
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query error',
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByTestId('status-icon')).toBeInTheDocument();
        expect(screen.getByTestId('status-icon')).toHaveClass('bg-red-500');
      });
    });

    describe('the "last executed" cell', () => {
      it('displays the last log date time', async () => {
        setup();

        await waitForTableRender();

        const log: JobLog = scheduledJobLogs[0];

        const formattedDate = moment(log.end).format('MMMM Do YYYY, HH:mm');
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
      });
    });

    describe('the "error" cell', () => {
      it('displays n/a if execution has no errors', async () => {
        // Show only one log, without error
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: null,
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByText('n/a')).toBeInTheDocument();
      });

      it('displays the error message if execution has an error', async () => {
        // Show only one log, with error
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query Error',
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByText(log.error!)).toBeInTheDocument();
      });

      it('displays a "See Details" button if execution has an error', async () => {
        // Show only one log, with error
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query Error',
        };
        server.use(customScheduledJobLogsGetResponse([log]));

        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
        expect(tableRow).toBeInTheDocument();

        expect(screen.getByText('See Details')).toBeInTheDocument();
      });

      describe('the "See Details" button', () => {
        const log: JobLog = {
          ...scheduledJobLogs[0],
          error: 'Query Error',
        };

        beforeEach(() => {
          server.use(customScheduledJobLogsGetResponse([log]));
        });

        it('opens a dialog with error details when clicked', async () => {
          const { container, user } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText('See Details')).toBeInTheDocument();

          await user.click(screen.getByText('See Details'));

          expect(screen.getByRole('dialog')).toBeInTheDocument();
          expect(
            within(screen.getByRole('dialog')).getByText(log.error!),
          ).toBeInTheDocument();
        });

        it('the "OK" button inside the dialog will close it', async () => {
          const { container, user } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText('See Details')).toBeInTheDocument();

          await user.click(screen.getByText('See Details'));

          expect(screen.getByRole('dialog')).toBeInTheDocument();

          await user.click(within(screen.getByRole('dialog')).getByText('OK'));

          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('the "Cancel" button inside the dialog will close it', async () => {
          const { container, user } = setup();

          await waitForTableRender();

          const tableRow = container.querySelector(`[data-row-key="${log.start}"]`);
          expect(tableRow).toBeInTheDocument();

          expect(screen.getByText('See Details')).toBeInTheDocument();

          await user.click(screen.getByText('See Details'));

          expect(screen.getByRole('dialog')).toBeInTheDocument();

          await user.click(within(screen.getByRole('dialog')).getByText('Cancel'));

          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });
    });
  });
});
