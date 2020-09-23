import * as React from 'react';
import { Theme, makeStyles, List, ListItem, ListItemText } from '@material-ui/core';
import { formatDate } from '../../util/formatters';
import { Document } from '../../api';
import { Link } from 'react-router-dom';
import Warning from './Warning';

const useStyle = makeStyles((theme: Theme) => ({
  tableContainer: {
    overflow: 'auto',
    marginTop: theme.spacing(1),
    flex: '1 0 0',
  },
}));

type Props = {
  documents: Document[],
  error: string,
};

export default (props: Props) => {

  const classes = useStyle();
  return (<>
      {props.error ? (
        <Warning message={props.error} />
      ) : (
        <List className={classes.tableContainer}>
          {props.documents.map((item) => (
            <ListItem key={item.id} button component={Link} to={`documents/${item.id}`}>
              <ListItemText primary={formatDate(item.created)}
                            secondary={item.content.substr(0, 30)} />
            </ListItem>
          ))}
        </List>
      )}
  </>);
}