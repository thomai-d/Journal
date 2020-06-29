import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import NewEntry from './components/pages/NewEntry';
import History from './components/pages/History';
import { CssBaseline } from '@material-ui/core';

export default () => {

  return (
    <Layout>
        <CssBaseline />

        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/new' component={NewEntry} />
        <Route path='/history' component={History} />
        <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
    </Layout>
)
  };
