import * as React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { pageTree, useCurrentRoute } from '../../navigation';
import { Link } from 'react-router-dom';

export default () => {

  const currentRoute = useCurrentRoute();

  return (<>
    <BottomNavigation style={{flexGrow:0}} showLabels value={currentRoute?.path}>
      {pageTree
          .filter(i => i.menu)
          .map(i => (<BottomNavigationAction key={i.path} value={i.path} label={i.shortName} icon={i.icon} component={Link} to={i.path}></BottomNavigationAction>))
      }
    </BottomNavigation>
  </>);
}