CREATE TABLE addresses (
	address_id INT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	zip INT(5),
	street VARCHAR (40),
	city VARCHAR(40),
	state VARCHAR(2),
	country VARCHAR(3)
);
CREATE TABLE users (
	user_id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(30),
	email VARCHAR(50),
	dob DATE,
	phone VARCHAR(10),
	address_id INT(20),
	hash BINARY(128) NOT NULL,
	salt BINARY(128) NOT NULL,
	FOREIGN KEY (address_id) REFERENCES addresses (address_id)
		ON DELETE SET TO NULL
);

CREATE TABLE sessions (
	user_id INT(10) UNSIGNED,
	session_hash BINARY(128) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (user_id)
		ON DELETE CASCADE,
	PRIMARY KEY (user_id, session_hash)
);

CREATE TABLE customers (
	cust_id INT(10) UNSIGNED PRIMARY KEY,
	royalty_points INT(6) UNSIGNED,
	royalty_days_remaining INT(20) UNSIGNED,
	avg_rating FLOAT(5,4),
	num_ratings INT(10),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
		ON DELETE CASCADE
);


CREATE TABLE sellers(
	sellers_id INT(10) UNSIGNED PRIMARY KEY,
	user_id INT(10) UNSIGNED NOT NULL,
	avg_rating FLOAT(5,4),
	num_ratings INT(10),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
		ON DELETE CASCADE,
);


CREATE TABLE categories(
	name VARCHAR(30) PRIMARY KEY,
	parent VARCHAR(30)
);

CREATE TABLE listings(
	item_id INT(20) UNSIGNED PRIMARY KEY,
	seller_id INT(10) UNSIGNED NOT NULL,
	cust_id INT(10) UNSIGNED,
	name VARCHAR(20),
	list_price FLOAT(7,2),
	reserve_price FLOAT(7,2),
	end_time DATE,
	list_type VARCHAR(10),
	location INT(20) UNSIGNED NOT NULL,
	color VARCHAR(20),
	type VARCHAR(20),
	size VARCHAR(10),
	style VARCHAR(20),
	avg_rating FLOAT(5,4),
	num_ratings INT(10),
	FOREIGN KEY (cust_id) REFERENCES customers (cust_id)
		ON DELETE CASCADE,
	FOREIGN KEY (sellers_id) REFERENCES sellers (item_id)
		ON DELETE CASCADE,
	FOREIGN KEY (name) REFERENCES categories (name)
		ON DELETE NO ACTION,
	FOREIGN KEY (location) REFERENCES addresses (address_id)
		ON DELETE SET TO NULL
);

CREATE TABLE shopping_cart (
	cust_id INT(10) UNSIGNED,
	item_id INT(20) UNSIGNED,
	FOREIGN KEY (cust_id) REFERENCES customers (cust_id)
		ON DELETE CASCADE,
	FOREIGN KEY (item_id) REFERENCES listings (item_id)
		ON DELETE CASCADE,
	PRIMARY KEY (cust_id, item_id)
);

CREATE TABLE watch_list (
	cust_id INT(10) UNSIGNED,
	item_id INT(20) UNSIGNED,
	FOREIGN KEY (cust_id) REFERENCES customers (cust_id)
		ON DELETE CASCADE,
	FOREIGN KEY (item_id) REFERENCES listings (item_id)
		ON DELETE CASCADE,
	PRIMARY KEY (cust_id, item_id)
);

CREATE TABLE comments (
	user_id INT(10) UNSIGNED,
	item_id INT(20) UNSIGNED,
	date DATETIME,
	text TEXT,
	FOREIGN KEY (user_id) REFERENCES users (user_id)
		ON DELETE CASCADE,
	FOREIGN KEY (item_id) REFERENCES listings (item_id)
		ON DELETE CASCADE,
	PRIMARY KEY (user_id, item_id, date)
);    
    
CREATE TABLE bidded_on (
	cust_id INT(10) UNSIGNED,
	item_id INT(20) UNSIGNED,
	amount FLOAT(7,2),
	time DATETIME,
	PRIMARY KEY (cust_id, item_id, amount),
	FOREIGN KEY (cust_id) REFERENCES users (cust_id)
		ON DELETE CASCADE,
	FOREIGN KEY (item_id) REFERENCES listings (item_id)
		ON DELETE CASCADE
);

CREATE TABLE payment_info (
	card_number INT(16) UNSIGNED,
	security_code INT(3) UNSIGNED NOT NULL,
	address_id INT(20) UNSIGNED NOT NULL,
	name VARCHAR(20),
	expiration DATE
	PRIMARY KEY (card_number, expiration),
	FOREIGN KEY (address_id) REFERENCES addresses (address_id)
		ON DELETE SET TO NULL
);

CREATE TABLE transactions(
	transaction_id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	customer_id INT(10) UNSIGNED NOT NULL,
	seller_id INT(10) UNSIGNED NOT NULL,
	item_id INT(20) UNSIGNED NOT NULL,
	payment_card INT(16) UNSIGNED NOT NULL,
	payment_exp INT(3) UNSIGNED NOT NULL,
	paid BOOL,
	sales_price FLOAT(7,2),
	payment_date DATE,
	customer_rating FLOAT(5,4),
	seller_rating FLOAT(5,4),
	transaction_type VARCHAR(1),
	delivery_status  BOOL,
	delivery_address INT(20) UNSIGNED NOT NULL,
	date_of_delivery DATE,
	shipping _options VARCHAR(20),
	return _policy VARCHAR(20),
	FOREIGN KEY (customer_id) REFERENCES customers (cust_id)
		ON DELETE SET TO NULL,
	FOREIGN KEY (seller_id) REFERENCES sellers (seller_id)
		ON DELETE SET TO NULL,
	FOREIGN KEY (item_id) REFERENCES listings (item_id)
		ON DELETE SET TO NULL,
	FOREIGN KEY (payment_card, payment_exp)
		REFERENCES payment_info (card_number, expiration)
		ON DELETE SET TO NULL,
	FOREIGN KEY (delivery_address) REFERENCES addresses (address_id)
		ON DELETE SET TO NULL
);