import { useLocation } from '../../../../__mocks__/react-router-dom';
import Policies from './Policies';
import { render, screen, waitFor } from '../../../../test/testUtils';
import policies from 'test/__mocks__/policies';
import { policiesLogsWithName } from 'test/__mocks__/policiesLogs';

const setup = () => {
  return render(<Policies />);
};

describe('The "Policies" component', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({
      pathname: '',
    });
  });

  it('renders 2 tabs', async () => {
    setup();

    await waitFor(async () => {
      expect(await screen.findByText('Overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  describe('the "Overview" tab', () => {
    it('renders the policy form', async () => {
      const { user } = setup();

      await waitFor(async () => {
        expect(await screen.findByText('Overview')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Overview'));

      await waitFor(async () => {
        expect(await screen.findByText(policies[0].name)).toBeInTheDocument();
      });
    });
  });

  describe('the "Logs" tab', () => {
    it('renders the logs table', async () => {
      const { user } = setup();

      await waitFor(async () => {
        expect(await screen.findByText('Logs')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Logs'));

      await waitFor(async () => {
        expect(
          await screen.findByText(policiesLogsWithName[0].job_name),
        ).toBeInTheDocument();
      });
    });
  });
});
