import Home from './components/Pages/Home';
import NewEntry from './components/Pages/NewEntry';
import History from './components/Pages/History';
import { matchPath, RouteProps } from 'react-router';
import { useLocation } from 'react-router-dom';

export interface Route extends RouteProps {
  shortName: string,
  protected: boolean,
  hotkey: string | undefined,
  path: string,
}

export const pageTree: Route[] = [

  { shortName: 'Home',       path: '/',         exact: true, protected: false, hotkey: undefined,        component: Home },
  { shortName: 'New',        path: '/new',      exact: true, protected: true,  hotkey: 'CTRL+SHIFT+N',   component: NewEntry },
  { shortName: 'History',    path: '/history',  exact: true, protected: true,  hotkey: 'CTRL+SHIFT+K',   component: History },

];

export const useCurrentRoute = () => {
  const location = useLocation();
  return pageTree.find(route => matchPath(location.pathname, route));
}
