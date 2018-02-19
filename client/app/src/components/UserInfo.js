import React from 'react';
import PropTypes from 'prop-types';


function UserInfo(props) {
  const { data, isUpdate, callback } = props;
  const {
    id, username, x, y,
  } = data;
  const value = isUpdate ? `${username} (${x}, ${y})` : username;

  return (
    <button
      onClick={(e) => {
        if (isUpdate) {
          // For simplicity set coordinate to 0, if incorrect input
          const newX = parseInt(prompt('Введите X?'), 10) || 0; // eslint-disable-line no-alert
          const newY = parseInt(prompt('Введите Y?'), 10) || 0; // eslint-disable-line no-alert
          callback(e, id, newX, newY);
        } else {
          callback(e, id);
        }
      }}
    >
      { value }
    </button>
  );
}

UserInfo.propTypes = {
  isUpdate: PropTypes.bool,
  data: PropTypes.shape().isRequired,
  callback: PropTypes.func.isRequired,
};

UserInfo.defaultProps = {
  isUpdate: false,
};

export default UserInfo;
