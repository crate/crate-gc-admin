import CreateJob from './CreateJob';
import { render, screen } from 'test/testUtils';

const setup = () => {
  return render(<CreateJob />);
};

describe('The "CreateJob" component', () => {
  it('renders the create job form', async () => {
    setup();

    expect(await screen.findByTestId('mocked-ace-editor')).toBeInTheDocument();
  });
});
