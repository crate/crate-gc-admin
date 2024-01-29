import { render, screen } from '../../../test/testUtils';
import Button, { ButtonProps } from './Button';

const onClickSpy = jest.fn();

const defaultProps: ButtonProps = {
  onClick: onClickSpy,
  children: 'click me',
};

const setup = (props: Partial<ButtonProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<Button {...combinedProps} />);
};

describe('The Button component', () => {
  afterEach(() => {
    onClickSpy.mockClear();
  });

  describe('when binding the button to a form', () => {
    it('passes the form property to the form attribute on the button', () => {
      setup({
        form: 'submit-this-form',
      });

      expect(screen.getByRole('button').getAttribute('form')).toBe(
        'submit-this-form',
      );
    });
  });

  describe('when passing addtional classes to the form', () => {
    it('passes the class property to the class attribute on the button', () => {
      setup({
        className: 'additional-classes',
      });

      expect(screen.getByRole('button')).toHaveClass('additional-classes');
    });
  });

  describe('when clicking the button', () => {
    it('invokes the given click handler', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button'));

      expect(onClickSpy).toHaveBeenCalled();
    });
  });

  describe('when the button is disabled', () => {
    it('does not invoke the given click handler when the button is clicked', async () => {
      const { user } = setup({
        disabled: true,
      });

      await user.click(screen.getByRole('button'));

      expect(onClickSpy).not.toHaveBeenCalled();
    });

    it('sets the aria-disabled attribute to true', () => {
      setup({
        disabled: true,
      });

      expect(screen.getByRole('button').getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('when the button is loading', () => {
    it('does not invoke the given click handler when the button is clicked', async () => {
      const { user } = setup({
        loading: true,
      });

      await user.click(screen.getByRole('button'));

      expect(onClickSpy).not.toHaveBeenCalled();
    });

    it('sets the aria-busy attribute to true', () => {
      setup({
        loading: true,
      });

      expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
    });

    it('sets the aria-disabled attribute to true', () => {
      setup({
        loading: true,
      });

      expect(screen.getByRole('button').getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('when the button is displayed as the ghost variation', () => {
    it('displays the background as transparent', () => {
      setup({
        ghost: true,
      });

      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('displays the border as white for primary buttons', () => {
      setup({
        ghost: true,
        kind: Button.kinds.PRIMARY,
      });

      expect(screen.getByRole('button')).toHaveClass('border-neutral-100');
    });

    it('displays the border as white on hover for secondary disabled buttons', () => {
      setup({
        ghost: true,
        kind: Button.kinds.SECONDARY,
      });

      expect(screen.getByRole('button')).toHaveClass('hover:border-neutral-100');
    });

    it('displays the border as white for secondary disabled buttons', () => {
      setup({
        disabled: true,
        ghost: true,
        kind: Button.kinds.SECONDARY,
      });

      expect(screen.getByRole('button')).toHaveClass('border-neutral-100');
    });
  });

  describe('when the button is displayed as the warn variation', () => {
    it('displays the background as red for primary buttons', () => {
      setup({
        warn: true,
        kind: Button.kinds.PRIMARY,
      });

      expect(screen.getByRole('button')).toHaveClass('bg-red-400');
    });

    it('displays the text as red for primary buttons', () => {
      setup({
        warn: true,
        kind: Button.kinds.SECONDARY,
      });

      expect(screen.getByRole('button')).toHaveClass('text-red-400');
    });
  });
});
