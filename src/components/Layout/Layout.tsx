import { useState } from 'react';
import type { LayoutProps } from './types';
import Navigation from './Navigation';
import TopBar from './TopBar';

function Layout({
  bottomNavigation,
  topNavigation,
  gcStatus,
  topbarLogo,
  topbarContent,
  children,
}: LayoutProps) {
  // the navIsExpanded is created at this level in case it needs to be
  // passed to the TopBar component. currently, this is not needed,
  // but it would be just a case of passing the parameter should it be
  // needed in future
  const [navIsExpanded, setNavIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-0 flex flex-col min-h-dvh top-0 w-full">
      <TopBar
        logo={topbarLogo}
        content={topbarContent}
        navIsExpanded={navIsExpanded}
        setNavIsExpanded={setNavIsExpanded}
        bottomNavigation={bottomNavigation}
        topNavigation={topNavigation}
        gcStatus={gcStatus}
      />
      <div className="bg-white flex flex-1 overflow-hidden">
        <div className="bg-crate-navigation-bg hidden md:block">
          <Navigation
            navIsExpanded={navIsExpanded}
            setNavIsExpanded={setNavIsExpanded}
            bottomNavigation={bottomNavigation}
            topNavigation={topNavigation}
            gcStatus={gcStatus}
          />
        </div>
        <div className="basis-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
