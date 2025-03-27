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
import useGcApi from 'hooks/useGcApi';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Policy,
  PolicyFormSchemaInput,
  PolicyInput,
  TPolicyPartitioningOperation,
  TPolicyPartitioningUnit,
  TPolicyTarget,
} from 'types';
import { ApiError } from 'types/api';
import {
  mapPolicyInputToPolicyWithoutId,
  mapPolicyToPolicyInput,
} from '../tablePoliciesUtils/policies';
import { mapTableListEntriesToTreeItem } from '../tablePoliciesUtils/tableTree';
import { INTEGER_VALUE_REGEXP } from 'constants/utils';
import { WarningOutlined } from '@ant-design/icons';
import { EMPTY_POLICY_FORM } from 'constants/policies';
import { ApiOutput, apiPost, apiPut } from 'utils';
import useEligibleColumns from '../hooks/useEligibleColumns';
import usePolicyPreview from '../hooks/usePolicyPreview';
import {
  AUTOMATION_TAB_KEYS,
  AUTOMATION_TAB_QUERY_PARAM_KEY,
} from '../routes/AutomationTabsConstants';

type PolicyFormAdd = { type: 'add'; onSave?: () => void };
type PolicyFormEdit = { type: 'edit'; onSave?: () => void; policy: Policy };
type PolicyFormProps = PolicyFormAdd | PolicyFormEdit;

