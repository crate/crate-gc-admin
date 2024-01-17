import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { Route } from '../types';
interface BurgerProps {
  routes: Route[];
}

function Burger({ routes }: BurgerProps) {
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

  // hide the burger overlay when the route changes
  useEffect(() => {
    if (navVisible) {
      setNavVisible(false);
    }
  }, [location]);

  return (
    <>
      <div className="cursor-pointer" onClick={() => setNavVisible(true)}>
        burger
      </div>
      {navVisible && (
        <div className="absolute bg-crate-blue bottom-0 left-0 top-0 right-0 z-50">
          <div className="flex justify-end p-4">
            <div
              className="cursor-pointer text-white"
              onClick={() => setNavVisible(false)}
            >
              close
            </div>
          </div>
          <Navigation routes={routes} />
        </div>
      )}
    </>
  );
}

export default Burger;
