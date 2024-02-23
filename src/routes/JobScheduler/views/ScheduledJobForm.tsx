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
  Input,
  LabelWithTooltip,
  Loader,
  SQLEditor,
  SQLResultsTable,
  Switch,
  Text,
} from 'components';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string(),
  cron: z.string(),
  enabled: z.boolean().default(true),
  sql: z.string(),
});
type TForm = z.infer<typeof formSchema>;

type ScheduledJobFormAdd = { type: 'add' };
type ScheduledJobFormEdit = { type: 'edit'; job: Job };
type JobApiError = {
  errors: {
    [key in keyof JobInput]: string[];
  };
  message: string;
  success: boolean;
};

type ScheduledJobFormProps = {
  type: 'add' | 'edit';
} & (ScheduledJobFormAdd | ScheduledJobFormEdit);

export default function ScheduledJobForm(props: ScheduledJobFormProps) {
  const { type } = props;
  const executeSql = useExecuteSql();
  const [showLoader, setShowLoader] = useState(false);
  const [queryResults, setQueryResults] = useState<QueryResults>(undefined);
  const [queryRunning, setQueryRunning] = useState(false);
  const gcApi = useGcApi();
  const navigate = useNavigate();

  const form = useForm<TForm>({
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
    navigate('..');
  };

  const onSubmit: SubmitHandler<TForm> = async (data: JobInput) => {
    let result: ApiOutput<JobApiError | Job>;
    setShowLoader(true);
    if (type === 'add') {
      // CREATE
      result = await apiPost<JobApiError | Job>(
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
      result = await apiPut<JobApiError | Job>(
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
    return <SQLResultsTable results={queryResults} />;
  };

  if (showLoader) {
    return (
      <div className="flex items-center justify-center w-full h-full">
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
        className="flex flex-col gap-4"
        autoComplete="off"
      >
        <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4">
          <div className="col-span-5 flex flex-col gap-2">
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
                      <Input
                        {...field}
                        id="name"
                        error={errors.name && errors.name.message}
                      />
                    </Form.Control>
                  </Form.Item>
                );
              }}
            />
          </div>

          <div className="col-span-5 flex flex-col gap-2">
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
                      <Input
                        {...field}
                        id="cron"
                        placeholder="* * * * *"
                        error={errors.cron && errors.cron.message}
                      />
                    </Form.Control>

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
          </div>

          <div className="col-span-2 flex gap-2 md:pt-8">
            <div>
              <Form.Field
                control={form.control}
                name="enabled"
                render={({ field }) => {
                  return (
                    <Form.Item className="space-y-1/2 flex gap-2">
                      <Form.Control>
                        <Switch.Root
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                          id="enabled"
                        />
                      </Form.Control>
                      <Form.Label className="mt-2" htmlFor="enabled">
                        Active
                      </Form.Label>
                    </Form.Item>
                  );
                }}
              />
            </div>
          </div>
        </div>

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
                      onExecute={() => {
                        executeQuery();
                      }}
                      error={errors.sql && errors.sql.message}
                    />
                  </Form.Control>
                </Form.Item>
              );
            }}
          />
        </div>

        <div className="w-full flex flex-col md:flex-row justify-end gap-2">
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