export default function PolicyForm(props: PolicyFormProps) {
  const { type, onSave } = props;
  const navigate = useNavigate();
  const gcApi = useGcApi();
  const [showLoader, setShowLoader] = useState(false);

  const form = useForm<PolicyInput>({
    defaultValues:
      type === 'add' ? EMPTY_POLICY_FORM : mapPolicyToPolicyInput(props.policy),
    resolver: zodResolver(PolicyFormSchemaInput),
  });
  const policyTargets = form.watch('targets');
  const policyPartitioning = form.watch('partitioning');
  const policyPartitioningColumnName = form.watch('partitioning.column_name');

  const {
    eligibleColumns,
    tables,
    loadingColumns,
    loadingTables,
    showColumnsWarning,
  } = useEligibleColumns({
    targets: policyTargets,
    columnName: policyPartitioningColumnName,
    clearColumnName: () => {
      form.setValue('partitioning.column_name', '');
    },
  });
  const { eligibleTables } = usePolicyPreview({
    tables: tables ? tables : [],
    targets: policyTargets,
    partitioning: policyPartitioning,
  });

  const validTables = tables?.filter(t => !t.system && t.is_partitioned) || [];

  const backToPolicyList = () => {
    navigate(`..?${AUTOMATION_TAB_QUERY_PARAM_KEY}=${AUTOMATION_TAB_KEYS.POLICIES}`);
  };

  const onSubmit: SubmitHandler<PolicyInput> = async (data: PolicyInput) => {
    if (onSave) {
      onSave();
    }

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

  if (showLoader || loadingTables) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader size={Loader.sizes.LARGE} />
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
                Specify which tables will be impacted by the policy.
              </Form.Description>
              <Form.Field
                control={form.control}
                name="targets"
                render={({ field }) => {
                  const treeElements = mapTableListEntriesToTreeItem(
                    validTables!,
                    policyTargets,
                  );

                  const handleTreeCheck = (selectedKeys: {
                    checked: string[];
                    halfChecked: string[];
                  }) => {
                    const checkedKeys = selectedKeys.checked;

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

                  if (validTables!.length === 0) {
                    return <Empty className="mt-4" />;
                  }

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
                      <Form.Message />
                    </>
                  );
                }}
              />
            </Card>
          </Grid.Item>
          <Grid.Item colSpan={6}>
            <Card title="Partitions" className="p-0">
              <Text pale className="text-xs leading-4">
                Specify which partitions will be impacted by the policy.
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
                          Select a timestamp column used for partitioning. Ensure
                          this column exists in all relevant tables or schemas for
                          the policy to work correctly.
                        </Text>
                      </div>
                      <Form.Control>
                        <span className="flex items-center gap-2">
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
                            <Select.Content>
                              {eligibleColumns.map(el => {
                                return (
                                  <Select.Item key={el.name} value={el.name}>
                                    {el.name}
                                  </Select.Item>
                                );
                              })}
                            </Select.Content>
                          </Select.Root>
                          {loadingColumns && <Loader size={Loader.sizes.SMALL} />}
                        </span>
                      </Form.Control>
                      {showColumnsWarning ? (
                        <Form.Message
                          className="flex gap-2 font-normal text-black"
                          data-testid="column-warning"
                        >
                          <WarningOutlined className="text-orange-500" />
                          <Text pale displayAs={Text.elements.SPAN}>
                            The selected column is not part of all the selected
                            targets. Consider creating multiple policies instead.
                          </Text>
                        </Form.Message>
                      ) : (
                        <Form.Message />
                      )}
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
                          Filter the partitions that will be affected by the policy.
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
                                        <Select.Item value="<">
                                          older than
                                        </Select.Item>
                                        <Select.Item value="<=">
                                          exactly or older than
                                        </Select.Item>
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
                                        <Select.Item value="days">
                                          day(s)
                                        </Select.Item>
                                        <Select.Item value="weeks">
                                          week(s)
                                        </Select.Item>
                                        <Select.Item value="months">
                                          month(s)
                                        </Select.Item>
                                        <Select.Item value="years">
                                          year(s)
                                        </Select.Item>
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
                Define the actions that will be applied to the eligible partition(s).
                Note that the delete action is exclusive, meaning that it cannot be
                executed together with force merge and/or set replicas actions.
              </Text>

              <div className="mt-2 flex flex-col gap-2">
                <Form.Field
                  control={form.control}
                  name="actions"
                  render={({ field: actionField }) => {
                    return (
                      <>
                        <Form.Item>
                          <Form.Control>
                            <span>
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
                                            disabled={
                                              actionField.value.deletePartition
                                                .enabled
                                            }
                                            onChange={e => {
                                              const setReplicas = {
                                                ...field.value,
                                                enabled: e.target.checked,
                                              };
                                              actionField.onChange({
                                                ...actionField.value,
                                                setReplicas,
                                              });
                                              field.onChange(setReplicas);
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
                                              const setReplicas = {
                                                ...field.value,
                                                value: e.target.value,
                                              };
                                              actionField.onChange({
                                                ...actionField.value,
                                                setReplicas,
                                              });
                                              field.onChange(setReplicas);
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
                                            disabled={
                                              actionField.value.deletePartition
                                                .enabled
                                            }
                                            onChange={e => {
                                              const forceMerge = {
                                                ...field.value,
                                                enabled: e.target.checked,
                                              };
                                              actionField.onChange({
                                                ...actionField.value,
                                                forceMerge,
                                              });
                                              field.onChange(forceMerge);
                                            }}
                                          />
                                        </Form.Control>
                                        <Form.Label>
                                          Force Merge to obtain
                                        </Form.Label>
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
                                                const forceMerge = {
                                                  ...field.value,
                                                  value:
                                                    e.target.value === ''
                                                      ? '0'
                                                      : parseInt(
                                                          e.target.value,
                                                        ).toString(),
                                                };
                                                actionField.onChange({
                                                  ...actionField.value,
                                                  forceMerge,
                                                });
                                                field.onChange(forceMerge);
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

                              <Text
                                pale
                                className="flex h-[42px] items-center justify-center"
                              >
                                OR
                              </Text>

                              {/* deletePartition */}
                              <Form.Field
                                control={form.control}
                                name="actions.deletePartition"
                                render={({ field }) => {
                                  return (
                                    <Form.Item
                                      layout="horizontal"
                                      className="h-[42px]"
                                    >
                                      <Form.Control>
                                        <Checkbox
                                          checked={field.value.enabled}
                                          data-testid="deletePartition-enabled"
                                          disabled={
                                            actionField.value.forceMerge.enabled ||
                                            actionField.value.setReplicas.enabled
                                          }
                                          onChange={e => {
                                            const deletePartition = {
                                              ...field.value,
                                              enabled: e.target.checked,
                                            };
                                            actionField.onChange({
                                              ...actionField.value,
                                              deletePartition,
                                            });
                                            field.onChange(deletePartition);
                                          }}
                                        />
                                      </Form.Control>
                                      <Form.Label>
                                        Delete eligible partition(s)
                                      </Form.Label>
                                    </Form.Item>
                                  );
                                }}
                              />

                              {/* Action array validation */}
                              {/* {fieldState.error &&
                        fieldState.error.root &&
                        fieldState.error.root.message ? (
                          <Form.Message>
                            {fieldState.error.root.message}
                          </Form.Message>
                        ) : null} */}
                            </span>
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
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
            <Text testId="preview-not-available">
              Preview not available. To have a valid preview you need to fill the
              tables and partitions sections.
            </Text>
          )}
        </div>
      </Card>
    </Form.FormProvider>
  );
}
