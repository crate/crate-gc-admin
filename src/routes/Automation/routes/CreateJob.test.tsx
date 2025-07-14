import { render, screen } from 'test/testUtils';
import CreateJob from './CreateJob';

const setup = () => {
  return render(<CreateJob />);
};

describe('The "CreateJob" component', () => {
  it('renders the create job form', async () => {
    setup();

    expect(await screen.findByTestId('mocked-ace-editor')).toBeInTheDocument();
  });
});
