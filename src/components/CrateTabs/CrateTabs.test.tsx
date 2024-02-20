import { useLocation, navigateMock } from '../../../__mocks__/react-router-dom';
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
        { children: <div>tab4</div>, key: 'tab4', label: 'tab4', disabled: true },
      ]}
    />,
  );
};

describe('The CrateTabs component', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({
      pathname: '',
    });
  });

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

  it('preselects the tab using the value of the tab URL search param', () => {
    useLocation.mockReturnValue({ search: '?tab=tab3' });
    setup();

    expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[2].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByRole('tab')[3].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('preselects the tab using the value of the tab URL search param even if the activeKey prop is passed', () => {
    useLocation.mockReturnValue({ search: '?tab=tab3' });
    setup({
      activeKey: 'tab2',
    });

    expect(screen.getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(screen.getAllByRole('tab')[2].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByRole('tab')[3].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('preselects the tab using the value of the activeKey prop if the value passed as a search param does not match any of the child node tabs key', () => {
    useLocation.mockReturnValue({ search: '?tab=someRandomValue' });
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
    expect(screen.getAllByRole('tab')[3].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('preselects the tab using the value of the activeKey prop if the value passed as a search param match one of the child node tabs key but is disabled', () => {
    useLocation.mockReturnValue({ search: '?tab=tab4' });
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
    expect(screen.getAllByRole('tab')[3].getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('pushes the new tab URL with search param into the history state when a tab is clicked', async () => {
    useLocation.mockReturnValue({ search: '?tab=someRandomValue', pathname: '' });
    const { user } = setup({
      activeKey: 'tab3',
    });

    await user.click(screen.getAllByRole('tab')[2]);

    expect(navigateMock).toHaveBeenCalledWith('?tab=tab3');
  });
});
