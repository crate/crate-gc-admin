import { render, screen } from '../../../test/testUtils';
import useGcApi from '../useGcApi';

function MockComponent() {
  const gcApi = useGcApi();

  return (
    <div>
      <div data-testid="baseUrl">
        {gcApi.defaults.baseURL === '' ? 'BASE_URL' : 'ERROR'}
      </div>
      <div data-testid="withCredentials">
        {gcApi.defaults.withCredentials && 'true'}
      </div>
    </div>
  );
}

const setup = () => {
  return render(<MockComponent />);
};

describe('The useGcApi hook', () => {
  it('uses the correct baseUrl', () => {
    setup();

    expect(screen.getByTestId('baseUrl')).toHaveTextContent('BASE_URL');
  });

  it('uses includes credentials', () => {
    setup();

    expect(screen.getByTestId('withCredentials')).toHaveTextContent('true');
  });
});
