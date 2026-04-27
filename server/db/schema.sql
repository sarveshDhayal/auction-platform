CREATE TABLE users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auctions (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  seller_id     INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  image_url     VARCHAR(255),
  starting_price DECIMAL(10,2) NOT NULL,
  current_price  DECIMAL(10,2) NOT NULL,
  reserve_price  DECIMAL(10,2),
  end_time      DATETIME NOT NULL,
  status        ENUM('active','ended','cancelled') DEFAULT 'active',
  winner_id     INT,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (winner_id) REFERENCES users(id)
);

CREATE TABLE bids (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  auction_id   INT NOT NULL,
  bidder_id    INT NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  stripe_pi_id VARCHAR(100),      -- PaymentIntent ID for the hold
  hold_status  ENUM('held','captured','released') DEFAULT 'held',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id),
  FOREIGN KEY (bidder_id)  REFERENCES users(id)
);

CREATE TABLE notifications (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  message    TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
