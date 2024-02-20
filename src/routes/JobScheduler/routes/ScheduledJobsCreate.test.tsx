import ScheduledJobsCreate from './ScheduledJobsCreate';
import { render, screen } from 'test/testUtils';

const setup = () => {
  return render(<ScheduledJobsCreate />);
};

describe('The "ScheduledJobsCreate" component', () => {
  it('renders the create job form', () => {
    setup();

    expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
  });
});
