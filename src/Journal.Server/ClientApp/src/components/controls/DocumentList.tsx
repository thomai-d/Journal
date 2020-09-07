import * as React from 'react';
import { Theme, makeStyles, TableContainer, Table, TableBody, TableCell, TableRow, Paper } from '@material-ui/core';
import { printDate } from '../../util/printDate';
import TagList from '../controls/TagList';
import { Document } from '../../api';

const useStyle = makeStyles((theme: Theme) => ({
  tableContainer: {
    marginTop: theme.spacing(2)
  }
}));

type Props = {
  documents: Document[]
};

export default (props: Props) => {

  const classes = useStyle();
  return (<>
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
  </>);
}