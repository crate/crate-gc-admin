import { useForm, SubmitHandler } from 'react-hook-form';
import Input from '../../../components/Input';
import { Button, Text, Loader } from '@crate.io/crate-ui-components';
import Checkbox from '../../../components/Checkbox';
import SQLEditor from '../../../components/SQLEditor/SQLEditor';
import { apiPost, apiPut } from '../../../hooks/api';
import { useCallback, useEffect, useState } from 'react';
import { useGCContext } from '../../../utils/context';
import executeSql, { QueryResults } from '../../../utils/gc/executeSql';
import SQLResultsTable from '../../../components/SQLResultsTable/SQLResultsTable';
import { cronParser } from '../../../utils/cron';

type SQLJobInput = {
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
};

type SQLSchedulerAddJobFormProps = { type: 'add' };
type SQLSchedulerEditJobFormProps = { type: 'edit'; job: SQLJob };

type SQLSchedulerJobFormProps = {
  backToClusterView: () => void;
} & (SQLSchedulerAddJobFormProps | SQLSchedulerEditJobFormProps);

export default function SQLSchedulerJobForm(props: SQLSchedulerJobFormProps) {
  const { backToClusterView, type } = props;
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
  } = useForm<SQLJobInput>({
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
  const onSubmit: SubmitHandler<SQLJobInput> = async (data: SQLJobInput) => {
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
      backToClusterView();
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex flex-col grow gap-2">
          <Input
            {...register('name', { required: true, maxLength: 99 })}
            label={'Job Name'}
          />
          {errors.name && <span>This field is required</span>}
        </div>

        <div className="flex flex-col grow gap-2">
          <Input
            {...register('cron', { required: true })}
            label={'Schedule'}
            placeholder="* * * * *"
          />
          {errors.cron && <span>This field is required</span>}
        </div>

        <div className="flex flex-col gap-2">
          <Checkbox {...register('enabled')} label={'Active'} />
        </div>
      </div>

      <div>
        <SQLEditor
          onExecute={() => {
            executeQuery();
          }}
          results={queryResults}
          value={type === 'edit' ? props.job.sql : ''}
          onChange={query => {
            setValue('sql', query, { shouldValidate: true });
          }}
          localStorageKey="sql-job-editor"
          showRunButton={false}
        />
        {errors.sql && <span>This field is required</span>}
      </div>

      <Text>
        {cronHumanReadable ? (
          <>
            This job will run{' '}
            <span className="font-bold">
              {cronHumanReadable.toLocaleLowerCase()}
            </span>
            .
          </>
        ) : (
          'Invalid CRON schedule.'
        )}
      </Text>

      <div className="flex justify-between">
        <Button kind={Button.kinds.SECONDARY} onClick={backToClusterView}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            kind={Button.kinds.SECONDARY}
            onClick={() => {
              executeQuery();
            }}
          >
            Test Queries
          </Button>
          <Button kind={Button.kinds.PRIMARY} type={Button.types.SUBMIT}>
            Save
          </Button>
        </div>
      </div>

      <div className="mt-4">{renderResults()}</div>
    </form>
  );
}
