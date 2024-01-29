import { PropsWithChildren } from 'react';
import RoundedIcon, { RoundedIconProps } from './RoundedIcon';
import { render, screen } from '../../../test/testUtils';

const defaultProps: PropsWithChildren<RoundedIconProps> = {
  children: 'ICON',
  testId: 'test-icon',
};

const setup = (props: Partial<PropsWithChildren<RoundedIconProps>> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<RoundedIcon {...combinedProps} />);
};

describe('the "RoundedIcon" component', () => {
  it('displays a rounded icon as <i>', () => {
    setup();

    expect(screen.getByTestId('test-icon')).toHaveClass('rounded-full');
    expect(screen.getByTestId('test-icon').nodeName).toBe('I');
  });
});
