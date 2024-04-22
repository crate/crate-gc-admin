import moment from 'moment';
import server, { customGetAllPolicies, customGetPolicyLogs } from 'test/msw';
import { getRequestSpy, render, screen, waitFor } from 'test/testUtils';
import PoliciesTable, { POLICIES_TABLE_PAGE_SIZE } from './PoliciesTable';
import { DATE_FORMAT } from 'constants/defaults';
import { navigateMock } from '__mocks__/react-router-dom';
import policies from 'test/__mocks__/policies';
import { PolicyLog, Policy } from 'types';
import { policiesLogs, policyErrorLog } from 'test/__mocks__/policiesLogs';
import { sortByString } from 'utils';

const setup = () => {
  return render(<PoliciesTable />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
  await waitFor(async () => {
    expect(await screen.findByText(policies[0].name)).toBeInTheDocument();
  });
};

describe('The "PoliciesTable" component', () => {
  const policy = policies[0];

  beforeEach(() => {
    // Render only one policy (for simplicity)
    server.use(customGetAllPolicies([policy]));
  });

  it('renders a loader while loading policies', async () => {
    setup();

    expect(screen.getByTitle('loading')).toBeInTheDocument();

    await waitForTableRender();
  });

  describe('the table', () => {
    it('is paginated', async () => {
      server.use(customGetAllPolicies(policies));

      const { container } = setup();

      await waitForTableRender();

      // This value should be the same as the one used in the table (defaultPageSize)
      const ITEMS_PER_PAGE = POLICIES_TABLE_PAGE_SIZE;

      // Check that we have pagination in our table
      expect(policies.length).toBeGreaterThan(ITEMS_PER_PAGE);

      policies.sort(sortByString('name')).forEach((policy, policyIndex) => {
        const tableRow = container.querySelector(`[data-row-key="${policy.id}"]`);

        if (policyIndex < ITEMS_PER_PAGE) {
          expect(tableRow).toBeInTheDocument();
        } else {
          expect(tableRow).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('the "active" cell', () => {
    it('shows an active switch if policy is enabled', async () => {
      // Show only one active policy
      const policy: Policy = {
        ...policies[0],
        enabled: true,
      };
      server.use(customGetAllPolicies([policy]));

      const { container } = setup();

      await waitForTableRender();

      const tableRow = container.querySelector(`[data-row-key="${policy.id}"]`);
      expect(tableRow).toBeInTheDocument();

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
    });

    it('shows a deactivated switch is policy is disabled', async () => {
      // Show only one non-active policy
      const policy: Policy = {
        ...policies[0],
        enabled: false,
      };
      server.use(customGetAllPolicies([policy]));

      const { container } = setup();

      await waitForTableRender();

      const tableRow = container.querySelector(`[data-row-key="${policy.id}"]`);
      expect(tableRow).toBeInTheDocument();

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');
    });

    it('clicking on the switch calls policy update API', async () => {
      const updatePolicySpy = getRequestSpy('PUT', '/api/policies/:policyId');
      const { user } = setup();

      await waitForTableRender();

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(updatePolicySpy).toHaveBeenCalled();
      });

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('the "Policy Name" cell', () => {
    it('renders policy name', async () => {
      setup();
      await waitForTableRender();

      expect(screen.getByText(policy.name)).toBeInTheDocument();
    });

    it('displays "Running" for running policies', async () => {
      const log: PolicyLog = {
        ...policiesLogs[0],
        end: null,
      };
      server.use(customGetPolicyLogs([log]));
      setup();

      await waitForTableRender();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });
  });

  describe('the "Last Execution" cell', () => {
    it('renders the last execution date and time along with time difference', async () => {
      const log: PolicyLog = policiesLogs[0];

      setup();

      await waitForTableRender();

      const formattedDate = moment.utc(log.end).format(DATE_FORMAT);
      expect(screen.getByTestId('last-execution')).toHaveTextContent(formattedDate);
      expect(screen.getByTestId('last-execution-difference')).toBeInTheDocument();
    });

    it('clicking on the last execution timestamp will navigate to policy logs', async () => {
      setup();

      await waitForTableRender();

      expect(
        screen.getByTestId('last-execution').getElementsByTagName('a')[0],
      ).toHaveAttribute(
        'href',
        `?tablePoliciesTab=policies_logs&name=${encodeURIComponent(policy.name)}`,
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
      // Show only one policy with errors
      const log: PolicyLog = policyErrorLog;
      server.use(customGetPolicyLogs([log]));

      setup();

      await waitForTableRender();

      const icon = screen.getByTestId('last-execution-icon');

      expect(icon).toHaveClass('bg-red-600');
      expect(icon.getElementsByClassName('anticon-close')[0]).toBeInTheDocument();
    });

    it('displays - for policies that have no executions', async () => {
      server.use(customGetPolicyLogs([]));

      setup();

      await waitForTableRender();

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('the "Next Due" cell', () => {
    it('displays the next due timestamp along with time difference for enabled policies', async () => {
      setup();

      await waitForTableRender();

      const formattedDate = moment.utc(policy.next_run_time).format(DATE_FORMAT);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
      expect(screen.getByTestId('next-execution-difference')).toBeInTheDocument();
    });

    it('displays - for disabled policies', async () => {
      // Show only one non-active policies
      const policy: Policy = {
        ...policies[0],
        enabled: false,
        next_run_time: undefined,
      };
      server.use(customGetAllPolicies([policy]));

      setup();

      await waitForTableRender();

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('the "Manage" button', () => {
    it('navigates to edit policy page', async () => {
      const { user, container } = setup();

      await waitForTableRender();

      await user.click(container.getElementsByClassName('anticon-edit')[0]);

      expect(navigateMock).toHaveBeenCalledWith(policy.id);
    });
  });

  describe('the "Delete" button', () => {
    it('opens a dialog', async () => {
      const { user, container } = setup();

      await waitForTableRender();

      await user.click(container.getElementsByClassName('anticon-delete')[0]);

      expect(
        screen.getByText('Are you sure to delete this policy?'),
      ).toBeInTheDocument();
    });

    it('calls delete API when dialog is submitted', async () => {
      const deletePolicySpy = getRequestSpy('DELETE', '/api/policies/:policyId');
      const { user, container } = setup();

      await waitForTableRender();

      await user.click(container.getElementsByClassName('anticon-delete')[0]);

      expect(
        screen.getByText('Are you sure to delete this policy?'),
      ).toBeInTheDocument();

      await user.click(screen.getByText('OK'));

      expect(deletePolicySpy).toHaveBeenCalled();
    });
  });
});
