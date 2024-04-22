import { render, screen } from 'test/testUtils';
import useCrateApi from 'hooks/useCrateApi';

function MockComponent() {
  const crateApi = useCrateApi();

  return (
    <div>
      <div data-testid="baseUrl">{crateApi.defaults.baseURL}</div>
      <div data-testid="withCredentials">
        {crateApi.defaults.withCredentials && 'true'}
      </div>
      <div data-testid="header.ContentType">
        {crateApi.defaults.headers['Content-Type']}
      </div>
    </div>
  );
}

const setup = () => {
  return render(<MockComponent />);
};

describe('The useCrateApi hook', () => {
  it('uses the correct baseUrl', () => {
    setup();

    expect(screen.getByTestId('baseUrl')).toHaveTextContent('CRATE_URL');
  });

  it('uses includes credentials', () => {
    setup();

    expect(screen.getByTestId('withCredentials')).toHaveTextContent('true');
  });

  it('uses correct content-type', () => {
    setup();

    expect(screen.getByTestId('header.ContentType')).toHaveTextContent(
      'application/json; charset=utf-8',
    );
  });
});
