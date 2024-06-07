import CreatePolicy from './CreatePolicy';
import { render, screen } from 'test/testUtils';

const setup = () => {
  return render(<CreatePolicy />);
};

const waitForFormRender = async () => {
  await screen.findByRole('form');
};

describe('The "CreatePolicy" component', () => {
  it('renders the create policy form', async () => {
    setup();

    await waitForFormRender();
  });
});
