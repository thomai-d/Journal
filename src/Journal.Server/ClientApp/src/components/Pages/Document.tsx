import * as React from 'react';
import { Theme, makeStyles, Typography, Paper, CircularProgress } from '@material-ui/core';
import { useParams } from 'react-router';
import { getDocument } from '../../api';
import { useEffect, useState } from 'react';
import { Document } from '../../api';
import Warning from '../controls/Warning';
import TagList from '../controls/TagList';
import Centered from '../controls/Centered';
import { formatDate, formatText } from '../../util/formatters';

const useStyle = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(2),
    overflow: 'auto',
    flex: '0 0 auto',
  },

  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const DocumentComponent = () => {

  const classes = useStyle();
  const { id } = useParams<{id: string}>();
  const [ doc, setDoc ] = useState<Document | null>(null);
  const [ error, setError ] = useState<Error | null>(null);

  useEffect(() => {
    getDocument(id)
      .then(doc => { setDoc(doc); })
      .catch((err: Error) => { setError(err); });
  }, [id]);

  if (error) {
    return <Warning message={error.message} />
  }
  else if (doc) {
    return(
      <Paper className={classes.container}>
        <Typography variant="caption">{doc.author} at {formatDate(doc.created)}</Typography>
        {formatText(doc.content)}
        <TagList tags={doc.tags} />
      </Paper>
    );
  }

  return <Centered><CircularProgress /></Centered>;
}

export default DocumentComponent;