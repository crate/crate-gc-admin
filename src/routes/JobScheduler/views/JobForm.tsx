import { useForm, SubmitHandler } from 'react-hook-form';
import { cronParser, cn } from 'utils';
import { ApiOutput, apiPost, apiPut } from 'utils/api';
import { useState } from 'react';
import { Job, JobInput } from 'types';
import useGcApi from 'hooks/useGcApi';
import useExecuteSql from 'hooks/useExecuteSql';
import { useNavigate } from 'react-router-dom';
import { QueryResults } from 'types/query';
import {
  Button,
  Form,
  Grid,
  Input,
  LabelWithTooltip,
  Loader,
  SQLEditor,
  SQLResults,
  Switch,
  Text,
} from 'components';
import { ApiError } from 'types/api';

type JobFormAdd = { type: 'add' };
type JobFormEdit = { type: 'edit'; job: Job };

type JobFormProps = {
  type: 'add' | 'edit';
} & (JobFormAdd | JobFormEdit);

export default function JobForm(props: JobFormProps) {
  const { type } = props;
  const executeSql = useExecuteSql();
  const [showLoader, setShowLoader] = useState(false);
  const [queryResults, setQueryResults] = useState<QueryResults>(undefined);
  const [queryRunning, setQueryRunning] = useState(false);
  const gcApi = useGcApi();
  const navigate = useNavigate();

  const form = useForm<JobInput>({
    defaultValues:
      type === 'add'
        ? {
            name: '',
            cron: '',
            enabled: true,
            sql: '',
          }
        : {
            name: props.job.name,
            cron: props.job.cron,
            enabled: props.job.enabled,
            sql: props.job.sql,
          },
  });
  const errors = form.formState.errors;

  const backToJobList = () => {
    navigate('..', { relative: 'path' });
  };

  const onSubmit: SubmitHandler<JobInput> = async (data: JobInput) => {
    let result: ApiOutput<ApiError<JobInput> | Job>;
    setShowLoader(true);
    if (type === 'add') {
      // CREATE
      result = await apiPost<ApiError<JobInput> | Job>(
        gcApi,
        `/api/scheduled-jobs/`,
        data,
        {
          credentials: 'include',
        },
        false,
      );
    } else {
      // UPDATE
      const job = props.job;
      result = await apiPut<ApiError<JobInput> | Job>(
        gcApi,
        `/api/scheduled-jobs/${job.id}`,
        data,
        {
          credentials: 'include',
        },
        false,
      );
    }

    setShowLoader(false);
    if (result.success) {
      backToJobList();
    } else if (result.data && 'errors' in result.data) {
      Object.keys(result.data.errors).forEach(fieldInError => {
        if (result.data && 'errors' in result.data) {
          form.setError(fieldInError as keyof JobInput, {
            type: 'validate',
            message: result.data.errors[fieldInError as keyof JobInput].join(' '),
          });
        }
      });
    }
  };

  const cron = form.watch('cron');
  const cronHumanReadable = cronParser(cron);

  const executeQuery = () => {
    const sql = form.watch('sql');
    setQueryRunning(true);
    setQueryResults(undefined);
    executeSql(sql).then(({ data }) => {
      setQueryRunning(false);
      if (data) {
        setQueryResults(data);
      }
    });
  };

  const renderResults = () => {
    if (queryRunning) {
      return <Loader />;
    }
    return <SQLResults results={queryResults} />;
  };

  if (showLoader) {
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
        id="job-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-2 flex flex-col gap-2"
        autoComplete="off"
      >
        <Grid columns={Grid.COLS.N12} className="gap-2 md:gap-4">
          <Grid.Item colSpan={5}>
            <Form.Field
              control={form.control}
              name="name"
              rules={{
                required: 'Job Name is a required field.',
              }}
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label htmlFor="name">
                      Job Name <span className="text-red-600">*</span>
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

          <Grid.Item colSpan={5}>
            <Form.Field
              control={form.control}
              name="cron"
              rules={{
                required: 'Schedule is a required field.',
                validate: (value: string) => {
                  return cronParser(value) ? true : 'Invalid CRON schedule.';
                },
              }}
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label htmlFor="cron">
                      <LabelWithTooltip
                        label={
                          <>
                            Schedule <span className="text-red-600">*</span>
                          </>
                        }
                        message={'All jobs are scheduled in UTC time.'}
                        tooltipPlacement="top"
                      />
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} id="cron" placeholder="* * * * *" />
                    </Form.Control>
                    <Form.Message />

                    <Text
                      className={cn({
                        invisible: cronHumanReadable === null,
                        hidden: errors.cron,
                      })}
                    >
                      This job will run{' '}
                      <span className="font-bold">
                        {cronHumanReadable && cronHumanReadable.toLowerCase()}
                      </span>
                      .
                    </Text>
                  </Form.Item>
                );
              }}
            />
          </Grid.Item>

          <Grid.Item colSpan={2}>
            <div>
              <Form.Field
                control={form.control}
                name="enabled"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label htmlFor="enabled">Active</Form.Label>
                      <Form.Control>
                        <Switch.Root
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-2"
                          id="enabled"
                        />
                      </Form.Control>
                    </Form.Item>
                  );
                }}
              />
            </div>
          </Grid.Item>
        </Grid>

        <div>
          <Form.Field
            control={form.control}
            name="sql"
            rules={{
              required: 'SQL is a required field.',
            }}
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>
                    SQL <span className="text-red-600">*</span>
                  </Form.Label>
                  <Form.Control>
                    <SQLEditor
                      results={queryResults}
                      localStorageKey="sql-job-editor"
                      value={field.value}
                      onChange={query => {
                        form.setValue('sql', query, { shouldValidate: true });
                      }}
                      onExecute={executeQuery}
                      errorMessage={<Form.Message />}
                    />
                  </Form.Control>
                </Form.Item>
              );
            }}
          />
        </div>

        <div className="flex w-full flex-col justify-end gap-2 md:flex-row">
          <Button kind={Button.kinds.SECONDARY} onClick={backToJobList}>
            Cancel
          </Button>
          <Button kind={Button.kinds.PRIMARY} type={Button.types.SUBMIT}>
            Save
          </Button>
        </div>

        <div className="mt-4">{renderResults()}</div>
      </form>
    </Form.FormProvider>
  );
}
