import React from 'react';
import io from 'socket.io-client';
import { Packet, GameState } from '../../common/types';
import Spinner from 'react-spinkit';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import Scanner from './scanner';
import Cheats from './cheats';
import Controller from './controller';
import './app.css';
import { has } from 'lodash';

function getUrlParams(search: string): { [P in string]: string } {
  const hashes = search.slice(search.indexOf('?') + 1).split('&');
  const params = {};
  hashes.forEach(hash => {
    const [key, val] = hash.split('=');
    params[key] = decodeURIComponent(val);
  });

  return params;
}

type Tab = 'controller' | 'scanner' | 'cheats';

interface AppState {
  isLoading: boolean;
  activeTab: Tab;
  socket: SocketIOClient.Socket;
  gameState: GameState;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    const urlParams = getUrlParams(window.location.search);
    let serverURL = 'http://server.toomanycaptains.com';
    if (has(urlParams, 'serverURL')) {
      serverURL = urlParams.serverURL;
    }
    this.state = {
      activeTab: 'controller',
      isLoading: true,
      socket: io(serverURL),
      gameState: 'wait_for_players',
    };
  }

  public componentDidMount() {
    this.state.socket.on('connect', () => this.setState({ isLoading: false }));
    this.state.socket.on('disconnect', () =>
      this.setState({ isLoading: true }),
    );
    this.state.socket.on('packet', (packet: Packet) => {
      if (packet.kind === 'gamestate') {
        this.setState({ gameState: packet.state });
      }
    });

    this.setState({ isLoading: true });
  }

  public render() {
    if (this.state.isLoading) {
      return (
        <div className="App">
          <div className="Loading">
            <Spinner name="wandering-cubes" color="white" />
          </div>
          <div className="App-Info">
            <div className="App-Info-GameState">{this.state.gameState}</div>
            <div className="App-Info-URI">{this.state.socket.io.uri}</div>
          </div>
        </div>
      );
    }

    return (
      <Router>
        <div className="App">
          <div className="App-Info">
            <div className="App-Info-GameState">{this.state.gameState}</div>
            <div className="App-Info-URI">{this.state.socket.io.uri}</div>
          </div>
          <div className="ModeTabs">
            <NavLink
              to={{ pathname: '/', search: window.location.search }}
              exact
              className="ModeTab"
              activeClassName="active"
            >
              🕹 Controller
            </NavLink>
            <NavLink
              to={{ pathname: '/scanner', search: window.location.search }}
              className="ModeTab"
              activeClassName="active"
            >
              🖐🏻 Scanner
            </NavLink>
            <NavLink
              to={{ pathname: '/cheats', search: window.location.search }}
              className="ModeTab"
              activeClassName="active"
            >
              ⚙️ Tweaks
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
