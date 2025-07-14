import { useParams } from '__mocks__/react-router-dom';
import { render, screen } from 'test/testUtils';
import { policy } from 'test/__mocks__/policy';
import { EditPolicy } from '.';

const setup = () => {
  return render(<EditPolicy />);
};

const waitForFormRender = async () => {
  await screen.findByRole('form');
};

describe('The "EditPolicy" component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      policyId: 'POLICY_ID',
    });
  });

  it('renders the edit policy form', async () => {
    setup();

    await waitForFormRender();

    expect(screen.getByLabelText(/Policy Name/)).toHaveValue(policy.name);
  });
});
