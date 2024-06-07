import { render, screen, waitFor, within } from 'test/testUtils';
import Automation from '.';
import { useParams } from '__mocks__/react-router-dom';
import scheduledJobs from 'test/__mocks__/scheduledJobs';
import {
  automationCreateJob,
  automationCreatePolicy,
  automationEditJob,
  automationEditPolicy,
} from 'constants/paths';

const setup = () => {
  return render(<Automation />);
};

const waitForRoutesRender = async () => {
  const indexRoute = screen.getByTestId('index_path');
  const createJobRoute = screen.getByTestId(`${automationCreateJob.path}_path`);
  const editJobRoute = screen.getByTestId(`${automationEditJob.path}_path`);
  const createPolicyRoute = screen.getByTestId(
    `${automationCreatePolicy.path}_path`,
  );
  const editPolicyRoute = screen.getByTestId(`${automationEditPolicy.path}_path`);

  // Wait for job table in index route
  await waitFor(async () => {
    expect(
      await within(indexRoute).findByText(scheduledJobs[0].name),
    ).toBeInTheDocument();
  });

  // Wait for create job route
  await waitFor(async () => {
    expect(
      await within(createJobRoute).findByTestId('mocked-ace-editor'),
    ).toBeInTheDocument();
  });

  // Wait for edit job route
  await waitFor(async () => {
    expect(
      await within(editJobRoute).findByTestId('mocked-ace-editor'),
    ).toBeInTheDocument();
  });

  // Wait for create policy route
  await waitFor(async () => {
    expect(await within(createPolicyRoute).findByRole('form')).toBeInTheDocument();
  });

  // Wait for edit policy route
  await waitFor(async () => {
    expect(await within(editPolicyRoute).findByRole('form')).toBeInTheDocument();
  });
};

describe('The "Automation" component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      jobId: 'JOB_ID',
      policyId: 'POLICY_ID',
    });
  });

  it('renders the routes', async () => {
    setup();

    await waitForRoutesRender();
  });

  it('renders the headings', async () => {
    setup();

    await waitForRoutesRender();

    expect(screen.getByText('Automation')).toBeInTheDocument();
  });
});
