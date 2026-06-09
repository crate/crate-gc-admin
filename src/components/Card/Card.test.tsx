import { screen, render } from 'test/testUtils';
import { CardProps } from './Card';
import Card from '.';

const onClickSpy = jest.fn();

const defaultProps: CardProps = {
  title: 'Title',
  disabled: false,
  children: <div>Children</div>,
  active: false,
};

const setup = (props: Partial<CardProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<Card {...combinedProps} />);
};

describe('The Card component', () => {
  afterEach(() => {
    onClickSpy.mockClear();
  });

  describe('displaying the title and childnodes', () => {
    it('displays the card title if a title is given in the props', () => {
      setup();

      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('displays the children if there are children given', () => {
      setup();

      expect(screen.getByText('Children')).toBeInTheDocument();
    });
  });

  describe('when it is clickable', () => {
    it('renders the card as a button', () => {
      setup({ onClick: onClickSpy });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls the onClick event if the card is clicked', async () => {
      const { user } = setup({ onClick: onClickSpy });

      await user.click(screen.getByRole('button'));

      expect(onClickSpy).toHaveBeenCalled();
    });
  });

  describe('when it is disabled', () => {
    it('does not call the onClick event if the card is clicked', async () => {
      const { user } = setup({ onClick: onClickSpy, disabled: true });

      await user.click(screen.getByRole('button'));

      expect(onClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('when it is clickable and active', () => {
    it('sets the pressed state of the button to true', () => {
      setup({ active: true, onClick: onClickSpy });

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed');
    });

    it('sets the disabled state of the button to true', () => {
      setup({ active: true, onClick: onClickSpy });

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('when a test id is given', () => {
    it('adds the test ID to the card', () => {
      setup({ testId: 'card-x' });

      expect(screen.getByTestId('card-x')).toBeInTheDocument();
    });
  });

  describe('when a className is given', () => {
    it('adds the className to the class list', () => {
      setup({ testId: 'card-x', className: 'bg-pink-500' });

      expect(screen.getByTestId('card-x')).toHaveClass('bg-pink-500');
    });
  });
});
