import { useForm, SubmitHandler } from 'react-hook-form';
import Input from '../../../components/Input';
import { Button, Text, Loader } from '@crate.io/crate-ui-components';
import Checkbox from '../../../components/Checkbox';
import SQLEditor from '../../../components/SQLEditor/SQLEditor';
import { apiPost, apiPut } from '../../../hooks/api';
import { useCallback, useEffect, useState } from 'react';
import { useGCContext } from '../../../contexts';
import executeSql, { QueryResults } from '../../../utils/gc/executeSql';
import SQLResultsTable from '../../../components/SQLResultsTable/SQLResultsTable';
import { cronParser } from '../../../utils/cron';
import { Job, JobInput } from '../../../types';

type ScheduledJobFormAdd = { type: 'add' };
type ScheduledJobFormEdit = { type: 'edit'; job: Job };

type ScheduledJobFormProps = {
  backToJobList: () => void;
} & (ScheduledJobFormAdd | ScheduledJobFormEdit);

export default function ScheduledJobForm(props: ScheduledJobFormProps) {
  const { backToJobList, type } = props;
  const { gcUrl, sqlUrl } = useGCContext();
  const [showLoader, setShowLoader] = useState(false);
  const [queryResults, setQueryResults] = useState<QueryResults>(undefined);
  const [queryRunning, setQueryRunning] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobInput>({
    defaultValues:
      type === 'add'
        ? {
            enabled: true,
          }
        : {
            name: props.job.name,
            cron: props.job.cron,
            enabled: props.job.enabled,
            sql: props.job.sql,
          },
  });
  const onSubmit: SubmitHandler<JobInput> = async (data: JobInput) => {
    let result;
    setShowLoader(true);
    if (type === 'add') {
      // CREATE
      result = await apiPost(`${gcUrl}/api/scheduled-jobs/`, data, {
        credentials: 'include',
      });
    } else {
      // UPDATE
      const job = props.job;
      result = await apiPut(`${gcUrl}/api/scheduled-jobs/${job.id}`, data, {
        credentials: 'include',
      });
    }

    setShowLoader(false);
    if (result.success) {
      backToJobList();
    }
  };

  const cron = watch('cron');
  const cronHumanReadable = cronParser(cron);

  const executeQuery = useCallback(() => {
    const sql = watch('sql');
    setQueryRunning(true);
    setQueryResults(undefined);
    executeSql(sqlUrl, sql).then(({ data }) => {
      setQueryRunning(false);
      if (data) {
        setQueryResults(data);
      }
    });
  }, []);

  const renderResults = () => {
    if (queryRunning) {
      return <Loader />;
    }
    return <SQLResultsTable results={queryResults} />;
  };

  useEffect(() => {
    register('sql', { required: true, value: type === 'edit' ? props.job.sql : '' });
  }, [register]);

  if (showLoader) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <form
      role="form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 flex flex-col gap-2">
          <Input
            {...register('name', { required: true })}
            required
            id="name"
            label={'Job Name'}
            error={
              errors.name && (
                <Text className="text-red-500">Job Name is a required field.</Text>
              )
            }
          />
        </div>

        <div className="col-span-5 flex flex-col gap-2">
          <Input
            {...register('cron', {
              required: true,
              validate: (value: string) => {
                return cronParser(value) !== null;
              },
            })}
            id="cron"
            required
            label={'Schedule'}
            placeholder="* * * * *"
            error={
              errors.cron && errors.cron.type === 'required' ? (
                <Text className="text-red-500">Schedule is a required field.</Text>
              ) : errors.cron && errors.cron.type === 'validate' ? (
                <></>
              ) : undefined
            }
          />

          {cronHumanReadable === null &&
          !(errors.cron && errors.cron.type === 'required') ? (
            <Text>Invalid CRON schedule.</Text>
          ) : cronHumanReadable !== null ? (
            <Text>
              This job will run{' '}
              <span className="font-bold">{cronHumanReadable.toLowerCase()}</span>.
            </Text>
          ) : null}
        </div>

        <div className="col-span-1 flex flex-col gap-2 pt-8">
          <Checkbox {...register('enabled')} label={'Active'} id="job_active" />
        </div>
      </div>

      <div>
        <SQLEditor
          results={queryResults}
          localStorageKey="sql-job-editor"
          runButtonLabel="Test Queries"
          value={type === 'edit' ? props.job.sql : ''}
          onChange={query => {
            setValue('sql', query, { shouldValidate: true });
          }}
          onExecute={() => {
            executeQuery();
          }}
          error={
            errors.cron && (
              <Text className="text-red-500">SQL is a required field.</Text>
            )
          }
        />
      </div>

      <div className="flex justify-between">
        <Button kind={Button.kinds.SECONDARY} onClick={backToJobList}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button kind={Button.kinds.PRIMARY} type={Button.types.SUBMIT}>
            Save
          </Button>
        </div>
      </div>

      <div className="mt-4">{renderResults()}</div>
    </form>
  );
}
