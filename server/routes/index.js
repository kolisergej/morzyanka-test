import db from '../db';

const socketIdAuthId = Object.create(null);
const authIdSocket = Object.create(null);

export default function (io) {
  io.on('connection', (socket) => {
    db.query('SELECT * FROM test_user')
      .then(res => io.emit('users', res.rows))
      .catch(e => console.error(e.stack));

    // Add user
    socket.on('addUser', (message) => {
      const { addUsername, addX, addY } = message;
      db.query('INSERT INTO test_user (username, current_coordinates) VALUES ($1, POINT($2, $3)) RETURNING id', [addUsername, addX, addY])
        .then(res => io.emit('userAdded', { id: res.rows[0].id, username: addUsername, x: addX, y: addY }))
        .catch(e => console.error(e.stack));
    });

    // Update user
    socket.on('updateUser', (message) => {
      const { id, x, y } = message;
      db.query('UPDATE test_user SET current_coordinates = POINT($1, $2) WHERE id = $3', [x, y, id])
        .then(() => io.emit('userUpdated', { id, x, y }))
        .catch(e => console.error(e.stack));
    });

    // Authenticate
    socket.on('authenticate', (message) => {
      const { id } = message;

      db.query('SELECT history.coordinates, history.date, test_user.username FROM history JOIN test_user ON history.from_user = test_user.id WHERE to_user = $1 ORDER BY history.date DESC', [id])
        .then((res) => {
          const messages = res.rows.map((row) => {
            const { username, coordinates, date } = row;
            return { username, coordinates, date };
          });
          socketIdAuthId[socket.id] = id;
          authIdSocket[id] = socket;
          socket.emit('authOk', { id, messages });
        })
        .catch(e => console.error(e.stack));
    });

    // Send coordinates
    socket.on('sendCoordinates', (message) => {
      const { to } = message;
      db.connect((connectionError, client, done) => {
        if (connectionError) {
          console.error(connectionError);
          done();
          return;
        }

        const source = socketIdAuthId[socket.id];
        const date = new Date();
        let sourceUsername = null;
        let x = null;
        let y = null;

        client.query('BEGIN')
          .then(() => client.query('SELECT username, current_coordinates FROM test_user WHERE id = $1', [source]))
          .then((result) => {
            const currentCoordinates = result.rows[0].current_coordinates;
            x = currentCoordinates.x;
            y = currentCoordinates.y;
            sourceUsername = result.rows[0].username;
            return client.query('INSERT INTO history (to_user, from_user, coordinates, date) VALUES ($1, $2, POINT($3, $4), $5)', [to, source, x, y, date]);
          })
          .then(() => client.query('COMMIT'))
          .then(() => {
            const coordinates = { x, y };
            if (authIdSocket[to]) {
              authIdSocket[to].emit('newMessage', { username: sourceUsername, coordinates, date });
            }
            done();
          })
          .catch((error) => {
            client.query('ROLLBACK')
              .then(() => {
                console.error(error);
                done();
              });
          });
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const authId = socketIdAuthId[socket.id];
      delete authIdSocket[authId];
      delete socketIdAuthId[socket.id];
    });
  });
}
