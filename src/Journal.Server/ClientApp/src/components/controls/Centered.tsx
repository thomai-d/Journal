import * as React from 'react';
import { Theme, makeStyles } from '@material-ui/core';

const useStyle = makeStyles((theme: Theme) => ({
  centered: {
    flex: '1 1 0',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

type Props = {
  children: JSX.Element,
};

export default (props: Props) => {

  const {centered} = useStyle();

  return (<div className={centered}>{props.children}</div>)
}