import * as React from 'react';
import { Chip, makeStyles } from '@material-ui/core';

const useStyle = makeStyles(theme => ({
  chiplist: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    justifyContent: 'flex-start',
    padding: 0,
    margin: 0,
  },
  
  chip: {
    margin: 0,

    '& + $chip': {
      marginLeft: theme.spacing(0.5),
    },
  },
}));

type Props = {
  tags: string[]
}


export default ({ tags }: Props) => {
  const classes = useStyle();

  return (
    <>
      <ul className={classes.chiplist}>
        {tags.map((tag) => (
          <li key={tag} className={classes.chip}>
            <Chip label={tag} size="small" />
          </li>
        ))}
      </ul>
    </>
  );
}