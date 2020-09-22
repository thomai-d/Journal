import * as React from 'react';
import { Theme, makeStyles, List, ListItem, ListItemText } from '@material-ui/core';
import { formatDate } from '../../util/formatDate';
import { Document } from '../../api';
import MuiAlert from '@material-ui/lab/Alert';

const useStyle = makeStyles((theme: Theme) => ({
  tableContainer: {
    overflow: 'auto',
    marginTop: theme.spacing(1),
    flex: '1 0 0',
  },

  alert: {
    maxWidth: '50%',
  }
}));

type Props = {
  documents: Document[],
  error: string,
};

export default (props: Props) => {

  const classes = useStyle();
  return (<>
      {props.error ? (
        <MuiAlert className={classes.alert} severity="warning" variant="filled" >
          <span>{props.error}</span>
        </MuiAlert>
      ) : (
        <List className={classes.tableContainer}>
          {props.documents.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={formatDate(item.created)}
                            secondary={item.content.substr(0, 30)} />
            </ListItem>
          ))}
        </List>
      )}
  </>);
}