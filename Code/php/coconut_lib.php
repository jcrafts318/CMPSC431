<?php
/* File Name:           coconut_lib.php
 * Description:         This file contains application library functions directly called by client processes
 * Dependencies:        auth_lib.php, auth_toolbox.php
 * Additional Notes:    none
 */

require_once("auth_lib.php");

function HasSeller($database, $email)
{
	$output = new \stdClass;
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "SELECT seller_id, avg_rating, num_ratings FROM sellers WHERE user_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		$output->retval = true;
		$output->rating = $result[0]['avg_rating'];
		$output->num_ratings = $result[0]['num_ratings'];
		$id = $result[0]['seller_id'];
		$query = "SELECT COUNT(*) FROM listings WHERE seller_id='$id'";
		$result = MySqlDatabaseQuery($database, $query);
		$output->num_listings = $result[0]['COUNT(*)'];
	}
	else
	{
		$output->retval = false;
	}
	return json_encode($output);
}

function HasCustomer($database, $email)
{
	$output = new \stdClass;
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "SELECT cust_id, royalty_points, royalty_days_remaining, avg_rating, num_ratings FROM customers WHERE user_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		$output->retval = true;
		$output->points = $result[0]['royalty_points'];
		$output->days = $result[0]['royalty_days_remaining'];
		$output->rating = $result[0]['avg_rating'];
		$output->num_ratings = $result[0]['num_ratings'];
		$id = $result[0]['cust_id'];
		$query = "SELECT COUNT(*) FROM watch_list WHERE cust_id='$id'";
		$result = MySqlDatabaseQuery($database, $query);
		$output->num_watched = $result[0]['COUNT(*)'];
		$query = "SELECT COUNT(*) FROM shopping_cart WHERE cust_id='$id'";
		$result = MySqlDatabaseQuery($database, $query);
		$output->num_carted = $result[0]['COUNT(*)'];
	}
	else
	{
		$output->retval = false;
	}
	return json_encode($output);
}

function CreateSeller($database, $email)
{
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "INSERT INTO sellers SET user_id='$id', avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}

function CreateCustomer($database, $email)
{
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "INSERT INTO customers SET user_id='$id', royalty_points=0, royalty_days_remaining=0, avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}
?>
