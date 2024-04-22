import { render, screen } from '../../../test/testUtils';
import VerticalProgress, {
  VERTICAL_PROGRESS_BARS,
  VerticalProgressProps,
} from './VerticalProgress';

const defaultProps: VerticalProgressProps = {
  max: 50,
  current: 10,
  testId: 'vertical-progress',
};

const setup = (props: Partial<VerticalProgressProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<VerticalProgress {...combinedProps} />);
};

describe('The VerticalProgress component', () => {
  it('displays VERTICAL_PROGRESS_BARS bars by default', () => {
    setup();

    expect(screen.getByTestId('vertical-progress').childNodes).toHaveLength(
      VERTICAL_PROGRESS_BARS,
    );
  });

  it('displays correct number of filled bars', () => {
    setup();

    const numberOfFilled =
      (defaultProps.current / defaultProps.max) * VERTICAL_PROGRESS_BARS;

    const wrapper = screen.getByTestId('vertical-progress');

    expect(wrapper.getElementsByClassName('bg-crate-blue')).toHaveLength(
      numberOfFilled,
    );
  });

  it('displays correct number of non-filled bars', () => {
    setup();

    const numberOfNonFilled =
      VERTICAL_PROGRESS_BARS -
      (defaultProps.current / defaultProps.max) * VERTICAL_PROGRESS_BARS;

    const wrapper = screen.getByTestId('vertical-progress');

    expect(wrapper.getElementsByClassName('bg-gray-300')).toHaveLength(
      numberOfNonFilled,
    );
  });

  describe('when the testId prop is passed', () => {
    it('sets the testId correctly', () => {
      setup({
        testId: 'custom-test-id',
      });

      expect(screen.getByTestId('custom-test-id')).not.toBeNull();
    });
  });
});
