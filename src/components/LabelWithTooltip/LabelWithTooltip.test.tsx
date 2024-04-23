import { render, screen } from 'test/testUtils';
import LabelWithTooltip, { TLabelWithTooltip } from './LabelWithTooltip';

const defaultProps: TLabelWithTooltip = {
  label: 'The input label',
  message: 'the tooltip message',
};
const setup = (props: Partial<TLabelWithTooltip> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<LabelWithTooltip {...combinedProps} />);
};

describe('The LabelWithTooltip component', () => {
  it('displays the label passed', () => {
    setup();

    expect(screen.getByText('The input label')).toBeInTheDocument();
  });

  it('displays the tooltip when the label is hovered', () => {
    const { user } = setup();

    user.hover(screen.getByText('The input label'));
  });
});
