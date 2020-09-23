import * as React from 'react';
import Home from './components/Pages/Home';
import NewEntry from './components/Pages/NewEntry';
import Explore from './components/Pages/Explore';
import Documents from './components/Pages/Documents';
import Document from './components/Pages/Document';
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
  params?: any;
}

export const pageTree: Route[] = [

  { menu: false, shortName:  'Home',      path: '/',                exact: true, protected: false, hotkey: undefined,        component: Home },
  { menu: false, shortName:  'Document',  path: '/documents/:id',   exact: true, protected: true,  hotkey: undefined,        component: Document },
  { menu: true,  shortName:  'Documents', path: '/documents',       exact: true, protected: true,  hotkey: undefined,        component: Documents, icon: <DynamicFeedIcon /> },
  { menu: false, shortName:  'New',       path: '/new',             exact: true, protected: true,  hotkey: 'CTRL+SHIFT+N',   component: NewEntry, },
  { menu: true,  shortName:  'Explore',   path: '/explore',         exact: true, protected: true,  hotkey: 'CTRL+SHIFT+K',   component: Explore,   icon: <TimelineIcon /> },

];

export const useCurrentRoute = () => {
  const location = useLocation();
  return pageTree.find(route => matchPath(location.pathname, route));
}
