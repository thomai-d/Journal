import * as React from 'react';
import { Theme, makeStyles, Box, useTheme } from '@material-ui/core';
import { useEffect, useState } from 'react';
import axios from 'axios';

const useStyle = makeStyles((theme: Theme) => ({
  border: {
    border: '1px solid black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));

type Props = {
  url: string;
  width: number;
  height: number;
};

export default (props: Props) => {

  const theme = useTheme();
  const classes = useStyle();
  const [data, setData] = useState<any>();

  useEffect(() => {
    axios.get(props.url, {responseType: 'arraybuffer'})
         .then(resp => {
           const buf = Buffer.from(resp.data, 'binary');
           setData('data:;base64,' + buf.toString('base64'));
         },
               err => setData(null));
  }, [props.url]);

  console.log(data);

  return (<>
    <Box className={classes.border}
         style={{width: props.width + theme.spacing(1), height: props.height + theme.spacing(1)}}>
      <img src={data} style={{maxWidth: props.width, maxHeight: props.height}} alt="Attachment Preview" />
    </Box>
  </>);
}