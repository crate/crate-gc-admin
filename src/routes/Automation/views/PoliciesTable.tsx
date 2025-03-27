import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Popconfirm } from 'antd';
import {
  Button,
  Chip,
  DataTable,
  DisplayDateDifference,
  DisplayUTCDate,
  Loader,
  Switch,
  Text,
} from 'components';
import { automationCreatePolicy, automationEditPolicy } from 'constants/paths';
import { useGCGetPolicies, useGCGetPoliciesEnriched } from 'hooks/swrHooks';
import useGcApi from 'hooks/useGcApi';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnrichedPolicy, PolicyWithoutId } from 'types';
import { apiDelete, apiPut, cn, sortByString } from 'utils';
import {
  AUTOMATION_TAB_KEYS,
  AUTOMATION_TAB_QUERY_PARAM_KEY,
} from '../routes/AutomationTabsConstants';

export const POLICIES_TABLE_PAGE_SIZE = 10;

type TableAdditionalState = {
  togglingPolicy: string | null;
};

type GetColumnsDefinitionProps = {
  editPolicy: (policy: EnrichedPolicy) => void;
  deletePolicy: (policy: EnrichedPolicy) => void;
  togglePolicyActivation: (
    job: EnrichedPolicy,
    table: Table<EnrichedPolicy>,
  ) => void;
  showLoaderDelete: boolean;
};

