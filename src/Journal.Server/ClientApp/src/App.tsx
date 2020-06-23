import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import NewEntry from './components/NewEntry';
import { Link } from 'react-router-dom';
import LoggedInUser from './components/LoggedInUser';

export default () => {

  return (
    <Layout>
        
        <LoggedInUser></LoggedInUser>

        <nav>
            <ul>
                <li><Link to="/new">Add entry</Link></li>
            </ul>
        </nav>

        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/new' component={NewEntry} />
        <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
    </Layout>
)
  };
