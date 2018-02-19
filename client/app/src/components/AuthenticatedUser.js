import React, { Component } from 'react';
import PropTypes from 'prop-types';


class AuthenticatedUser extends Component {
  constructor(props) {
    super(props);
    const currentId = props.otherMembers.length ? props.otherMembers[0].id : null;
    this.state = { currentId };
  }

  onSendCoordinates = (e) => {
    e.preventDefault();
    this.props.sendCoordinates(this.state.currentId);
  }

  onSelectChange = (e) => {
    this.setState({ currentId: e.target.value });
  }

  render() {
    const { currentUsername, messages, otherMembers } = this.props;
    return (
      <div>
        You are { currentUsername }
        {
          messages.length ?
            <div>
              Your mesages:
              <div>
                {
                  messages.map((message) => {
                    const { username, date, coordinates } = message;
                    const info = `From: ${username}, (${coordinates.x}, ${coordinates.y}), at ${date}`;
                    const key = `${username}${date}`;
                    return <div key={key}>{info}</div>;
                  })
                }
              </div>
            </div> :
            <div>You have no messages</div>
        }
        <form>
          <select size="1" onChange={this.onSelectChange}>
            {
              otherMembers.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))
            }
          </select>
          <input type="submit" onClick={this.onSendCoordinates} value="Send my coordinates" />
        </form>
      </div>
    );
  }
}

AuthenticatedUser.propTypes = {
  currentUsername: PropTypes.string.isRequired,
  messages: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  sendCoordinates: PropTypes.func.isRequired,
  otherMembers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default AuthenticatedUser;
