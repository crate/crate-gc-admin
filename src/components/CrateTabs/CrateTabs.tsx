/* eslint-disable react/jsx-props-no-spreading */
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

export type CrateTabsProps = TabsProps & {
  items: NonNullable<TabsProps['items']>;
  defaultActiveKey: NonNullable<TabsProps['defaultActiveKey']>;
};

function CrateTabs({ ...props }: CrateTabsProps) {
  return <Tabs {...props} animated />;
}

export default CrateTabs;
