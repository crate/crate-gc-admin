/* eslint-disable react/jsx-props-no-spreading */
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { QUERY_PARAM_KEY_ACTIVE_TAB } from 'constants/defaults';

export type CrateTabsProps = TabsProps & {
  items: NonNullable<TabsProps['items']>;
  defaultActiveKey: NonNullable<TabsProps['defaultActiveKey']>;
  queryParamKeyActiveTab?: string | null;
  indentTabBar?: boolean; // indent the tabs (but not the content) for situations where the tabs are pushed up against a container
};

function CrateTabs({
  defaultActiveKey,
  activeKey,
  items,
  queryParamKeyActiveTab = QUERY_PARAM_KEY_ACTIVE_TAB,
  indentTabBar = false,
  ...rest
}: CrateTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  // preselected tabs set via URL search params will override
  // the default active key
  const searchParamValue = queryParamKeyActiveTab
    ? new URLSearchParams(location.search).get(queryParamKeyActiveTab)
    : null;
  const childKeysIncludesSearchParam = searchParamValue
    ? items
        .filter(({ disabled = false }) => !disabled)
        .map(({ key }) => key)
        .includes(searchParamValue)
    : false;

  const validSearchParamValue = childKeysIncludesSearchParam
    ? searchParamValue
    : null;

  // necessary because the Ant design tabs component will ignore
  // the defaultActiveKey prop if the activeKeyValue prop is set,
  // even if it is set to null. So we need to selectively include the activeKey prop
  // only if it is set, using the search param as the highest priority then the prop value.
  // This preserves the functionality of the Ant design tab API by default, allowing
  // you to override the activeKey with a URL search param.
  const activeTab = validSearchParamValue || activeKey;
  const restProps = activeTab ? { ...rest, activeKey: activeTab } : rest;

  // we manually update the URL otherwise the tabs
  // will not change when a new tab is clicked but instead be locked to the
  // value in the activeKey prop. Also, by updating the router
  // the URL will change each time a new tab is clicked which prevents the
  // URL bar from showing a stale search param when the tab changes and
  // means the browser back button can be used.
  const handleTabClick = (key: string) => {
    if (queryParamKeyActiveTab) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set(queryParamKeyActiveTab, key);
      navigate(`?${searchParams.toString()}`);
    }
  };

  if (indentTabBar) {
    return (
      <div className="ant-tabs-nav-indent">
        <Tabs
          defaultActiveKey={defaultActiveKey}
          items={items}
          {...restProps}
          onTabClick={handleTabClick}
          animated
        />
      </div>
    );
  }

  return (
    <Tabs
      defaultActiveKey={defaultActiveKey}
      items={items}
      {...restProps}
      onTabClick={handleTabClick}
      animated
    />
  );
}

export default CrateTabs;
