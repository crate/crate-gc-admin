import { render, screen } from '../../../test/testUtils';
import GCSpin from './GCSpin.tsx';

const setup = (spinning: boolean) => {
  return render(
    <GCSpin spinning={spinning}>
      <span>Hello world</span>
    </GCSpin>,
  );
};

describe('The GCSpin component', () => {
  it('will render the children if condition is false', () => {
    setup(false);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  it('will render a spinner if condition is true', () => {
    setup(true);

    expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
