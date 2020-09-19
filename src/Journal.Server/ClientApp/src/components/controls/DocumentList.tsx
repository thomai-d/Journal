import * as React from 'react';
import { Theme, makeStyles, TableContainer, Table, TableBody, TableCell, TableRow, Paper } from '@material-ui/core';
import { printDate } from '../../util/printDate';
import TagList from '../controls/TagList';
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
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableBody>
              {props.documents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.content}</TableCell>
                  <TableCell padding="none"><TagList tags={item.tags} /></TableCell>
                  <TableCell padding="none"><TagList tags={Object.keys(item.values)} /></TableCell>
                  <TableCell>{printDate(item.created)}</TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
        </TableContainer>
      )}
  </>);
}