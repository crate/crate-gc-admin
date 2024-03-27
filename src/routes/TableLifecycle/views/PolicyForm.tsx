import {
  Form,
  Input,
  Loader,
  Select,
  Switch,
  Grid,
  Checkbox,
  Card,
  Button,
  Tree,
  Text,
  DataTable,
} from 'components';
import { useGetPartitionedTables } from 'hooks/swrHooks';
import useGcApi from 'hooks/useGcApi';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TPolicyPreviewBody,
  Policy,
  PolicyFormSchemaInput,
  PolicyInput,
  TPolicyPartitioningOperation,
  TPolicyPartitioningUnit,
  TPolicyTarget,
  EligibleTable,
  PolicyPreviewBody,
  EligibleColumnsApiOutput,
  EligibleTablesApiOutput,
} from 'types';
import { ApiError } from 'types/api';
import {
  ApiOutput,
  apiPost,
  apiPut,
  mapPolicyInputToPolicyWithoutId,
  mapPolicyToPolicyInput,
  mapTableListEntriesToTreeItem,
} from 'utils';
import { AxiosInstance } from 'axios';
import { Tooltip } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { INTEGER_VALUE_REGEXP } from 'constants/utils';

type PolicyFormAdd = { type: 'add' };
type PolicyFormEdit = { type: 'edit'; policy: Policy };

type PolicyFormProps = PolicyFormAdd | PolicyFormEdit;

const EMPTY_POLICY_FORM: PolicyInput = {
  name: '',
  enabled: true,
  targets: [],
  partitioning: {
    column_name: '',
    value: '1',
    unit: 'months',
    operation: '<',
  },
  actions: {
    forceMerge: {
      action: 'force_merge',
      enabled: false,
      value: '',
    },
    setReplicas: {
      action: 'set_replicas',
      enabled: false,
      value: '',
    },
    deletePartition: {
      action: 'delete',
      enabled: false,
      value: null,
    },
  },
} satisfies PolicyInput;

const getEligibleColumns = async (
  gcApi: AxiosInstance,
  targets: TPolicyTarget[],
) => {
  const columns = await apiPost<EligibleColumnsApiOutput>(
    gcApi,
    '/api/policies/eligible-columns/',
    {
      targets,
    },
  );

  return columns.data;
};

const getPreview = async (gcApi: AxiosInstance, policy: TPolicyPreviewBody) => {
  const preview = await apiPost<EligibleTablesApiOutput>(
    gcApi,
    '/api/policies/preview/',
    policy,
    undefined,
    false,
  );

  return preview.data;
};

