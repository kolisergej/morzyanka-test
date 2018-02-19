import React, { Component } from 'react';
import io from 'socket.io-client';

import UserInfo from './UserInfo';
import AuthenticatedUser from './AuthenticatedUser';


class App extends Component {
  constructor() {
    super();
    this.state = {
      addUsername: '',
      addX: '',
      addY: '',
      users: [],
      authId: null,
      messages: [],
    };
  }

  componentDidMount() {
    this.socket = io('http://127.0.0.1:3000');

    this.socket.on('users', (data) => {
      const users = [];
      data.forEach((existingUser) => {
        const { id, username } = existingUser;
        const { x, y } = existingUser.current_coordinates;
        users[id] = {
          id, username, x, y,
        };
      });
      this.setState({ users });
    });

    this.socket.on('userAdded', (data) => {
      const {
        id, username, x, y,
      } = data;
      const users = [];
      this.state.users.forEach((existingUser) => {
        if (existingUser) {
          users[existingUser.id] = Object.assign({}, existingUser);
        }
      });
      users[id] = {
        id, username, x, y,
      };
      this.setState({ users });
    });

    this.socket.on('userUpdated', (data) => {
      const { id, x, y } = data;
      const users = [];
      this.state.users.forEach((existingUser) => {
        if (existingUser) {
          users[existingUser.id] = Object.assign({}, existingUser);
        }
      });
      users[id] = Object.assign({}, users[id], { x, y });
      this.setState({ users });
    });

    this.socket.on('newMessage', (data) => {
      const newMessages = [];
      this.state.messages.forEach((message) => {
        newMessages.push(Object.assign({}, message));
      });
      newMessages.unshift(data);

      this.setState({ messages: newMessages });
    });

    this.socket.on('authOk', (data) => {
      this.setState({ authId: data.id, messages: data.messages });
    });
  }

  onUsernameChange = (e) => {
    this.setState({ addUsername: e.target.value });
  }
  onXChange = (e) => {
    this.setState({ addX: e.target.value });
  }
  onYChange = (e) => {
    this.setState({ addY: e.target.value });
  }

  onAuthClick = (e, id) => {
    e.preventDefault();
    this.socket.emit('authenticate', { id });
  }

  onAddUser = (e) => {
    e.preventDefault();
    const { addUsername, addX, addY } = this.state;
    this.setState({
      addUsername: '',
      addX: '',
      addY: '',
    });
    this.socket.emit('addUser', { addUsername, addX, addY });
  }

  sendCoordinates = (to) => {
    this.socket.emit('sendCoordinates', { to });
  }

  updateCoordinates = (e, id, x, y) => {
    e.preventDefault();
    this.socket.emit('updateUser', { id, x, y });
  }

  render() {
    const { users, authId, messages } = this.state;
    const currentUsername = authId ? users[authId].username : null;
    const otherMembers = authId ? users.filter(user => user.id !== authId) : [];
    return (
      <div>
        <form onSubmit={this.onAddUser}>
          <input
            placeholder="Username"
            type="text"
            onChange={this.onUsernameChange}
            value={this.state.addUsername}
            required
          />
          <input
            placeholder="X coordinate"
            type="number"
            onChange={this.onXChange}
            value={this.state.addX}
            required
          />
          <input
            placeholder="Y coordinate"
            type="number"
            onChange={this.onYChange}
            value={this.state.addY}
            required
          />
          <input type="submit" value="Add user" />
        </form>
        {
          users.length ? (
            <div>
              <div>
                Change coordinates:
                {
                  users.map(existingUser => (
                    <UserInfo
                      key={existingUser.id}
                      isUpdate
                      callback={this.updateCoordinates}
                      data={existingUser}
                    />))
                }
              </div>
              <div>
                Auth as:
                {
                  users.map(existingUser => (
                    <UserInfo
                      key={existingUser.id}
                      callback={this.onAuthClick}
                      data={existingUser}
                    />))
                }
              </div>
            </div>
            ) :
            <div>No users</div>
        }
        {
          currentUsername ? <AuthenticatedUser
            currentUsername={currentUsername}
            messages={messages}
            otherMembers={otherMembers}
            sendCoordinates={this.sendCoordinates}
          /> : null
        }
      </div>
    );
  }
}

export default App;
