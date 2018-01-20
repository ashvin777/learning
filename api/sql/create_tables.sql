CREATE TABLE frames (
    id bigserial NOT NULL,
		name text NOT NULL,
		number text,
		serial text,
		address int,
		serialstart text,
		PRIMARY KEY (ID)
);

CREATE TABLE components (
	id bigserial NOT NULL,
	number text,
	name  text NOT NULL,
	frameid bigserial REFERENCES frames(id),
	PRIMARY KEY (ID)
);

CREATE TABLE logs (
	id bigserial NOT NULL,
	frametype text NOT NULL,
	framedynamiccode text,
	framenumber text,
	framecomponent text NOT NULL,
	shiftnumber text NOT NULL,
	processingtime text NOT NULL,
	status text NOT NULL,
	timestamp text NOT NULL,
	PRIMARY KEY (ID)
);

CREATE TABLE shifts (
	id bigserial NOT NULL,
	name text NOT NULL,
	starttime text NOT NULL,
	endtime text NOT NULL
);

CREATE TABLE users (
	id bigserial NOT NULL,
	username text NOT NULL,
	password text NOT NULL
);

CREATE INDEX idx_frames ON frames(id);
CREATE INDEX idx_components ON components(id);
CREATE INDEX idx_logs ON logs(id);
CREATE INDEX idx_users ON users(id);