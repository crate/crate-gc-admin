import React, { useEffect, useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from 'utils';

export type CrateTabShadProps = {
  key: string;
  label: React.ReactNode | string;
  content: React.ReactNode;
};

export type CrateTabsShadProps = {
  initialActiveTab?: string;
  hideWhenSingleTab?: boolean; // don't show the tab bar if there is only one tab
  items: CrateTabShadProps[];
  stickyTabBar?: boolean; // make the tab bar sticky
};

function CrateTabsShad({
  initialActiveTab,
  hideWhenSingleTab = false,
  items = [],
  stickyTabBar = false,
}: CrateTabsShadProps) {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  const getDefaultTab = (): string => {
    if (initialActiveTab && items.map(item => item.key).includes(initialActiveTab)) {
      return initialActiveTab;
    }
    return items[0].key;
  };

  const onTabChange = (value: string) => {
    setActiveTab(value);
  };

  // ensure that the active tab is a valid option
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [items]);

  return (
    <Tabs
      className={stickyTabBar ? 'flex h-full w-full flex-col' : ''}
      data-testid="tabs-container"
      defaultValue={getDefaultTab()}
      value={activeTab}
      onValueChange={onTabChange}
    >
      <TabsList
        className={hideWhenSingleTab && items.length === 1 ? 'hidden' : 'border-b'}
      >
        {items.map(item => (
          <TabsTrigger key={item.key} value={item.key}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map(item => (
        <TabsContent
          key={item.key}
          value={item.key}
          className={stickyTabBar ? 'h-full w-full overflow-hidden' : ''}
        >
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// below here are the shadcn components, with only the tailwind class names
// changed for our own use case

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('flex h-10 justify-start gap-4 px-2', className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'border-b-2 border-transparent data-[state=active]:border-crate-blue',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('', className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export default CrateTabsShad;
