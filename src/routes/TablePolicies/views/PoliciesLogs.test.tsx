import PoliciesLogs, { POLICIES_LOGS_TABLE_PAGE_SIZE } from './PoliciesLogs';
import { render, screen } from 'test/testUtils';
import server, { customAllPoliciesLogsGetResponse } from 'test/msw';
import moment from 'moment';
import { PolicyLog, PolicyLogWithName } from 'types';
import { DATE_FORMAT, DURATION_FORMAT } from 'constants/defaults';
import { getLogDuration } from 'utils';
import { policiesLogsWithName, policyErrorLog } from 'test/__mocks__/policiesLogs';

const setup = () => {
  return render(<PoliciesLogs />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
};

const getLogId = (el: PolicyLogWithName) => `${el.job_id}_${el.start}`;

describe('The "PoliciesLogs" component', () => {
  const log: PolicyLogWithName = {
    ...policiesLogsWithName[0],
    error: null,
    statements: {
      '0': {
        duration: 0.1,
        sql: 'SELECT 1;',
      },
    },
  };
  const errorLog: PolicyLogWithName = policyErrorLog;
  const runningPolicy: PolicyLogWithName = {
    ...log,
    end: null,
  };
  beforeEach(() => {
    // Show only one log, without error
    server.use(customAllPoliciesLogsGetResponse([log]));
  });

  it('renders a loader while loading policies logs', async () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      server.use(customAllPoliciesLogsGetResponse(policiesLogsWithName));
      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = POLICIES_LOGS_TABLE_PAGE_SIZE;

      policiesLogsWithName.forEach((log, logIndex) => {
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

  describe('the "Policy Name" cell', () => {
    it('displays the Policy Name', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(log.job_name)).toBeInTheDocument();
    });

    it('displays the Policy Name and "Running" for running policies', async () => {
      const log: PolicyLogWithName = runningPolicy;
      server.use(customAllPoliciesLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByText(log.job_name)).toBeInTheDocument();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    it('clicking on it navigates to edit policy page', async () => {
      setup();

      await waitForTableRender();

      expect(screen.getByText(log.job_name)).toHaveAttribute(
        'href',
        `./${encodeURIComponent(log.job_id)}`,
      );
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

    it('displays green success icon if log has no error', async () => {
      setup();

      await waitForTableRender();

      const icon = screen.getByTestId('execution-time-icon');

      expect(icon).toHaveClass('bg-green-600');
      expect(icon.getElementsByClassName('anticon-check')[0]).toBeInTheDocument();
    });

    it('displays red error icon if last execution has an error', async () => {
      // Show only one policy with errors
      const log: PolicyLog = errorLog;
      server.use(customAllPoliciesLogsGetResponse([log]));

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

      const duration = getLogDuration(log);
      const durationFormatted = moment.utc(duration! * 1000).format(DURATION_FORMAT);

      expect(screen.getByText(durationFormatted)).toBeInTheDocument();
    });

    it('displays - for running policies', async () => {
      const log: PolicyLogWithName = runningPolicy;
      server.use(customAllPoliciesLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('duration')).toHaveTextContent('-');
    });
  });

  describe('the "status" cell', () => {
    it('displays - for logs without errors', async () => {
      server.use(customAllPoliciesLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('status-success')).toHaveTextContent('-');
    });

    it('displays - for running policies', async () => {
      const log: PolicyLogWithName = runningPolicy;
      server.use(customAllPoliciesLogsGetResponse([log]));
      setup();

      await waitForTableRender();

      expect(screen.getByTestId('status-running')).toHaveTextContent('-');
    });

    describe('for logs with errors', () => {
      // Show only one log, with error
      const log: PolicyLogWithName = errorLog;
      beforeEach(() => {
        server.use(customAllPoliciesLogsGetResponse([log]));
      });

      it('displays the formatted error message if execution has an error', async () => {
        const { container } = setup();

        await waitForTableRender();

        const tableRow = container.querySelector(
          `[data-row-key="${getLogId(log)}"]`,
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
