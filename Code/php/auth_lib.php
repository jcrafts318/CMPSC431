<?php
/* File Name:           auth_lib.php
 * Description:         This file contains authentication/user library functions directly called by client processes
 * Dependencies:        auth_toolbox.php
 * Additional Notes:    none
 */

require_once("auth_toolbox.php");

function CreateUser($database, $email, $name, $dob, $phone, $street, $city, $state, $zip, $password)
// PRE:  $database is an open MySQL database connection
//       all input fields have already been validated in new_user.php
// POST: FCTVAL == result of DB query or FALSE if user already exists in DB
{
	if (!UserExists($database, $email))
	{
		$email = SanitizeString($email);
		$password = SanitizeString($password);
		$name = SanitizeString($name);
		$dob = SanitizeString($dob);
		$address = GetAddressId($database, $street, $city, $state, $zip);
		$salt = GenerateSalt();
		$hash = HashPassword($password, $salt);
		$query = "INSERT INTO users SET email='$email', name='$name', dob='$dob', phone='$phone', address_id='$address', hash='$hash', salt='$salt'";
		$retval = MySqlDatabaseQuery($database, $query, TRUE);
		return $retval;
	}
	else
	{
		return FALSE;
	}
}

function AuthenticateUser($database, $email, $password)
// PRE:  $database is an open MySQL database connection
//       $email is the email of a user to authenticate
//       $password is the password of a user to authenticate
// POST: FCTVAL == true if the user passes authentication with the supplied credentials, o.w. false
{
	$email = SanitizeString($email);
	$password = SanitizeString($password);
	$query = "SELECT hash,salt FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	if (HashPassword($password, $result[0]['salt']) === $result[0]['hash'])
	{
		return TRUE;
	}
	else
	{
		return FALSE;
	}
}

function InitiateSession($database, $email)
// PRE:  $database is an open MySQL database connection
//       $email is the email for which to initiate a session
// POST: client side, a cookie exists called 'email' which is equivalent to $email
//       a session variable called 'session_key' is instantiated which carries one half
//       of the needed value to hash to verify the session
//       old session keys for user $email are deleted, and a new entry is created in the
//       table 'sessions' with id equal to the primary key of the row in 'users' containing
//       $email, and session key equal to the SHA-512 hash of the 'session_key' session variable
//       concatenated with the user's salt (also in the users table)
{
	$query = "SELECT user_id,salt FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$salt = $result[0]['salt'];
	$_SESSION['session_key'] = GenerateSalt();
	$query = "SELECT * FROM sessions WHERE user_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		$query = "DELETE FROM sessions WHERE user_id='$id';INSERT INTO sessions SET user_id='$id', session_hash='" . HashPassword($_SESSION['session_key'], $salt) . "';";
		MySqlMultiQuery($database, $query, TRUE);
	}
	else
	{
		$query = "INSERT INTO sessions SET user_id='$id', session_hash='" . HashPassword($_SESSION['session_key'], $salt) . "'";
		MySqlDatabaseQuery($database, $query, TRUE);
	}
	setcookie("email", $email);
}

function VerifySession($database)
// PRE:  $database is an open MySQL database connection
//       a 'session_key' session variable is initialized for this user
//       an 'email' cookie is initialized client side
//       a 'session_key' for this user exists in the 'sessions' table
// POST: FCTVAL == true if the client side cookie, the 'session_key' session
//       variable, and the 'session_key' field in 'sessions' for this user
//       agree, o.w. false
{
	$email = $_COOKIE['email'];
	$query = "SELECT user_id,salt FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$salt = $result[0]['salt'];
	$query = "SELECT session_hash FROM sessions WHERE user_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	// if hashed session key is equal to stored database value, session is authentic
	if ($result[0]['session_hash'] === HashPassword($_SESSION['session_key'], $salt))
	{
		return TRUE;
	}
	else
	{
		return FALSE;
	}	
}

function EndSession($database)
// PRE:  $database is an open MySQL database connection
//       a 'session_key' session variable is initialized for this user
//       an 'email' cookie is initialized client side
//       a 'session_key' for this user exists in the 'sessions' table
// POST: the row in 'sessions' for this user is deleted
{
	$email = $_COOKIE['email'];
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "DELETE FROM sessions WHERE user_id='$id'";
	MySqlDatabaseQuery($database, $query);
	setcookie("email", "");
}

function GenerateSalt()
// POST: FCTVAL == a random 32 character string to use as a salt, or as a random seed to an email confirmation code
{
	return mcrypt_create_iv(32, MCRYPT_DEV_URANDOM);
}

function HashPassword($password, $salt)
// PRE:  $password is some input password
//       $salt is a salt to prepend when hashing $password
// POST: FCTVAL == the hashed value of $salt . $password
{
	return hash("sha512", $salt . $password);
}

function UserExists($database, $email)
// PRE:  $database is an open MySQL database connection
//       $email is a valid email
// POST: FCTVAL == true if the supplied email exists in the 'users' table,
//       o.w. false
{
	$query = "SELECT email FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		return TRUE;
	}
	else
	{
		return FALSE;
	}
}

function GetAddressId($database, $street, $city, $state, $zip)
// PRE:  $database is an open MySQL database connection
//       all other fields are valid address fields
// POST: If address already exists in DB, FCTVAL == existing id for that address entry,
//       o.w. the address is added to the DB and FCTVAL == id for the new address entry
{
	$street = SanitizeString($street);
	$city = SanitizeString($city);
	$state = SanitizeString($state);
	$zip = SanitizeString($zip);
	$query = "SELECT address_id FROM addresses WHERE street='$street' AND city='$city' AND state='$state' AND zip='$zip'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		return $result[0]['address_id'];
	}
	$query = "INSERT INTO addresses SET street='$street', city='$city', state='$state', zip='$zip'";
	MySqlDatabaseQuery($database, $query);
	$query = "SELECT address_id FROM addresses WHERE street='$street' AND city='$city' AND state='$state' AND zip='$zip'";
	$result = MySqlDatabaseQuery($database, $query);
	return $result[0]['address_id'];
}
?>
