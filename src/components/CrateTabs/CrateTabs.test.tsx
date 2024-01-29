import { render, screen } from '../../../test/testUtils';
import CrateTabs, { CrateTabsProps } from './CrateTabs';

const defaultProps: CrateTabsProps = {
  defaultActiveKey: 'tab2',
  items: [],
};

const setup = (props: Partial<CrateTabsProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(
    <CrateTabs
      {...combinedProps}
      items={[
        { children: <div>tab1</div>, key: 'tab1', label: 'tab1' },
        { children: <div>tab2</div>, key: 'tab2', label: 'tab2' },
        { children: <div>tab3</div>, key: 'tab3', label: 'tab3' },
      ]}
    />,
  );
};

describe('The CrateTabs component', () => {
  it('preselects the tab using the value of the defaultActiveKey prop if no activeKey prop is passed', () => {
    setup();

    expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByRole('tab')[2].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('preselects the tab using the value of the activeKey prop', () => {
    setup({
      activeKey: 'tab3',
    });

    expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[2].getAttribute('aria-selected')).toBe('true');
  });
});
