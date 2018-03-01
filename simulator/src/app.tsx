import React from 'react';
import io from 'socket.io-client';
import Spinner from 'react-spinkit';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import Scanner from './scanner';
import Cheats from './cheats';
import Controller from './controller';
import './app.css';

const BASE_URL = (() =>
  window.location.search.includes('local')
    ? 'http://starship:9000'
    : 'http://server.toomanycaptains.com')();

type Tab = 'controller' | 'scanner' | 'cheats';

interface AppState {
  isLoading: boolean;
  activeTab: Tab;
  socket: SocketIOClient.Socket;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      activeTab: 'controller',
      isLoading: true,
      socket: io(BASE_URL),
    };
    this.state.socket.on('connect', () => this.setState({ isLoading: false }));
    this.state.socket.on('disconnect', () =>
      this.setState({ isLoading: true }),
    );
  }

  public render() {
    if (this.state.isLoading) {
      return (
        <div className="App">
          <Spinner name="wandering-cubes" color="white" />
        </div>
      );
    }

    return (
      <Router>
        <div className="App">
          <div className="ModeTabs">
            <NavLink to="/" exact className="ModeTab" activeClassName="active">
              🕹 Controller
            </NavLink>
            <NavLink to="/scanner" className="ModeTab" activeClassName="active">
              🖐🏻 Scanner
            </NavLink>
            <NavLink to="/cheats" className="ModeTab" activeClassName="active">
              😵 Cheats
            </NavLink>
          </div>

          <Route
            exact
            path="/"
            render={() => <Controller socket={this.state.socket} />}
          />
          <Route
            path="/scanner"
            render={() => <Scanner socket={this.state.socket} />}
          />
          <Route
            path="/cheats"
            render={() => <Cheats socket={this.state.socket} />}
          />
        </div>
      </Router>
    );
  }
}

export default App;
