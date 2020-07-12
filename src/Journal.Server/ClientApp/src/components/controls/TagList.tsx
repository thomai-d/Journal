import * as React from 'react';
import { Chip, makeStyles } from '@material-ui/core';

const useStyle = makeStyles(theme => ({
  chiplist: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    justifyContent: 'flex-start',
    padding: theme.spacing(0.5),
    margin: '0px',
  },
  
  chip: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  }
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
          <li key={tag}>
            <Chip
              label={tag} size="small"
              className={classes.chip}
            />
          </li>
        ))}
      </ul>
    </>
  );
}