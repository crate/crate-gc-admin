import type { TopBarProps } from './types';
import Burger from './Burger';

function TopBar({
  logo,
  content,
  navIsExpanded,
  setNavIsExpanded,
  bottomNavigation,
  topNavigation,
  gcStatus,
}: TopBarProps) {
  return (
    <div className="flex h-12 items-center justify-between bg-crate-navigation-bg px-4 text-white md:px-6">
      {logo}
      <div className="flex h-full items-center">
        {content}
        <div className="ml-3 border-l border-neutral-600 pl-3 md:hidden">
          <Burger
            navIsExpanded={navIsExpanded}
            setNavIsExpanded={setNavIsExpanded}
            bottomNavigation={bottomNavigation}
            topNavigation={topNavigation}
            gcStatus={gcStatus}
            logo={logo}
          />
        </div>
      </div>
    </div>
  );
}

export default TopBar;
