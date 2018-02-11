import React from 'react';
import io from 'socket.io-client';
import Spinner from 'react-spinkit';
import Scanner from './scanner';
import Controller from './controller';
import './app.css';

const BASE_URL = (() =>
  window.location.search.includes('local')
    ? 'http://localhost:9000'
    : 'http://server.toomanycaptains.com')();

interface AppState {
  isLoading: boolean;
  mode: 'controller' | 'scanner';
  socket: SocketIOClient.Socket;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      mode: 'controller',
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
      <div className="App">
        <div className="App-toggleMode" onClick={this.toggleMode.bind(this)}>
        {this.state.mode}
        </div>
        {this.state.mode === 'scanner' ? (
          <Scanner socket={this.state.socket} />
        ) : (
          <Controller socket={this.state.socket} />
        )}
      </div>
    );
  }

  private toggleMode() {
    if (this.state.mode === 'controller') {
      this.setState({ mode: 'scanner' });
    } else {
      this.setState({ mode: 'controller' });
    }
  }
}

export default App;
