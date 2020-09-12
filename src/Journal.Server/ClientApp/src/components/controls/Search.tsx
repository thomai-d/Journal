import * as React from 'react';
import { Theme, makeStyles, FormControl, TextField, InputAdornment, CircularProgress } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { debounce } from '../../util/debounce';
import { useEffect } from 'react';

const useStyle = makeStyles((theme: Theme) => ({
  searchAdornment: {
    width: '28px'
  },

  form: {
    marginBottom: theme.spacing(1)
  },
}));

type Props = {
  onChange: (text: string) => void;
  initialText: string;
  isSearching: boolean;
};

export default (props: Props) => {

  const classes = useStyle();
  
  const onSearchTextChange = React.useCallback(debounce(text => {
    props.onChange(text);
  }, 300), []);

  useEffect(() => {
    onSearchTextChange(props.initialText);
  }, [ props.initialText, onSearchTextChange ]);

  return (
    <FormControl className={classes.form}>
      <TextField defaultValue={props.initialText}
        onChange={(e: any) => onSearchTextChange(e.currentTarget.value)}
        label="Filter" autoFocus InputProps={{
          startAdornment: (
            <InputAdornment position="start" className={classes.searchAdornment}>
              {props.isSearching ? (<CircularProgress size="1em" />) : (<Search />)}
            </InputAdornment>
          ),
        }}
      />
      </FormControl>
  );
}