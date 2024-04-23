import { PropsWithChildren } from 'react';
import { render, screen } from 'test/testUtils';
import CustomPreTag from './CustomPreTag';

const defaultProps: PropsWithChildren = {
  children: <div>the code sample</div>,
};
const setup = (props: PropsWithChildren = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<CustomPreTag {...combinedProps} />);
};

describe('The CustomPreTag component', () => {
  it('displays the child nodes', () => {
    setup();

    expect(screen.getByText('the code sample')).toBeInTheDocument();
  });
});
