import { render, screen } from '../../../test/testUtils';
import CardHeader, { CardHeaderProps } from './CardHeader';

const defaultProps: CardHeaderProps = {
  title: 'Resource A',
  type: CardHeader.types.CLUSTER,
  extra: <a href="https://cratedb.com">View</a>,
};
const setup = (props: Partial<CardHeaderProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<CardHeader {...combinedProps} />);
};

describe('The CardHeader component', () => {
  it('displays a title', () => {
    setup({ title: 'A new resource' });

    expect(screen.getByText('A new resource')).toBeInTheDocument();
  });

  it('displays a link pointing to the given URL', () => {
    setup({
      extra: <a href="https://foo.io">View</a>,
    });

    expect(screen.getByText('View').getAttribute('href')).toBe('https://foo.io');
  });

  it(`displays the ${CardHeader.types.CLUSTER} icon when the ${CardHeader.types.CLUSTER} type is passed`, () => {
    setup({ type: CardHeader.types.CLUSTER });

    expect(screen.getByLabelText('apartment')).toBeInTheDocument();
  });

  it(`displays the ${CardHeader.types.WARN} icon when the ${CardHeader.types.WARN} type is passed`, () => {
    setup({ type: CardHeader.types.WARN });

    expect(screen.getByLabelText('exclamation-circle')).toBeInTheDocument();
  });
});
