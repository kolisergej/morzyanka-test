CREATE TABLE IF NOT EXISTS test_user (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  current_coordinates POINT NOT NULL -- у pg есть расширение postgis для хранения координат, но выбрал для упрощения POINT
);


CREATE TABLE IF NOT EXISTS history (
  to_user INT NOT NULL,
  from_user INT NOT NULL,
  coordinates POINT NOT NULL,
  date TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS history_to_user_idx ON history(to_user);
ALTER TABLE history ADD CONSTRAINT history_to_user_fkey FOREIGN KEY (to_user) REFERENCES test_user(id);
ALTER TABLE history ADD CONSTRAINT history_from_user_fkey FOREIGN KEY (from_user) REFERENCES test_user(id);


INSERT INTO test_user (username, current_coordinates) VALUES ('User1', POINT(10, 20));
INSERT INTO test_user (username, current_coordinates) VALUES ('User2', POINT(98, -20));
INSERT INTO test_user (username, current_coordinates) VALUES ('User3', POINT(10, 90));

INSERT INTO history (to_user, from_user, coordinates) VALUES (1, 2, POINT(98, -20));
