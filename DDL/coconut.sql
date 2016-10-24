-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 24, 2016 at 07:00 AM
-- Server version: 5.5.44-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `coconut`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE IF NOT EXISTS `addresses` (
  `address_id` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `zip` int(5) DEFAULT NULL,
  `street` varchar(40) DEFAULT NULL,
  `city` varchar(40) DEFAULT NULL,
  `state` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

-- --------------------------------------------------------

--
-- Table structure for table `bidded_on`
--

CREATE TABLE IF NOT EXISTS `bidded_on` (
  `cust_id` int(10) unsigned NOT NULL DEFAULT '0',
  `item_id` int(20) unsigned NOT NULL DEFAULT '0',
  `amount` float(7,2) NOT NULL DEFAULT '0.00',
  `time` datetime DEFAULT NULL,
  PRIMARY KEY (`cust_id`,`item_id`,`amount`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `name` varchar(30) NOT NULL,
  `parent` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
  `user_id` int(10) unsigned NOT NULL DEFAULT '0',
  `item_id` int(20) unsigned NOT NULL DEFAULT '0',
  `date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `text` text,
  PRIMARY KEY (`user_id`,`item_id`,`date`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE IF NOT EXISTS `customers` (
  `cust_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `royalty_points` int(6) unsigned DEFAULT NULL,
  `royalty_days_remaining` int(20) unsigned DEFAULT NULL,
  `avg_rating` float(5,4) DEFAULT '0.0000',
  `num_ratings` int(10) DEFAULT NULL,
  PRIMARY KEY (`cust_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE IF NOT EXISTS `listings` (
  `item_id` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` int(10) unsigned NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `list_price` float(7,2) DEFAULT NULL,
  `reserve_price` float(7,2) DEFAULT NULL,
  `end_time` date DEFAULT NULL,
  `list_type` varchar(10) DEFAULT NULL,
  `location_id` int(20) unsigned NOT NULL,
  `avg_rating` float(5,4) DEFAULT '0.0000',
  `num_ratings` int(10) DEFAULT '0',
  `category` varchar(50) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `seller_id` (`seller_id`),
  KEY `name` (`name`),
  KEY `location` (`location_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=101 ;

-- --------------------------------------------------------

--
-- Table structure for table `payment_info`
--

CREATE TABLE IF NOT EXISTS `payment_info` (
  `cust_id` int(10) NOT NULL,
  `card_number` int(16) unsigned NOT NULL DEFAULT '0',
  `security_code` int(3) unsigned NOT NULL,
  `address_id` int(20) unsigned NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `expiration` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`card_number`,`expiration`),
  KEY `address_id` (`address_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `sellers`
--

CREATE TABLE IF NOT EXISTS `sellers` (
  `seller_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `avg_rating` float(5,4) DEFAULT NULL,
  `num_ratings` int(10) DEFAULT NULL,
  PRIMARY KEY (`seller_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE IF NOT EXISTS `sessions` (
  `user_id` int(10) unsigned NOT NULL DEFAULT '0',
  `session_hash` binary(128) NOT NULL,
  PRIMARY KEY (`user_id`,`session_hash`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `shopping_cart`
--

CREATE TABLE IF NOT EXISTS `shopping_cart` (
  `cust_id` int(10) unsigned NOT NULL DEFAULT '0',
  `item_id` int(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`cust_id`,`item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int(10) unsigned NOT NULL,
  `item_id` int(20) unsigned NOT NULL,
  `payment_card` int(16) unsigned NOT NULL,
  `payment_exp` int(3) unsigned NOT NULL,
  `paid` tinyint(1) DEFAULT NULL,
  `sales_price` float(7,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `customer_rating` float(5,4) DEFAULT NULL,
  `seller_rating` float(5,4) DEFAULT NULL,
  `transaction_type` varchar(1) DEFAULT NULL,
  `delivery_status` tinyint(1) DEFAULT NULL,
  `delivery_address` int(20) unsigned NOT NULL,
  `date_of_delivery` date DEFAULT NULL,
  `shipping_options` varchar(20) DEFAULT NULL,
  `return_policy` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `customer_id` (`customer_id`),
  KEY `item_id` (`item_id`),
  KEY `payment_card` (`payment_card`,`payment_exp`),
  KEY `delivery_address` (`delivery_address`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `address_id` int(20) DEFAULT NULL,
  `hash` binary(128) NOT NULL,
  `salt` varchar(32) NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `address_id` (`address_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

-- --------------------------------------------------------

--
-- Table structure for table `watch_list`
--

CREATE TABLE IF NOT EXISTS `watch_list` (
  `cust_id` int(10) unsigned NOT NULL DEFAULT '0',
  `item_id` int(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`cust_id`,`item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