const getColumnsDefinition = ({
  editPolicy,
  deletePolicy,
  showLoaderDelete,
  togglePolicyActivation,
}: GetColumnsDefinitionProps) => {
  const columns: ColumnDef<EnrichedPolicy>[] = [
    {
      accessorKey: 'active',
      header: 'Active',
      meta: {
        minWidth: '70px',
      },
      cell: ({ row, table }) => {
        const policy = row.original;
        const isActive = policy.enabled;
        const togglingPolicy = (
          table.getState().additionalState as TableAdditionalState
        ).togglingPolicy;
        const isSwitching = togglingPolicy === policy.id;
        return (
          <span
            onClick={() => {
              togglePolicyActivation(policy, table);
            }}
          >
            <Switch.Root
              defaultChecked={isActive}
              loading={isSwitching}
              size={Switch.sizes.SMALL}
            />
          </span>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const policy = row.original;
        const name = policy.name;
        const running = policy.running;
        return (
          <div className="flex flex-col">
            <Text>{name}</Text>
            <span className="text-[8px]">
              {running && <Chip color={Chip.colors.ORANGE}>RUNNING</Chip>}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'last_execution',
      header: 'Last Executed',
      cell: ({ row }) => {
        const policy = row.original;
        const lastExecution = policy.last_execution;
        const logAvailable = lastExecution && lastExecution.end !== null;
        const inError = logAvailable && lastExecution.error !== null;

        return (
          <div className="w-full">
            <span>
              {!logAvailable ? (
                <Text>-</Text>
              ) : (
                <div className="flex gap-2">
                  <div>
                    <span
                      data-testid="last-execution-icon"
                      className={cn(
                        {
                          'bg-red-600': inError,
                          'bg-green-600': !inError,
                        },
                        'flex rounded-full p-1 text-[12px] text-white',
                      )}
                    >
                      {inError ? <CloseOutlined /> : <CheckOutlined />}
                    </span>
                  </div>

                  <div className="flex w-full flex-col">
                    <div className="flex gap-2" data-testid="last-execution">
                      <Link
                        to={`?${AUTOMATION_TAB_QUERY_PARAM_KEY}=${AUTOMATION_TAB_KEYS.LOGS}&name=${encodeURIComponent(policy.name)}`}
                      >
                        <DisplayUTCDate isoDate={lastExecution.end!} tooltip />
                      </Link>
                    </div>
                    <Text pale testId="last-execution-difference">
                      <DisplayDateDifference to={lastExecution.end!} />
                    </Text>
                  </div>
                </div>
              )}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'next_run_time',
      header: 'Next Due',
      cell: ({ row }) => {
        const policy = row.original;
        const nextRunTime = policy.next_run_time;

        return (
          <div className="flex w-full flex-col">
            <Text>
              {nextRunTime ? <DisplayUTCDate isoDate={nextRunTime} tooltip /> : '-'}
            </Text>
            {nextRunTime && (
              <div>
                <Text pale testId="next-execution-difference">
                  <DisplayDateDifference to={nextRunTime} />
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: ' ',
      meta: {
        minWidth: '80px',
      },
      cell: ({ row }) => {
        const policy = row.original;
        return (
          <span className="flex gap-2">
            <Button
              kind={Button.kinds.TERTIARY}
              onClick={() => {
                editPolicy(policy);
              }}
              className="!leading-3"
            >
              <EditOutlined />
            </Button>

            <Popconfirm
              title="Are you sure to delete this policy?"
              placement="topLeft"
              okButtonProps={{
                loading: showLoaderDelete,
              }}
              onConfirm={() => deletePolicy(policy)}
            >
              <Button kind={Button.kinds.TERTIARY} className="!leading-3">
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return columns;
};

type PoliciesTableProps = { onDeletePolicy?: () => void };

export default function PoliciesTable({ onDeletePolicy }: PoliciesTableProps) {
  const navigate = useNavigate();
  const gcApi = useGcApi();
  const [showLoaderDelete, setShowLoaderDelete] = useState(false);
  const {
    data: policies,
    mutate: mutatePolicies,
    isLoading: isLoadingPolicies,
  } = useGCGetPolicies();
  const {
    policiesToReturn: policiesEnriched,
    setPoliciesToReturn: setPoliciesEnriched,
  } = useGCGetPoliciesEnriched(policies || []);

  const handleDelete = async (policy: EnrichedPolicy) => {
    if (onDeletePolicy) {
      onDeletePolicy();
    }
    setShowLoaderDelete(true);

    await apiDelete(gcApi, `/api/policies/${policy.id}`, null);
    await mutatePolicies(undefined, { revalidate: true });

    setShowLoaderDelete(false);
  };

  const togglePolicyActivation = async (
    policy: EnrichedPolicy,
    table: Table<EnrichedPolicy>,
  ) => {
    table.setState(old => {
      return {
        ...old,
        additionalState: {
          togglingPolicy: policy.id,
        } satisfies TableAdditionalState,
      };
    });
    await apiPut(gcApi, `/api/policies/${policy.id}`, {
      name: policy.name,
      enabled: !policy.enabled,
      targets: policy.targets,
      partitioning: policy.partitioning,
      actions: policy.actions,
    } satisfies PolicyWithoutId);

    const newData = policiesEnriched;
    newData.forEach(el => {
      if (el.id === policy.id) {
        el.enabled = !el.enabled;
      }
    });

    setPoliciesEnriched(newData);

    await mutatePolicies();
    table.setState(old => {
      return {
        ...old,
        additionalState: {
          togglingPolicy: null,
        } satisfies TableAdditionalState,
      };
    });
  };

  if (isLoadingPolicies || !policies) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader size={Loader.sizes.LARGE} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-end">
        <Button
          onClick={() => {
            navigate(`.${automationCreatePolicy.build()}`);
          }}
          className="float-end"
        >
          Add New Policy
        </Button>
      </div>

      <div className="overflow-auto">
        <DataTable
          elementsPerPage={POLICIES_TABLE_PAGE_SIZE}
          noResultsLabel="No policies found"
          data={policiesEnriched.sort(sortByString('name'))}
          columns={getColumnsDefinition({
            editPolicy: (policy: EnrichedPolicy) => {
              navigate(
                `.${automationEditPolicy.build({
                  policyId: policy.id,
                })}`,
              );
            },
            deletePolicy: handleDelete,
            showLoaderDelete: showLoaderDelete,
            togglePolicyActivation,
          })}
          additionalState={
            {
              togglingPolicy: null,
            } as TableAdditionalState
          }
          getRowId={el => el.id}
        />
      </div>
    </div>
  );
}