export default function PolicyForm(props: PolicyFormProps) {
  const { type } = props;
  const navigate = useNavigate();
  const gcApi = useGcApi();
  const [showLoader, setShowLoader] = useState(false);
  const [showColumnsWarning, setShowColumnsWarning] = useState(false);
  const [eligibleColumns, setEligibleColumns] = useState<string[]>(
    type === 'edit' ? [props.policy.partitioning.column_name] : [],
  );
  const [eligibleTables, setEligibleTables] = useState<null | EligibleTable[]>(null);
  const { data: tables, isLoading: isLoadingTables } =
    useGetPartitionedTables(false);

  const form = useForm<PolicyInput>({
    defaultValues:
      type === 'add' ? EMPTY_POLICY_FORM : mapPolicyToPolicyInput(props.policy),
    resolver: zodResolver(PolicyFormSchemaInput),
  });
  const policyTargets = form.watch('targets');
  const policyPartitioning = form.watch('partitioning');
  const policyPartitioningColumnName = form.watch('partitioning.column_name');

  const backToPolicyList = () => {
    navigate('..', { relative: 'path' });
  };

  const onSubmit: SubmitHandler<PolicyInput> = async (data: PolicyInput) => {
    let result: ApiOutput<ApiError<PolicyInput> | Policy>;

    const policy = mapPolicyInputToPolicyWithoutId(data);

    setShowLoader(true);
    if (type === 'add') {
      // CREATE
      result = await apiPost<ApiError<PolicyInput> | Policy>(
        gcApi,
        `/api/policies/`,
        policy,
        undefined,
        false,
      );
    } else {
      // UPDATE
      result = await apiPut<ApiError<PolicyInput> | Policy>(
        gcApi,
        `/api/policies/${props.policy.id}`,
        policy,
        undefined,
        false,
      );
    }

    setShowLoader(false);
    if (result.success) {
      backToPolicyList();
    } else if (result.data && 'errors' in result.data) {
      Object.keys(result.data.errors).forEach(fieldInError => {
        if (result.data && 'errors' in result.data) {
          form.setError(fieldInError as keyof PolicyInput, {
            type: 'validate',
            message: result.data.errors[fieldInError as keyof PolicyInput].join(' '),
          });
        }
      });
    }
  };

  useEffect(() => {
    setShowColumnsWarning(false);
    // Update eligible columns if targets changes
    if (policyTargets.length === 0) {
      setEligibleColumns([]);
    } else {
      getEligibleColumns(gcApi, policyTargets).then(columns => {
        if (columns !== null) {
          const eligibleColumns = Object.keys(columns.eligible_columns) as string[];
          setEligibleColumns(eligibleColumns);

          if (eligibleColumns.length === 0) {
            setShowColumnsWarning(true);
          }
        } else {
          setEligibleColumns([]);
        }
      });
    }
  }, [policyTargets]);

  useEffect(() => {
    // Check that the current value of columnName is in the output
    if (
      !eligibleColumns.includes(policyPartitioningColumnName) &&
      policyPartitioningColumnName !== ''
    ) {
      // Clear the column name
      form.setValue('partitioning.column_name', '');
    }
  }, [eligibleColumns]);

  useEffect(() => {
    const policyPreviewBody: TPolicyPreviewBody = {
      targets: policyTargets,
      partitioning: policyPartitioning,
    } satisfies TPolicyPreviewBody;

    if (PolicyPreviewBody.safeParse(policyPreviewBody).success) {
      getPreview(gcApi, policyPreviewBody).then(tables => {
        if (tables) {
          setEligibleTables(tables.eligible_tables);
        } else {
          setEligibleTables(null);
        }
      });
    }
  }, [
    policyTargets,
    policyPartitioning.column_name,
    policyPartitioning.operation,
    policyPartitioning.unit,
    policyPartitioning.value,
  ]);

  if (showLoader || isLoadingTables) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <Form.FormProvider {...form}>
      <form
        role="form"
        id="policy-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-2 flex flex-col gap-2"
        autoComplete="off"
      >
        <Grid columns={Grid.COLS.N12} className="gap-2 md:gap-4">
          <Grid.Item colSpan={10}>
            {/* name */}
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label htmlFor="name">
                      Policy Name <span className="text-red-600">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} id="name" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                );
              }}
            />
          </Grid.Item>
          <Grid.Item colSpan={2}>
            {/* active */}
            <Form.Field
              control={form.control}
              name="enabled"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label htmlFor="active">Active</Form.Label>
                    <Form.Control>
                      <Switch.Root
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="active"
                        className="mt-2"
                      />
                    </Form.Control>
                  </Form.Item>
                );
              }}
            />
          </Grid.Item>
        </Grid>

        <Grid columns={Grid.COLS.N12} className="gap-2">
          <Grid.Item colSpan={6}>
            <Card title="Tables" className="p-0">
              <Form.Description>
                Select the tables that contains the partitions that you want to be
                affected by the policy.
              </Form.Description>
              <Form.Field
                control={form.control}
                name="targets"
                render={({ field, fieldState }) => {
                  const treeElements = mapTableListEntriesToTreeItem(tables!);

                  const handleTreeCheck = ({
                    checked: checkedKeys,
                  }: {
                    checked: string[];
                  }) => {
                    const targets = checkedKeys.map(key => {
                      const schemaMatches = treeElements.find(
                        schema => schema.key === key,
                      );

                      return {
                        type: schemaMatches ? 'schema' : 'table',
                        name: key,
                      } as TPolicyTarget;
                    });
                    form.setValue('targets', targets);
                  };

                  return (
                    <>
                      <Tree
                        className="mt-2"
                        defaultExpandAll
                        checkable
                        checkStrictly
                        checkedKeys={field.value.map(el => el.name)}
                        onCheck={handleTreeCheck}
                        elements={treeElements}
                        testId="tables-tree"
                      />
                      <Form.Message>
                        {fieldState.error && fieldState.error.message}
                      </Form.Message>
                    </>
                  );
                }}
              />
            </Card>
          </Grid.Item>
          <Grid.Item colSpan={6}>
            <Card title="Partitions" className="p-0">
              <Text pale className="text-xs leading-4">
                The affected partitions are the ones that satisfy the condition on
                the specified time column.
              </Text>
              {/* partitioning.column_name */}
              <Form.Field
                control={form.control}
                name="partitioning.column_name"
                render={({ field }) => {
                  return (
                    <Form.Item className="mt-2">
                      <div>
                        <Form.Label>
                          Time Column <span className="text-red-600">*</span>
                        </Form.Label>
                        <Text pale className="text-xs leading-4">
                          The time column will be used with the condition to select
                          which data will be affected. This column should be preset
                          in all the tables/schemas that the policy is using.
                        </Text>
                      </div>
                      <Form.Control>
                        <Select.Root
                          label="Column Name"
                          value={field.value}
                          name="select-column-name"
                          disabled={eligibleColumns.length === 0}
                          onValueChange={(newValue: string) => {
                            form.setValue('partitioning.column_name', newValue, {
                              shouldValidate: true,
                            });
                          }}
                        >
                          <div className="flex">
                            {showColumnsWarning && (
                              <Tooltip
                                className="ml-2"
                                title={
                                  'There is no column that is part of all the selected tables/schemas. Consider creating more that one policy.'
                                }
                              >
                                <WarningOutlined
                                  className="text-xl text-yellow-500"
                                  data-testid="column-warning"
                                />
                              </Tooltip>
                            )}
                          </div>
                          <Select.Content>
                            <Select.Group>
                              {eligibleColumns.map(el => {
                                return (
                                  <Select.Item key={el} value={el}>
                                    {el}
                                  </Select.Item>
                                );
                              })}
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  );
                }}
              />

              {/* condition */}
              <Form.Field
                control={form.control}
                name="partitioning"
                render={({ formState }) => {
                  const partitionValueError = formState.errors.partitioning?.value;

                  return (
                    <div className="mt-2 flex flex-col gap-2">
                      <div>
                        <Form.Label>
                          Condition <span className="text-red-600">*</span>
                        </Form.Label>
                        <Text pale className="text-xs leading-4">
                          It is used to select the partitions that will be affected
                          by policy actions.
                        </Text>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex flex-col gap-2">
                          <Form.Field
                            control={form.control}
                            name="partitioning.operation"
                            render={({ field }) => {
                              const value = field.value;
                              return (
                                <>
                                  <Form.Control>
                                    <Select.Root
                                      label="Operation"
                                      value={value}
                                      name="select-operation"
                                      onValueChange={(
                                        newValue: TPolicyPartitioningOperation,
                                      ) => {
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Select.Content>
                                        <Select.Group>
                                          <Select.Item value="<=">
                                            {'<='}
                                          </Select.Item>
                                          <Select.Item value="<">{'<'}</Select.Item>
                                        </Select.Group>
                                      </Select.Content>
                                    </Select.Root>
                                  </Form.Control>
                                </>
                              );
                            }}
                          />
                        </div>
                        <Form.Field
                          control={form.control}
                          name="partitioning.value"
                          render={({ field }) => {
                            const value = field.value;
                            return (
                              <>
                                <Form.Control>
                                  <Input
                                    value={value}
                                    onChange={e => {
                                      if (
                                        INTEGER_VALUE_REGEXP.test(e.target.value) ||
                                        e.target.value === ''
                                      ) {
                                        field.onChange(
                                          e.target.value === ''
                                            ? '0'
                                            : parseInt(e.target.value).toString(),
                                        );
                                      }
                                    }}
                                    type="text"
                                    placeholder="1"
                                    className="inline-flex w-[80px]"
                                    data-testid="partitioning-value"
                                  />
                                </Form.Control>
                              </>
                            );
                          }}
                        />
                        <div className="flex flex-col gap-2">
                          <Form.Field
                            control={form.control}
                            name="partitioning.unit"
                            render={({ field }) => {
                              const value = field.value;
                              return (
                                <>
                                  <Form.Control>
                                    <Select.Root
                                      name="select-time-unit"
                                      value={value}
                                      label="Time Unit"
                                      onValueChange={(
                                        newValue: TPolicyPartitioningUnit,
                                      ) => {
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Select.Content>
                                        <Select.Group>
                                          <Select.Item value="days">
                                            day(s)
                                          </Select.Item>
                                          <Select.Item value="months">
                                            month(s)
                                          </Select.Item>
                                          <Select.Item value="years">
                                            year(s)
                                          </Select.Item>
                                        </Select.Group>
                                      </Select.Content>
                                    </Select.Root>
                                  </Form.Control>

                                  <Form.Message />
                                </>
                              );
                            }}
                          />
                        </div>
                      </div>
                      {partitionValueError && (
                        <Form.Message>{partitionValueError.message}</Form.Message>
                      )}
                    </div>
                  );
                }}
              />
            </Card>

            <Card title="Actions" className="mt-2 p-0">
              <Text pale className="text-xs leading-4">
                Define the actions that will be applied the selected partitions.
              </Text>

              <div className="mt-2 flex flex-col gap-2">
                <Form.Field
                  control={form.control}
                  name="actions"
                  render={({ fieldState }) => {
                    return (
                      <>
                        {/* forceMerge */}
                        <Form.Field
                          control={form.control}
                          // FORCE MERGE
                          name="actions.forceMerge"
                          render={({ field }) => {
                            return (
                              <div>
                                <Form.Item layout="horizontal">
                                  <Form.Control>
                                    <Checkbox
                                      checked={field.value.enabled}
                                      data-testid="forceMerge-enabled"
                                      onChange={e => {
                                        field.onChange({
                                          ...field.value,
                                          enabled: e.target.checked,
                                        });
                                      }}
                                    />
                                  </Form.Control>
                                  <Form.Label>Force Merge to obtain</Form.Label>
                                  <Form.Control>
                                    <Input
                                      className="w-[80px]"
                                      disabled={!field.value.enabled}
                                      value={field.value.value}
                                      onChange={e => {
                                        if (
                                          INTEGER_VALUE_REGEXP.test(
                                            e.target.value,
                                          ) ||
                                          e.target.value === ''
                                        ) {
                                          field.onChange({
                                            ...field.value,
                                            value:
                                              e.target.value === ''
                                                ? '0'
                                                : parseInt(
                                                    e.target.value,
                                                  ).toString(),
                                          });
                                        }
                                      }}
                                      data-testid="forceMerge-value"
                                    />
                                  </Form.Control>
                                  <Form.Label>segments.</Form.Label>
                                </Form.Item>
                                <Form.Message />
                              </div>
                            );
                          }}
                        />

                        {/* Set Replicas */}
                        <Form.Field
                          control={form.control}
                          // SET REPLICAS
                          name="actions.setReplicas"
                          render={({ field }) => {
                            return (
                              <div>
                                <Form.Item layout="horizontal">
                                  <Form.Control>
                                    <Checkbox
                                      checked={field.value.enabled}
                                      data-testid="setReplicas-enabled"
                                      onChange={e => {
                                        field.onChange({
                                          ...field.value,
                                          enabled: e.target.checked,
                                        });
                                      }}
                                    />
                                  </Form.Control>
                                  <Form.Label>Set</Form.Label>
                                  <Form.Control>
                                    <Input
                                      className="w-[80px]"
                                      disabled={!field.value.enabled}
                                      value={field.value.value}
                                      onChange={e => {
                                        field.onChange({
                                          ...field.value,
                                          value: e.target.value,
                                        });
                                      }}
                                      data-testid="setReplicas-value"
                                    />
                                  </Form.Control>
                                  <Form.Label>replicas.</Form.Label>
                                </Form.Item>
                                <Form.Message />
                              </div>
                            );
                          }}
                        />

                        {/* deletePartition */}
                        <Form.Field
                          control={form.control}
                          name="actions.deletePartition"
                          render={({ field }) => {
                            return (
                              <Form.Item layout="horizontal">
                                <Form.Control>
                                  <Checkbox
                                    checked={field.value.enabled}
                                    data-testid="deletePartition-enabled"
                                    onChange={e => {
                                      field.onChange({
                                        ...field.value,
                                        enabled: e.target.checked,
                                      });
                                    }}
                                  />
                                </Form.Control>
                                <Form.Label>Delete partition</Form.Label>
                              </Form.Item>
                            );
                          }}
                        />

                        {/* Action array validation */}
                        {fieldState.error &&
                        fieldState.error.root &&
                        fieldState.error.root.message ? (
                          <Form.Message>
                            {fieldState.error.root.message}
                          </Form.Message>
                        ) : null}
                      </>
                    );
                  }}
                />
              </div>
            </Card>
          </Grid.Item>
        </Grid>

        <div className="flex w-full flex-col justify-end gap-2 md:flex-row">
          <Button kind={Button.kinds.SECONDARY} onClick={backToPolicyList}>
            Cancel
          </Button>
          <Button kind={Button.kinds.PRIMARY} type={Button.types.SUBMIT}>
            Save
          </Button>
        </div>
      </form>

      <Card title="Preview" className="p-0">
        <Text pale className="text-xs leading-4">
          This is a preview of all the affected partitions that will be affected by
          this policy.
        </Text>

        <div className="mt-2">
          {eligibleTables ? (
            <DataTable
              data={eligibleTables}
              columns={[
                {
                  header: 'Schema',
                  accessorKey: 'table_schema',
                  cell: ({ cell }) => {
                    return <Text>{cell.getValue<string>()}</Text>;
                  },
                },
                {
                  header: 'Table',
                  accessorKey: 'table_name',
                  cell: ({ cell }) => {
                    return <Text>{cell.getValue<string>()}</Text>;
                  },
                },
                {
                  header: 'Partitions affected',
                  accessorKey: 'partitions_affected',
                  cell: ({ cell }) => {
                    return <Text>{cell.getValue<string>()}</Text>;
                  },
                },
              ]}
            />
          ) : (
            <Text>
              Preview not available. To have a valid preview you need to fill the
              tables and partitions sections.
            </Text>
          )}
        </div>
      </Card>
    </Form.FormProvider>
  );
}
