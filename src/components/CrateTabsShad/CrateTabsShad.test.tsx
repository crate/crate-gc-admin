import { render, screen } from 'test/testUtils';
import CrateTabsShad, { CrateTabsShadProps } from './CrateTabsShad';

const defaultProps: CrateTabsShadProps = {
  items: [
    {
      key: 'tab1',
      label: 'Tab 1',
      content: <div data-testid="tab_1_content">tab 1</div>,
    },
    {
      key: 'tab2',
      label: 'Tab 2',
      content: <div data-testid="tab_2_content">tab 2</div>,
    },
    {
      key: 'tab3',
      label: 'Tab 3',
      content: <div data-testid="tab_3_content">tab 3</div>,
    },
  ],
};

const setup = (props: Partial<CrateTabsShadProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<CrateTabsShad {...combinedProps} />);
};

describe('The CrateTabsShad component', () => {
  it('preselects the first tab if no initialActiveTab prop is passed', () => {
    setup();

    expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[2].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('preselects the tab using the value of the initialActiveTab prop', () => {
    setup({ initialActiveTab: 'tab2' });

    expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByRole('tab')[2].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  describe('when the hideWhenSingleTab prop is true', () => {
    it('displays the tabs when there are multiple tabs', () => {
      setup({ hideWhenSingleTab: true });

      expect(screen.getAllByRole('tab').length).toBe(3);
    });

    it('hides the tabs when there is only one', () => {
      setup({
        hideWhenSingleTab: true,
        items: [
          {
            key: 'tab1',
            label: 'Tab 1',
            content: <div data-testid="tab_1_content">tab 1</div>,
          },
        ],
      });

      expect(screen.getByRole('tablist')).toHaveClass('hidden');
    });
  });

  describe('when the stickyTabBar prop is true', () => {
    it('applies the sticky CSS classes to the tablist', () => {
      setup({ stickyTabBar: true });

      expect(screen.getByTestId('tabs-container')).toHaveClass('flex');
    });
  });

  describe('when changing tabs', () => {
    it('calls the onChange prop with the new tab key', async () => {
      const onChange = jest.fn();
      const { user } = setup({ onChange });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('updates the active tab state', async () => {
      const { user } = setup();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
        'false',
      );
      expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe(
        'true',
      );
    });
  });
});
