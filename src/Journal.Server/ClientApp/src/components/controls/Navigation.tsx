import * as React from 'react';
import { Menu } from '@material-ui/icons';
import { Theme, makeStyles } from '@material-ui/core';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { pageTree, useCurrentRoute } from '../../navigation';
import { Link } from 'react-router-dom';

const useStyle = makeStyles((theme: Theme) => ({
}));

type Props = {
  
};

export default (props: Props) => {

  const classes = useStyle();
  const currentRoute = useCurrentRoute();
  console.log(currentRoute);

  return (<>
    <BottomNavigation style={{flexGrow:0}} showLabels value={currentRoute?.path}>
      {pageTree.map(i => (<BottomNavigationAction key={i.path} value={i.path} label={i.shortName} icon={<Menu />} component={Link} to={i.path}></BottomNavigationAction>))}
    </BottomNavigation>
  </>);
}