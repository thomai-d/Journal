import * as React from 'react';
import { Theme, makeStyles, IconButton, Box } from '@material-ui/core';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

export interface UploadedImage {
  name: string;
  url: string;
  file: File;

  dispose: () => void;
}

const useStyle = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },

  border: {
    border: '1px inset lightGray',
    borderRadius: theme.spacing(1),
    width: '70px',
    height: '70px',
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    maxWidth: '64px',
    maxHeight: '64px',
  }
}));

type Props = {
  images: UploadedImage[],
  onImageAdded: (image: UploadedImage) => void,
  className?: string,
};

export default (props: Props) => {

  const classes = useStyle();

  const onImageAdd = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    const file = files![0];
    const url = URL.createObjectURL(file);
    props.onImageAdded({
      name: file.name,
      url,
      file,
      dispose: () => URL.revokeObjectURL(url),
    });
  }

  return (<>
    <Box className={`${classes.container} ${props.className ?? ''}`}>

      {props.images.map(img => (
        <Box className={classes.border}>
          <img key={img.url} src={img.url} className={classes.image} alt={img.name} />
        </Box>
      ))}

      <Box className={classes.border}>
        <IconButton component="label">
          <AddAPhotoIcon fontSize="large" />
          <input type="file" accept="image/x-png,image/jpeg,image/gif"
                  onChange={onImageAdd}
                  style={{ display: "none" }} />
        </IconButton>
      </Box>
    </Box>
  </>);
}