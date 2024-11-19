import { useState } from 'react';
import type { LayoutProps } from './types';
import Navigation from './Navigation';
import TopBar from './TopBar';
import useJWTManagerStore from 'state/jwtManager';

function Layout({
  bottomNavigation,
  topNavigation,
  topbarLogo,
  topbarContent,
  children,
}: LayoutProps) {
  // the navIsExpanded is created at this level in case it needs to be
  // passed to the TopBar component. currently, this is not needed,
  // but it would be just a case of passing the parameter should it be
  // needed in future
  const [navIsExpanded, setNavIsExpanded] = useState(true);
  const gcStatus = useJWTManagerStore(state => state.gcStatus);

  return (
    <div className="absolute bottom-0 top-0 flex min-h-dvh w-full flex-col">
      <TopBar
        logo={topbarLogo}
        content={topbarContent}
        navIsExpanded={navIsExpanded}
        setNavIsExpanded={setNavIsExpanded}
        bottomNavigation={bottomNavigation}
        topNavigation={topNavigation}
        gcStatus={gcStatus}
      />
      <div className="flex flex-1 overflow-hidden bg-white">
        <div className="hidden bg-crate-navigation-bg md:block">
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
