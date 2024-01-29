import { render, screen } from '../../../test/testUtils';
import Loader, { LoaderProps } from './Loader';

const defaultProps: LoaderProps = {
  size: Loader.sizes.SMALL,
  color: Loader.colors.PRIMARY,
};
const setup = (props: Partial<LoaderProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Loader {...combinedProps} />);
};

describe('The Loader component', () => {
  it('displays the loader as an accessible alert', () => {
    setup();

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays the loader at the correct size', () => {
    setup({
      size: Loader.sizes.LARGE,
    });

    expect(screen.getByRole('alert').firstElementChild!.getAttribute('height')).toBe(
      `${Loader.sizes.LARGE}`,
    );
    expect(screen.getByRole('alert').firstElementChild!.getAttribute('width')).toBe(
      `${Loader.sizes.LARGE}`,
    );
  });

  it('displays the loader in the correct color', () => {
    setup({ color: Loader.colors.SECONDARY });

    expect(screen.getByRole('alert').firstElementChild!.classList).toContain(
      Loader.colors.SECONDARY,
    );
  });

  it('adds a test id', () => {
    setup();

    expect(screen.getByRole('alert').getAttribute('data-testid')).toBe(
      'crate-loading-spinner',
    );
  });

  it('displays the message if a message is passed', () => {
    setup({
      message: <div>Your resource is loading</div>,
    });

    expect(screen.getByText('Your resource is loading')).toBeInTheDocument();
  });
});
