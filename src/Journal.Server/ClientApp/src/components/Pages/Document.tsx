import * as React from 'react';
import { Theme, makeStyles, Typography, Paper, CircularProgress, Box } from '@material-ui/core';
import { useParams } from 'react-router';
import { getDocument } from '../../api';
import { useEffect, useState } from 'react';
import { Document } from '../../api';
import Warning from '../controls/Warning';
import TagList from '../controls/TagList';
import Centered from '../controls/Centered';
import ImagePreview from '../controls/ImagePreview';
import { formatDate, formatText } from '../../util/formatters';

const useStyle = makeStyles((theme: Theme) => ({
  container: {
    flex: '1 0 0',
    display: 'flex',
    flexDirection: 'column',
  },
  
  textContainer: {
    flex: '1 0 0',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    overflow: 'auto',
  },
  
  attachmentContainer: {
    flex: '0 0 auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
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
      <Box className={classes.container}>
        <Paper className={classes.textContainer}>
          <Typography variant="caption">{doc.author} at {formatDate(doc.created)}</Typography>
          {formatText(doc.content)}
          <TagList tags={doc.tags} />
        </Paper>

        <Paper className={classes.attachmentContainer}>
          {doc.attachments.map(a => (
            <ImagePreview key={a.id} url={`/api/document/${doc.id}/attachment/${a.id}`}
                          width={128} height={128} />

          ))}
        </Paper>
      </Box>
    );
  }

  return <Centered><CircularProgress /></Centered>;
}

export default DocumentComponent;