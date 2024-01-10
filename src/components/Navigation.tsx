import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  routes: Route[];
}

interface NavigationLinkProps {
  label: string;
  path: string;
}

function NavigationLink({ label, path }: NavigationLinkProps) {
  const location = useLocation();

  return (
    <Link to={path}>
      <div
        className={`${
          location.pathname === path ? 'bg-slate-600' : 'bg-slate-700'
        } cursor-pointer text-slate-200 hover:bg-slate-600 hover:text-white`}
      >
        <div className="block max-w-96 mx-auto px-4 py-2">{label}</div>
      </div>
    </Link>
  );
}

function Navigation({ routes }: NavigationProps) {
  return (
    <nav className="w-full md:w-48">
      <ul>
        {routes.map(route => (
          <li key={route.path}>
            <NavigationLink label={route.label} path={route.path} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
