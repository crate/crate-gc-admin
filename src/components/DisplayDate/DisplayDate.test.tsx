import moment from 'moment';
import { DisplayDateProps } from './DisplayDate';
import { render } from 'test/testUtils';
import DisplayDate from '.';

const dummyDate: string = '2020-03-25T10:26:26.161Z';

const defaultProps: DisplayDateProps = {
  isoDate: dummyDate,
};
const setup = (props: Partial<DisplayDateProps> = {}) => {
  const propsWithDefaults = { ...defaultProps, ...props };

  return render(
    <DisplayDate
      isoDate={propsWithDefaults.isoDate}
      format={propsWithDefaults.format}
    />,
  );
};

describe('The DisplayDate component', () => {
  // Use dynamic moment values in the assertions
  // to account for timezone differences between local and CI
  it('displays the date correctly using the given format', () => {
    const { container } = setup({ format: 'dddd' });

    expect(container.textContent).toBe(moment(dummyDate).format('dddd'));
  });

  it('uses the default format if no format is given', () => {
    const { container } = setup();

    expect(container.textContent).toBe(
      moment(dummyDate).format('MMMM Do YYYY, h:mm'),
    );
  });
});
