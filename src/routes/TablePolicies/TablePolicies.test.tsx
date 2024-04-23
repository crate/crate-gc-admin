import policies from 'test/__mocks__/policies';
import TablePolicies from '.';
import { render, screen, waitFor, within } from 'test/testUtils';
import { useParams } from '__mocks__/react-router-dom';

const setup = () => {
  return render(<TablePolicies />);
};

const waitForRoutesRender = async () => {
  const indexRoute = screen.getByTestId('index_path');
  const createRoute = screen.getByTestId('create_path');
  const editRoute = screen.getByTestId(':policyId_path');

  // Wait for policies table in index route
  await waitFor(async () => {
    expect(
      await within(indexRoute).findByText(policies[0].name),
    ).toBeInTheDocument();
  });

  // Wait for create route
  await waitFor(async () => {
    expect(await within(createRoute).findByRole('form')).toBeInTheDocument();
  });

  // Wait for edit route
  await waitFor(async () => {
    expect(await within(editRoute).findByRole('form')).toBeInTheDocument();
  });
};

describe('The "TablePolicies" component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({
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

    expect(screen.getByText('Table Policies')).toBeInTheDocument();
  });
});
