import moment from 'moment';
import { render, screen, waitFor } from 'test/testUtils';
import DisplayUTCDate from '.';
import { DisplayUTCDateProps } from './DisplayUTCDate';

const dummyDate: string = '2020-03-25T10:26:26.161Z';

const defaultProps: DisplayUTCDateProps = {
  isoDate: dummyDate,
};
const setup = (props: Partial<DisplayUTCDateProps> = {}) => {
  const propsWithDefaults = { ...defaultProps, ...props };

  return render(<DisplayUTCDate {...propsWithDefaults} />);
};

describe('The DisplayUTCDate component', () => {
  // Use dynamic moment values in the assertions
  // to account for timezone differences between local and CI
  it('displays the date correctly', () => {
    const { container } = setup();

    expect(container.textContent).toBe(
      moment.utc(dummyDate).format('MMMM Do YYYY, h:mm'),
    );
  });

  it('shows a tooltip with local timestamp if tooltip = true', async () => {
    const { user } = setup({ tooltip: true });

    await user.hover(
      screen.getByText(moment.utc(dummyDate).format('MMMM Do YYYY, h:mm')),
    );

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    expect(screen.getByRole('tooltip').textContent).toBe(
      `Local Time: ${moment(dummyDate).format('MMMM Do YYYY, h:mm (UTC Z)')}`,
    );
  });
});
