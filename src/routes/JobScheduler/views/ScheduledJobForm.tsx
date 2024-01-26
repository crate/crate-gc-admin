import { useForm, SubmitHandler } from 'react-hook-form';
import Input from '../../../components/Input';
import { Button, Text, Loader } from '@crate.io/crate-ui-components';
import Checkbox from '../../../components/Checkbox';
import SQLEditor from '../../../components/SQLEditor/SQLEditor';
import { ApiOutput, apiPost, apiPut } from '../../../hooks/api';
import { useCallback, useEffect, useState } from 'react';
import { useGCContext } from '../../../contexts';
import executeSql, { QueryResults } from '../../../utils/gc/executeSql';
import SQLResultsTable from '../../../components/SQLResultsTable/SQLResultsTable';
import { cronParser } from '../../../utils/cron';
import { Job, JobInput } from '../../../types';
import cn from '../../../utils/cn';

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
    setError,
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
    let result: ApiOutput<JobApiError | Job>;
    setShowLoader(true);
    if (type === 'add') {
      // CREATE
      result = await apiPost<JobApiError | Job>(
        `${gcUrl}/api/scheduled-jobs/`,
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
        `${gcUrl}/api/scheduled-jobs/${job.id}`,
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
          setError(fieldInError as keyof JobInput, {
            type: 'validate',
            message: result.data.errors[fieldInError as keyof JobInput].join(' '),
          });
        }
      });
    }
  };

  const cron = watch('cron');
  const sqlValue = watch('sql');
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
    register('sql', {
      required: 'SQL is a required field.',
      value: type === 'edit' ? props.job.sql : '',
    });
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
      id="job-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4">
        <div className="col-span-5 flex flex-col gap-2">
          <Input
            {...register('name', { required: 'Job Name is a required field.' })}
            required
            id="name"
            label={'Job Name'}
            error={errors.name && errors.name.message}
          />
        </div>

        <div className="col-span-5 flex flex-col gap-2">
          <Input
            {...register('cron', {
              required: 'Schedule is a required field.',
              validate: (value: string) => {
                return cronParser(value) !== null ? true : 'Invalid CRON schedule.';
              },
            })}
            id="cron"
            required
            label={'Schedule'}
            placeholder="* * * * *"
            error={errors.cron && errors.cron.message}
          />

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
        </div>

        <div className="col-span-2 flex flex-col gap-2 md:pt-8">
          <Checkbox {...register('enabled')} label={'Active'} id="job_active" />
        </div>
      </div>

      <div>
        <SQLEditor
          results={queryResults}
          localStorageKey="sql-job-editor"
          value={sqlValue || ''}
          onChange={query => {
            setValue('sql', query, { shouldValidate: true });
          }}
          onExecute={() => {
            executeQuery();
          }}
          error={errors.sql && errors.sql.message}
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
  );
}
