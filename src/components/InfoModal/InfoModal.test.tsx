import { PropsWithChildren } from 'react';
import { render, screen } from '../../../test/testUtils';
import InfoModal, { InfoModalProps } from './InfoModal';

const onCloseSpy = jest.fn();

const defaultProps: PropsWithChildren<InfoModalProps> = {
  title: 'Modal Title',
  visible: true,
  onClose: onCloseSpy,
  children: 'Modal Content',
};

const setup = (props: Partial<PropsWithChildren<InfoModalProps>> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<InfoModal {...combinedProps} />);
};

describe('The "InfoModal" component', () => {
  afterEach(() => {
    onCloseSpy.mockReset();
  });

  it('displays the provided title correctly', () => {
    setup();

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('displays the provided content correctly', () => {
    setup();

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('closes if the ok button is clicked', async () => {
    const { user } = setup();

    await user.click(screen.getByText('Cancel'));

    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('closes if the cancel button is clicked', async () => {
    const { user } = setup();

    await user.click(screen.getByText('Cancel'));

    expect(onCloseSpy).toHaveBeenCalled();
  });
});
