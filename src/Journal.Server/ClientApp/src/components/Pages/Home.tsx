import * as React from 'react';
import { connect } from 'react-redux';
import { Typography } from '@material-ui/core';

const Home = () => (
  <Typography variant="h1">
    Hello
  </Typography>
);

export default connect()(Home);
