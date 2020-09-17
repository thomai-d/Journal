import * as React from 'react';
import Home from './components/Pages/Home';
import NewEntry from './components/Pages/NewEntry';
import History from './components/Pages/History';
import { matchPath, RouteProps } from 'react-router';
import { useLocation } from 'react-router-dom';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import TimelineIcon from '@material-ui/icons/Timeline';

export interface Route extends RouteProps {
  shortName: string,
  protected: boolean,
  hotkey: string | undefined,
  path: string,
  icon?: any,
  menu: boolean,
}

export const pageTree: Route[] = [

  { menu: true,  shortName: 'History',       path: '/',         exact: true, protected: false, hotkey: undefined,        component: Home,     icon: <DynamicFeedIcon /> },
  { menu: false, shortName: 'New',       path: '/new',      exact: true, protected: true,  hotkey: 'CTRL+SHIFT+N',   component: NewEntry, },
  { menu: true,  shortName: 'Explore',   path: '/history',  exact: true, protected: true,  hotkey: 'CTRL+SHIFT+K',   component: History,  icon: <TimelineIcon /> },

];

export const useCurrentRoute = () => {
  const location = useLocation();
  return pageTree.find(route => matchPath(location.pathname, route));
}
