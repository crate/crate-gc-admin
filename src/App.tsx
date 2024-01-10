import { Route, Routes } from 'react-router-dom';
import Burger from './components/Burger';
import Navigation from './components/Navigation';
import routes from './constants/routes';

function App() {
  return (
    <div className="bg-white flex h-screen">
      <div className="bg-crate-blue hidden md:block">
        <Navigation routes={routes} />
      </div>
      <div className="basis-full">
        <div className="flex justify-end p-4 md:hidden">
          <Burger routes={routes} />
        </div>
        <div className="p-4">
          <Routes>
            {routes.map(route => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
