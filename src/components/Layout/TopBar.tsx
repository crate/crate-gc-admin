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
    <div className="bg-crate-navigation-bg flex items-center justify-between h-12 px-4 text-white md:px-6">
      {logo}
      <div className="flex h-full items-center">
        {content}
        <div className="border-l border-neutral-600 ml-3 pl-3 md:hidden">
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
