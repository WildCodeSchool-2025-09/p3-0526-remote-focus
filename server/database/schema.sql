CREATE TABLE user_(
   ID INT AUTO_INCREMENT,
   firstname VARCHAR(100) NOT NULL,
   lastname VARCHAR(50),
   email VARCHAR(255) NOT NULL,
   born_at DATE NOT NULL,
   login VARCHAR(50) NOT NULL,
   password VARCHAR(50) NOT NULL,
   dark_theme BOOLEAN NOT NULL,
   is_pegi16 BOOLEAN NOT NULL,
   role BOOLEAN NOT NULL,
   avatar VARCHAR(255) NOT NULL,
   CONSTRAINT PK_user_ PRIMARY KEY(ID),
   CONSTRAINT AK_user_ UNIQUE(email),
   CONSTRAINT AK_user__1 UNIQUE(login)
);

CREATE TABLE genre(
   ID INT AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   CONSTRAINT PK_genre PRIMARY KEY(ID),
   CONSTRAINT AK_genre UNIQUE(name)
);

CREATE TABLE media(
   ID INT AUTO_INCREMENT,
   name VARCHAR(150) NOT NULL,
   type VARCHAR(50) NOT NULL,
   released_at DATE,
   duration INT NOT NULL,
   poster VARCHAR(255),
   synopsis TEXT,
   overall_rating DECIMAL(15,2),
   status VARCHAR(50),
   original_name VARCHAR(150),
   original_language VARCHAR(50),
   pegi INT,
   CONSTRAINT PK_media PRIMARY KEY(ID)
);

CREATE TABLE season(
   ID INT AUTO_INCREMENT,
   name VARCHAR(150),
   released_at DATE,
   poster VARCHAR(255),
   synopsis TEXT,
   is_finished BOOLEAN NOT NULL,
   number INT,
   ID_media INT NOT NULL,
   CONSTRAINT PK_season PRIMARY KEY(ID),
   CONSTRAINT FK_season_media FOREIGN KEY(ID_media) REFERENCES media(ID)
);

CREATE TABLE episode(
   ID INT AUTO_INCREMENT,
   name VARCHAR(150),
   number INT,
   released_at DATE,
   synopsis TEXT,
   duration INT NOT NULL,
   ID_season INT NOT NULL,
   CONSTRAINT PK_episode PRIMARY KEY(ID),
   CONSTRAINT FK_episode_season FOREIGN KEY(ID_season) REFERENCES season(ID)
);

CREATE TABLE platform(
   ID INT AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   logo VARCHAR(255),
   url VARCHAR(255),
   CONSTRAINT PK_platform PRIMARY KEY(ID),
   CONSTRAINT AK_platform UNIQUE(name)
);

CREATE TABLE person(
   ID INT AUTO_INCREMENT,
   biography TEXT,
   photo VARCHAR(255),
   name VARCHAR(50) NOT NULL,
   CONSTRAINT PK_person PRIMARY KEY(ID)
);

CREATE TABLE classify_as(
   ID_media INT,
   ID_genre INT,
   CONSTRAINT PK_classify_as PRIMARY KEY(ID_media, ID_genre),
   CONSTRAINT FK_classify_as_media FOREIGN KEY(ID_media) REFERENCES media(ID),
   CONSTRAINT FK_classify_as_genre FOREIGN KEY(ID_genre) REFERENCES genre(ID)
);

CREATE TABLE available_on(
   ID_media INT,
   ID_platform INT,
   CONSTRAINT PK_available_on PRIMARY KEY(ID_media, ID_platform),
   CONSTRAINT FK_available_on_media FOREIGN KEY(ID_media) REFERENCES media(ID),
   CONSTRAINT FK_available_on_platform FOREIGN KEY(ID_platform) REFERENCES platform(ID)
);

CREATE TABLE favorite(
   ID_user INT,
   ID_person INT,
   CONSTRAINT PK_favorite PRIMARY KEY(ID_user, ID_person),
   CONSTRAINT FK_favorite_user_ FOREIGN KEY(ID_user) REFERENCES user_(ID),
   CONSTRAINT FK_favorite_person FOREIGN KEY(ID_person) REFERENCES person(ID)
);

CREATE TABLE like_(
   ID_user INT,
   ID_genre INT,
   CONSTRAINT PK_like_ PRIMARY KEY(ID_user, ID_genre),
   CONSTRAINT FK_like__user_ FOREIGN KEY(ID_user) REFERENCES user_(ID),
   CONSTRAINT FK_like__genre FOREIGN KEY(ID_genre) REFERENCES genre(ID)
);

CREATE TABLE track(
   ID_user INT,
   ID_media INT,
   favorite_media BOOLEAN NOT NULL,
   user_rating DECIMAL(15,2),
   watchlist BOOLEAN NOT NULL,
   CONSTRAINT PK_track PRIMARY KEY(ID_user, ID_media),
   CONSTRAINT FK_track_user_ FOREIGN KEY(ID_user) REFERENCES user_(ID),
   CONSTRAINT FK_track_media FOREIGN KEY(ID_media) REFERENCES media(ID)
);

CREATE TABLE media_user(
   ID_user INT,
   ID_media INT,
   viewed_at DATETIME NOT NULL,
   CONSTRAINT PK_media_user PRIMARY KEY(ID_user, ID_media),
   CONSTRAINT FK_media_user_user_ FOREIGN KEY(ID_user) REFERENCES user_(ID),
   CONSTRAINT FK_media_user_media FOREIGN KEY(ID_media) REFERENCES media(ID)
);

CREATE TABLE episode_person(
   ID_episode INT,
   ID_person INT,
   personnage_name VARCHAR(50),
   role VARCHAR(50),
   CONSTRAINT PK_episode_person PRIMARY KEY(ID_episode, ID_person),
   CONSTRAINT FK_episode_person_episode FOREIGN KEY(ID_episode) REFERENCES episode(ID),
   CONSTRAINT FK_episode_person_person FOREIGN KEY(ID_person) REFERENCES person(ID)
);

CREATE TABLE episode_user(
   ID_user INT,
   ID_episode INT,
   viewed_at DATETIME NOT NULL,
   CONSTRAINT PK_episode_user PRIMARY KEY(ID_user, ID_episode),
   CONSTRAINT FK_episode_user_user_ FOREIGN KEY(ID_user) REFERENCES user_(ID),
   CONSTRAINT FK_episode_user_episode FOREIGN KEY(ID_episode) REFERENCES episode(ID)
);

CREATE TABLE media_person(
   ID_media INT,
   ID_person INT,
   personnage_name VARCHAR(50),
   role VARCHAR(50),
   CONSTRAINT PK_media_person PRIMARY KEY(ID_media, ID_person),
   CONSTRAINT FK_media_person_media FOREIGN KEY(ID_media) REFERENCES media(ID),
   CONSTRAINT FK_media_person_person FOREIGN KEY(ID_person) REFERENCES person(ID)
);
