import {
  checkTreeItem,
  getCheckedTreeItems,
  getRequestSpy,
  isTreeItemChecked,
  render,
  screen,
  waitFor,
} from 'test/testUtils';
import { PolicyForm } from '.';
import server, { customGetEligibleColumns } from 'test/msw';
import {
  FORCE_MERGE_INVALID_VALUE_ERROR,
  SET_REPLICAS_INVALID_VALUE_ERROR,
} from 'constants/policies';
import { navigateMock } from '__mocks__/react-router-dom';
import { EligibleColumnsApiOutput, Policy } from 'types';
import { policy } from 'test/__mocks__/policy';
import { mapPolicyToPolicyInput } from '../tablePoliciesUtils/policies';
import { automationTablePolicies } from 'constants/paths';

const onSaveSpy = jest.fn();

const setupAdd = (onSave?: () => void) => {
  return render(<PolicyForm type="add" onSave={onSave} />);
};
const setupEdit = (policy: Policy, onSave?: () => void) => {
  return render(<PolicyForm type="edit" policy={policy} onSave={onSave} />);
};

const waitForFormRender = async () => {
  await screen.findByRole('form');
};

const backToPoliciesListLink = automationTablePolicies.path;

describe('The "PolicyForm" component', () => {
  it('displays an empty form', async () => {
    setupAdd();
    await waitForFormRender();

    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('form').getAttribute('id')).toBe('policy-form');

    expect(screen.getByLabelText(/Policy Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Policy Name/)).toHaveValue('');

    expect(screen.getByLabelText(/Active/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active/)).toBeChecked();

    // Tables Tree
    const tablesTree = screen.getByTestId('tables-tree');
    expect(tablesTree).toBeInTheDocument();
    expect(getCheckedTreeItems(tablesTree)).toHaveLength(0);

    // Time column should be disabled initially and empty
    expect(screen.getByName('select-column-name')).toBeInTheDocument();
    expect(screen.getByName('select-column-name')).toBeDisabled();
    expect(screen.getByName('select-column-name')).not.toHaveValue();

    // Operation should be < by default
    expect(screen.getByName('select-operation')).toBeInTheDocument();
    expect(screen.getByName('select-operation')).toHaveValue('<');

    // Time Unit should be months by default
    expect(screen.getByName('select-time-unit')).toBeInTheDocument();
    expect(screen.getByName('select-time-unit')).toHaveValue('months');

    // Actions should be all unchecked
    // With disabled values
    expect(screen.getByTestId('forceMerge-enabled')).toBeInTheDocument();
    expect(screen.getByTestId('forceMerge-enabled')).not.toBeChecked();
    expect(screen.getByTestId('forceMerge-value')).toBeInTheDocument();
    expect(screen.getByTestId('forceMerge-value')).toBeDisabled();
    expect(screen.getByTestId('forceMerge-value')).toHaveValue('');

    expect(screen.getByTestId('setReplicas-enabled')).toBeInTheDocument();
    expect(screen.getByTestId('setReplicas-enabled')).not.toBeChecked();
    expect(screen.getByTestId('setReplicas-value')).toBeInTheDocument();
    expect(screen.getByTestId('setReplicas-value')).toBeDisabled();
    expect(screen.getByTestId('setReplicas-value')).toHaveValue('');

    expect(screen.getByTestId('deletePartition-enabled')).toBeInTheDocument();
    expect(screen.getByTestId('deletePartition-enabled')).not.toBeChecked();
  });

  describe('the "Policy Name" field', () => {
    it('gives validation error if submitted empty', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByText('Save'));

      expect(
        screen.getByText('Policy Name is a required field.'),
      ).toBeInTheDocument();
    });

    it('does not give validation error if submitted with a value', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByLabelText(/Policy Name/));
      await user.type(screen.getByLabelText(/Policy Name/), 'Random name');

      await user.click(screen.getByText('Save'));

      expect(
        screen.queryByText('Policy Name is a required field.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('the "Tables" field', () => {
    it('gives validation error if submitted empty', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByText('Save'));

      expect(
        screen.getByText('You must select at least one table or one schema.'),
      ).toBeInTheDocument();
    });

    it('does not give validation error if submitted with a value', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);
      await user.click(screen.getByText('Save'));

      expect(
        screen.queryByText('You must select at least one table or one schema.'),
      ).not.toBeInTheDocument();
    });

    it('loads time columns when value changes', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      // Wait eligible columns API response (i.e. select to be enabled)
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).toBeEnabled();
      });

      // Select should not be disabled
      expect(screen.getByName('select-column-name')).not.toBeDisabled();
      // Warning should not be present
      expect(screen.queryByTestId('column-warning')).not.toBeInTheDocument();
      // Elements should be in the select
      expect(
        screen.getByName('select-column-name')?.getElementsByTagName('option')
          .length,
      ).toBeGreaterThan(0);
    });

    it('shows deleted tables/schemas', async () => {
      setupEdit({
        ...policy,
        targets: [
          ...policy.targets,
          {
            name: 'UNKNOWN_SCHEMA.UNKNOWN_TABLE',
            type: 'table',
          },
        ],
      });
      await waitForFormRender();

      expect(screen.getByTestId('UNKNOWN_SCHEMA.UNKNOWN_TABLE')).toHaveTextContent(
        /deleted/,
      );
      expect(screen.getByTestId('UNKNOWN_SCHEMA')).toHaveTextContent(/deleted/);
    });
  });

  describe('the "Time Column" field', () => {
    it('gives validation error if submitted empty', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByText('Save'));

      expect(
        screen.getByText('Time Column is a required field.'),
      ).toBeInTheDocument();
    });

    it('does not give validation error if a time column has been selected', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      // Wait eligible columns API response (i.e. select to be enabled)
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).toBeEnabled();
      });

      await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

      await user.click(screen.getByText('Save'));

      expect(
        screen.queryByText('Time Column is a required field.'),
      ).not.toBeInTheDocument();
    });

    it('does not contain any option by default', async () => {
      setupAdd();
      await waitForFormRender();

      // Should not contain any option
      expect(
        screen.getByName('select-column-name')?.getElementsByTagName('option'),
      ).toHaveLength(0);
    });

    it('loads options when tables are selected', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      const tablesTree = await screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      // Select should not be disabled
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).not.toBeDisabled();
      });
      // Warning should not be present
      expect(screen.queryByTestId('column-warning')).not.toBeInTheDocument();
      // Elements should be in the select
      expect(
        screen.getByName('select-column-name')?.getElementsByTagName('option')
          .length,
      ).toBeGreaterThan(0);
    });

    it('is disabled when no eligible columns exists', async () => {
      server.use(
        customGetEligibleColumns({
          eligible_columns: {},
        } satisfies EligibleColumnsApiOutput),
      );

      const { user } = setupAdd();
      await waitForFormRender();

      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      expect(screen.getByName('select-column-name')).toBeDisabled();

      server.resetHandlers();
    });

    it('shows a warning if selected column is not part of all the targets', async () => {
      server.use(
        customGetEligibleColumns({
          eligible_columns: {
            part: [],
          },
        } satisfies EligibleColumnsApiOutput),
      );

      const { user } = setupAdd();
      await waitForFormRender();

      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      // Wait eligible columns API response (i.e. select to be enabled)
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).toBeEnabled();
      });

      await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

      expect(screen.getByName('select-column-name')).not.toBeDisabled();
      expect(screen.queryByTestId('column-warning')).toBeInTheDocument();

      server.resetHandlers();
    });
  });

  describe('the "Actions" field', () => {
    it('gives validation error if no action selected', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByText('Save'));

      expect(
        screen.getByText('You must select at least one action.'),
      ).toBeInTheDocument();
    });

    it('does not give validation error if at least one action has been selected', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByTestId('deletePartition-enabled'));
      await user.click(screen.getByText('Save'));

      expect(
        screen.queryByText('You must select at least one action.'),
      ).not.toBeInTheDocument();
    });

    describe('the "force merge" action', () => {
      it('gives validation error if enabled but value is empty', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('forceMerge-enabled'));
        await user.click(screen.getByText('Save'));

        expect(
          screen.getByText(FORCE_MERGE_INVALID_VALUE_ERROR),
        ).toBeInTheDocument();
      });

      it('gives validation error if enabled but value is 0', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('forceMerge-enabled'));
        await user.type(screen.getByTestId('forceMerge-value'), '0');
        await user.click(screen.getByText('Save'));

        expect(
          screen.getByText(FORCE_MERGE_INVALID_VALUE_ERROR),
        ).toBeInTheDocument();
      });

      it('does not give validation error if enabled and filled with positive number', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('forceMerge-enabled'));
        await user.type(screen.getByTestId('forceMerge-value'), '1');
        await user.click(screen.getByText('Save'));

        expect(
          screen.queryByText(FORCE_MERGE_INVALID_VALUE_ERROR),
        ).not.toBeInTheDocument();
      });

      it('disable delete action', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('forceMerge-enabled'));

        expect(screen.getByTestId('deletePartition-enabled')).toBeDisabled();
      });
    });

    describe('the "set replicas" action', () => {
      it('gives validation error if enabled but value is empty', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('setReplicas-enabled'));
        await user.click(screen.getByText('Save'));

        expect(
          screen.getByText(SET_REPLICAS_INVALID_VALUE_ERROR),
        ).toBeInTheDocument();
      });

      it('does not give validation error if enabled and filled with positive number', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('setReplicas-enabled'));
        await user.type(screen.getByTestId('setReplicas-value'), '1');
        await user.click(screen.getByText('Save'));

        expect(
          screen.queryByText(SET_REPLICAS_INVALID_VALUE_ERROR),
        ).not.toBeInTheDocument();
      });

      it('does not give validation error if enabled and filled with {number}-all', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('setReplicas-enabled'));
        await user.type(screen.getByTestId('setReplicas-value'), '1-all');
        await user.click(screen.getByText('Save'));

        expect(
          screen.queryByText(SET_REPLICAS_INVALID_VALUE_ERROR),
        ).not.toBeInTheDocument();
      });

      it('does not give validation error if enabled and filled with {number}-{number}', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('setReplicas-enabled'));
        await user.type(screen.getByTestId('setReplicas-value'), '1-1');
        await user.click(screen.getByText('Save'));

        expect(
          screen.queryByText(SET_REPLICAS_INVALID_VALUE_ERROR),
        ).not.toBeInTheDocument();
      });

      it('disable delete action', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('setReplicas-enabled'));

        expect(screen.getByTestId('deletePartition-enabled')).toBeDisabled();
      });
    });

    describe('the "delete partitions" action', () => {
      it('disable force merge and set replicas actions', async () => {
        const { user } = setupAdd();
        await waitForFormRender();

        await user.click(screen.getByTestId('deletePartition-enabled'));

        expect(screen.getByTestId('setReplicas-enabled')).toBeDisabled();
        expect(screen.getByTestId('forceMerge-enabled')).toBeDisabled();
      });
    });
  });

  describe('the "Preview" section', () => {
    it('is not available when required fields are empty', async () => {
      setupAdd();
      await waitForFormRender();

      expect(screen.queryByText('Partitions affected')).not.toBeInTheDocument();
      expect(screen.getByTestId('preview-not-available')).toBeInTheDocument();
    });

    it('is available when required fields are filled', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      // fill targets
      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      // Wait eligible columns API response (i.e. select to be enabled)
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).toBeEnabled();
      });

      // fill partitioning
      await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

      expect(screen.getByText('Partitions affected')).toBeInTheDocument();
      expect(screen.queryByTestId('preview-not-available')).not.toBeInTheDocument();
    });

    it('resets when required fields are not valid anymore', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      // fill targets
      const tablesTree = screen.getByTestId('tables-tree');
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      // Wait eligible columns API response (i.e. select to be enabled)
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).toBeEnabled();
      });

      // fill partitioning
      await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

      expect(screen.getByText('Partitions affected')).toBeInTheDocument();
      expect(screen.queryByTestId('preview-not-available')).not.toBeInTheDocument();

      // unselect targets
      await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

      expect(screen.queryByText('Partitions affected')).not.toBeInTheDocument();
      expect(screen.getByTestId('preview-not-available')).toBeInTheDocument();
    });
  });

  describe('the "Cancel" button', () => {
    it('goes back to policies table callback', async () => {
      const { user } = setupAdd();
      await waitForFormRender();

      await user.click(screen.getByText('Cancel'));

      expect(navigateMock).toHaveBeenCalledWith(backToPoliciesListLink);
    });
  });

  describe('when type is "add"', () => {
    describe('the "Save" button', () => {
      it('creates a new job and goes back to policies table', async () => {
        const createPolicySpy = getRequestSpy(
          'POST',
          'http://localhost:5050/api/policies/',
        );
        const { user } = setupAdd();
        await waitForFormRender();

        await user.type(screen.getByLabelText(/Policy Name/), 'POLICY_NAME');

        const tablesTree = screen.getByTestId('tables-tree');

        await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

        // Wait eligible columns API response (i.e. select to be enabled)
        await waitFor(() => {
          expect(screen.getByName('select-column-name')).toBeEnabled();
        });

        await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

        await user.click(screen.getByTestId('deletePartition-enabled'));

        await user.click(screen.getByText('Save'));

        await waitFor(() => {
          expect(createPolicySpy).toHaveBeenCalled();
        });

        expect(navigateMock).toHaveBeenCalledWith(backToPoliciesListLink);
      });
    });

    describe('when an onSave event is passed to the form', () => {
      it('calls the event handler', async () => {
        const { user } = setupAdd(onSaveSpy);
        await waitForFormRender();

        await user.type(screen.getByLabelText(/Policy Name/), 'POLICY_NAME');

        const tablesTree = screen.getByTestId('tables-tree');
        await checkTreeItem(tablesTree, 'policy_tests.parted_table', user);

        // Wait eligible columns API response (i.e. select to be enabled)
        await waitFor(() => {
          expect(screen.getByName('select-column-name')).toBeEnabled();
        });

        await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

        await user.click(screen.getByTestId('deletePartition-enabled'));

        await user.click(screen.getByText('Save'));

        expect(onSaveSpy).toHaveBeenCalled();
      });
    });
  });

  describe('when type is "edit"', () => {
    it('display a pre-filled form with policy details', async () => {
      const policyInput = mapPolicyToPolicyInput(policy);
      setupEdit(policy);
      await waitForFormRender();

      expect(screen.getByRole('form')).toBeInTheDocument();

      // Policy Name
      expect(screen.getByLabelText(/Policy Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Policy Name/)).toHaveValue(policyInput.name);

      // Active
      expect(screen.getByLabelText(/Active/)).toBeInTheDocument();
      if (policyInput.enabled) {
        expect(screen.getByLabelText(/Active/)).toBeChecked();
      } else {
        expect(screen.getByLabelText(/Active/)).not.toBeChecked();
      }

      // Targets
      const tablesTree = screen.getByTestId('tables-tree');
      expect(getCheckedTreeItems(tablesTree)).toHaveLength(1);
      expect(
        isTreeItemChecked(tablesTree, policyInput.targets[0].name),
      ).toBeTruthy();

      // Time Column
      await waitFor(() => {
        expect(screen.getByName('select-column-name')).toHaveValue(
          policyInput.partitioning.column_name,
        );
      });

      // Partitioning condition
      expect(screen.getByName('select-operation')).toHaveValue(
        policyInput.partitioning.operation,
      );
      expect(screen.getByTestId('partitioning-value')).toHaveValue(
        policyInput.partitioning.value,
      );
      expect(screen.getByName('select-time-unit')).toHaveValue(
        policyInput.partitioning.unit,
      );

      // ACTIONS

      // 1. Force Merge
      if (policyInput.actions.forceMerge.enabled) {
        expect(screen.getByTestId('forceMerge-enabled')).toBeChecked();
        expect(screen.getByTestId('forceMerge-value')).toHaveValue(
          policyInput.actions.forceMerge.value,
        );
        expect(screen.getByTestId('forceMerge-value')).not.toBeDisabled();
      } else {
        expect(screen.getByTestId('forceMerge-enabled')).not.toBeChecked();
        expect(screen.getByTestId('forceMerge-value')).toBeDisabled();
      }

      // 2. Set Replicas
      if (policyInput.actions.setReplicas.enabled) {
        expect(screen.getByTestId('setReplicas-enabled')).toBeChecked();
        expect(screen.getByTestId('setReplicas-value')).toHaveValue(
          policyInput.actions.setReplicas.value,
        );
        expect(screen.getByTestId('setReplicas-value')).not.toBeDisabled();
      } else {
        expect(screen.getByTestId('setReplicas-enabled')).not.toBeChecked();
        expect(screen.getByTestId('setReplicas-value')).toBeDisabled();
      }

      if (policyInput.actions.deletePartition.enabled) {
        expect(screen.getByTestId('deletePartition-enabled')).toBeChecked();
      } else {
        expect(screen.getByTestId('deletePartition-enabled')).not.toBeChecked();
      }
    });

    describe('the "Save" button', () => {
      it('updates the policy and goes back to policies table', async () => {
        const updatePolicySpy = getRequestSpy(
          'PUT',
          'http://localhost:5050/api/policies/:policyId',
        );
        const { user } = setupEdit(policy);
        await waitForFormRender();

        await user.type(screen.getByLabelText(/Policy Name/), 'POLICY_NAME_UPDATED');

        // Wait eligible columns API response (i.e. select to be enabled)
        await waitFor(() => {
          expect(screen.getByName('select-column-name')).toBeEnabled();
        });

        await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

        await user.click(screen.getByTestId('forceMerge-enabled'));
        await user.type(screen.getByTestId('forceMerge-value'), '1');
        await user.click(screen.getByTestId('setReplicas-enabled'));
        await user.type(screen.getByTestId('setReplicas-value'), '1');

        await user.click(screen.getByText('Save'));

        await waitFor(() => {
          expect(updatePolicySpy).toHaveBeenCalled();
        });

        expect(navigateMock).toHaveBeenCalledWith(backToPoliciesListLink);
      });
    });

    describe('when an onSave event is passed to the form', () => {
      it('calls the event handler', async () => {
        const { user } = setupEdit(policy, onSaveSpy);
        await waitForFormRender();

        await user.type(screen.getByLabelText(/Policy Name/), 'POLICY_NAME_UPDATED');

        // Wait eligible columns API response (i.e. select to be enabled)
        await waitFor(() => {
          expect(screen.getByName('select-column-name')).toBeEnabled();
        });

        await user.selectOptions(screen.getByName('select-column-name')!, ['part']);

        await user.click(screen.getByTestId('forceMerge-enabled'));
        await user.type(screen.getByTestId('forceMerge-value'), '1');
        await user.click(screen.getByTestId('setReplicas-enabled'));
        await user.type(screen.getByTestId('setReplicas-value'), '1');

        await user.click(screen.getByText('Save'));

        expect(onSaveSpy).toHaveBeenCalled();
      });
    });
  });
});
