<?php
/* File Name:           coconut_lib.php
 * Description:         This file contains application library functions directly called by client processes
 * Dependencies:        auth_lib.php, auth_toolbox.php
 * Additional Notes:    none
 */

require_once("auth_lib.php");

function GetParentCategory($database, $category)
// PRE:  $database is an open database connection
//       $category is the name of a category which is not 'All'
// POST: FCTVAL == json encoding of an array of categories which are children of $parent
{
	$query = "SELECT parent FROM categories WHERE name='$category'";
	$result = MySqlDatabaseQuery($database, $query);

	return $result[0]['parent'];
}

function GetCategories($database, $parent)
// PRE:  $database is an open database connection
//       $parent is the name of a category (base category being 'All')
// POST: FCTVAL == json encoding of an array of categories which are children of $parent
{
	$query = "SELECT name FROM categories WHERE parent='$parent'";
	$result = MySqlDatabaseQuery($database, $query);
	$output = array();
	foreach ($result as $res)
	{
		array_push($output, $res['name']);
	}
	return json_encode($output);
}

function UserData($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: FCTVAL == json encoding of an object with all data relevant to this user profile not explicitly associated
//       with a customer or seller (comments, address, dob, phone, etc.)
{
	$output = new \stdClass;
	$query = "SELECT E.name, E.dob, E.phone, A.street, A.city, A.state, A.zip FROM users E JOIN addresses A ON E.address_id = A.address_id WHERE E.email='$email'";
	$result = MySqlDatabaseQuery($database, $query);

	$output->name = $result[0]['name'];
	$output->email = $email;
	$output->dob = $result[0]['dob'];
	$output->address = new \stdClass;
	$output->address->street = $result[0]['street'];
	$output->address->city = $result[0]['city'];
	$output->address->state = $result[0]['state'];
	$output->address->zip = $result[0]['zip'];
	$output->phone = $result[0]['phone'];

	return json_encode($output);
}

function HasSeller($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: FCTVAL == json encoding of an object with a "retval" indicating if a seller record exists for this user,
//       and relevant data accompanying that if the record exists
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
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: FCTVAL == json encoding of an object with a "retval" indicating if a customer record exists for this user,
//       and relevant data accompanying that if the record exists
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
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: a seller record is created for this user
{
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "INSERT INTO sellers SET user_id='$id', avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}

function CreateCustomer($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: a customer record is created for this user
{
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "INSERT INTO customers SET user_id='$id', royalty_points=0, royalty_days_remaining=0, avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}
?>
