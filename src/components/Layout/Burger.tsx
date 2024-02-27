import type { BurgerProps } from './types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import Navigation from './Navigation';

function Burger({
  navIsExpanded,
  setNavIsExpanded,
  bottomNavigation,
  topNavigation,
  gcStatus,
  logo,
}: BurgerProps) {
  const location = useLocation();
  const [navVisible, setNavVisible] = useState(false);

  // hide the burger overlay on any window resize
  useEffect(() => {
    const handleResize = () => {
      if (navVisible) {
        setNavVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navVisible]);

  // hide the burger overlay when the route changes. the user has already
  // selected a link, they shouldn't need to close the overlay too
  useEffect(() => {
    if (navVisible) {
      setNavVisible(false);
    }
  }, [location]);

  return (
    <>
      <MenuOutlined
        className="cursor-pointer text-2xl text-white"
        onClick={() => setNavVisible(true)}
      />
      {navVisible && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex select-none flex-col bg-crate-navigation-bg">
          <div className="flex h-12 items-center justify-between px-4">
            {logo}
            <CloseOutlined
              className="cursor-pointer text-2xl text-white"
              onClick={() => setNavVisible(false)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <Navigation
              navIsExpanded={navIsExpanded}
              setNavIsExpanded={setNavIsExpanded}
              bottomNavigation={bottomNavigation}
              topNavigation={topNavigation}
              gcStatus={gcStatus}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Burger;
