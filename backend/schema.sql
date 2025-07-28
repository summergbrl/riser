--
-- PostgreSQL database schema for Riser flood monitoring system
--
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    location GEOGRAPHY(Point, 4326),
    notify BOOLEAN DEFAULT TRUE
);

CREATE TABLE flood_alerts (
    id SERIAL PRIMARY KEY,
    area VARCHAR(100),
    risk_level VARCHAR(20),
    alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news_posts (
    id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT,
    posted_at TIMESTAMP
);
