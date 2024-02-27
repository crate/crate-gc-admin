import { ConnectionStatus, NavigationProps, NavigationLinkProps } from './types';
import { NavLink } from 'react-router-dom';
import {
  ArrowUpOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LoginOutlined,
  WarningOutlined,
} from '@ant-design/icons';

function Navigation({
  navIsExpanded,
  setNavIsExpanded,
  bottomNavigation,
  topNavigation,
  gcStatus,
}: NavigationProps) {
  const linkClasses =
    'block cursor-pointer overflow-hidden h-12 px-6 py-3 text-[15px] transition-none';
  const linkClassesSelected = `${linkClasses} bg-crate-blue text-white hover:text-white`;
  const linkClassesUnselected = `${linkClasses} text-crate-navigation-fg hover:bg-neutral-700/50 hover:text-crate-navigation-fg`;

  const linkKey = (type: string, path: string): string => `${type}_${path}`;

  const drawLinkInner = (
    icon: JSX.Element,
    label: JSX.Element,
    navIsExpanded: boolean,
    isExternalLink: boolean = false,
  ): JSX.Element => {
    return (
      <div className="align-center mx-auto flex w-full max-w-[300px] flex-nowrap gap-2 whitespace-nowrap">
        <div className="h-6 w-6 text-center text-sm">{icon}</div>
        {navIsExpanded && (
          <div className="flex flex-nowrap items-start gap-1 overflow-hidden">
            {label}
            {isExternalLink && <ArrowUpOutlined className="rotate-45 opacity-50" />}
          </div>
        )}
      </div>
    );
  };

  const drawExpandCollapse = (): JSX.Element => (
    <div
      className={`${linkClassesUnselected} hidden md:block`}
      onClick={() => setNavIsExpanded(!navIsExpanded)}
    >
      {drawLinkInner(
        navIsExpanded ? <DoubleLeftOutlined /> : <DoubleRightOutlined />,
        navIsExpanded ? <span>Collapse</span> : <span>Expand</span>,
        navIsExpanded,
      )}
    </div>
  );

  const drawGCConnectionStatus = (status?: ConnectionStatus): JSX.Element => {
    let classes: string;
    let icon: JSX.Element;
    let label: string;

    switch (status) {
      case ConnectionStatus.CONNECTED:
        classes = 'bg-green-700 text-white';
        icon = <CheckOutlined />;
        label = 'Connected';
        break;
      case ConnectionStatus.NOT_LOGGED_IN:
        classes = 'bg-red-800 text-white';
        icon = <LoginOutlined />;
        label = 'Not logged in';
        break;
      case ConnectionStatus.ERROR:
        classes = 'bg-red-700 text-white';
        icon = <WarningOutlined />;
        label = 'Not available';
        break;
      case ConnectionStatus.PENDING:
        classes = 'bg-neutral-700 text-white';
        icon = <ClockCircleOutlined />;
        label = 'Pending';
        break;
      case ConnectionStatus.NOT_CONFIGURED:
        classes = 'bg-neutral-700 text-white';
        icon = <WarningOutlined />;
        label = 'Not configured';
        break;
      default:
        // no gc status passed in, don't show anything
        return <></>;
    }

    return (
      <div
        className={`flex items-center px-6 py-3 ${classes}`}
        key="gc_connection_status"
      >
        {drawLinkInner(
          icon,
          <div>
            <div className="text-xs uppercase leading-tight opacity-60">
              Grand Central
            </div>
            <div className="leading-tight">{label}</div>
          </div>,
          navIsExpanded,
        )}
      </div>
    );
  };

  const drawLink = (link: NavigationLinkProps): JSX.Element => {
    switch (link.type) {
      case 'external':
        return (
          <a
            href={link.path}
            className={linkClassesUnselected}
            key={linkKey(link.type, link.path)}
            target="blank"
          >
            {drawLinkInner(link.icon, link.label, navIsExpanded, true)}
          </a>
        );
      default:
        // internal link
        return (
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              isActive ? linkClassesSelected : linkClassesUnselected
            }
            key={linkKey(link.type, link.path)}
          >
            {drawLinkInner(link.icon, link.label, navIsExpanded)}
          </NavLink>
        );
    }
  };

  return (
    <div
      className={`duration-250 flex h-full select-none flex-col justify-between pb-2 transition-[width] ${
        navIsExpanded ? 'md:w-56' : 'md:w-20'
      }`}
    >
      <div>{topNavigation.map((link: NavigationLinkProps) => drawLink(link))}</div>
      <div>
        {drawGCConnectionStatus(gcStatus)}
        <div className="border-t border-neutral-600">
          {bottomNavigation.map((link: NavigationLinkProps) => drawLink(link))}
          {drawExpandCollapse()}
        </div>
      </div>
    </div>
  );
}

export default Navigation;
