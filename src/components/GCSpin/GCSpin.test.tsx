import { render, screen } from 'test/testUtils';
import GCSpin, { GCSpinParams } from './GCSpin.tsx';

const defaultProps: GCSpinParams = {
  spinning: true,
};

const setup = (options: Partial<GCSpinParams> = {}) => {
  const combinedProps = {
    ...defaultProps,
    ...options,
  };

  return render(
    <GCSpin {...combinedProps}>
      <span>Hello world</span>
    </GCSpin>,
  );
};

describe('The GCSpin component', () => {
  it('will render the children if condition is false', () => {
    setup({ spinning: false });

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  it('will render a spinner if condition is true', () => {
    setup();

    expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('will use specified test id', () => {
    setup({
      spinnedTestId: 'custom-test-id',
    });

    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});
