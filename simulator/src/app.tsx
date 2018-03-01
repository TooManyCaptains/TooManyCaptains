import React from 'react';
import io from 'socket.io-client';
import Spinner from 'react-spinkit';
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

    let component = null;
    if (this.state.activeTab === 'scanner') {
      component = <Scanner socket={this.state.socket} />;
    } else if (this.state.activeTab === 'controller') {
      component = <Controller socket={this.state.socket} />;
    } else {
      component = <Cheats socket={this.state.socket} />;
    }

    const tabs: Tab[] = ['controller', 'scanner', 'cheats'];

    return (
      <div className="App">
        <div className="ModeTabs">
          {tabs.map(tab => (
            <div
              className={`ModeTab ${
                this.state.activeTab === tab ? 'active' : ''
              }`}
              onClick={() => this.setState({ activeTab: tab })}
            >
              {tab}
            </div>
          ))}
        </div>
        {component}
      </div>
    );
  }
}

export default App;
