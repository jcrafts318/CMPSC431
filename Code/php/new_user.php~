<?php
/* File Name:           new_user.php
 * Description:         This file contains a script to create a new user
 * Dependencies:        auth_lib.php, auth_toolbox.php, connect.php
 * Additional Notes:    none
 */

require_once("auth_lib.php");
require_once("connect.php");	// instantiates $database

// validate registration fields
$isValidEmail = preg_match('/[a-z0-9\(\)\.]+\@[a-z0-9]+\.[a-z]{2,8}/i', $_POST['email']);				// must be abc####@psu.edu email
//$isValidName = preg_match('/[a-z0-9]{10,}/i', $_POST['name']);							// must be at least 10 alphanumeric characters
//$isValidDob = preg_match('/([0-9]{4})\-([0-9]{2})\-([0-9]{2})/i', $_POST['dob'], $match);			// match pattern
//$isValidDob = $isValidDob && (int)$match[1] < 1998 && (int)match[1] > 1898 &&					// match bounds
//	(int)match[2] < 13 && (int)match[2] > 0 && (int)match[3] < 32 && (int)match[3] > 0;
//$isValidPhone = preg_match('/[0-9]{10}/', $_POST['phone']);							// must be 10 numbers
//$isValidStreet = preg_match('/[0-9]{1,6}\ [a-z\ 0-9]+/i', $_POST['street']);
//$isValidCity = preg_match('/[a-z]+/i', $_POST['city']);
//$isValidState = preg_match('/[A-Z]{2}/', $_POST['state']);
//$isValidZip = preg_match('/[0-9]{5}/', $_POST['zip']);
$isValidPassword = preg_match('/[a-z0-9*()^&%$#@!_?><., {}\"\';:|~`]{10,128}/i', $_POST['register_password']);	// must be 10-128 characters and composed of letters, numbers, and symbols
$isConfirmedPassword = $_POST['register_password'] === $_POST['confirm_password'];				// both password fields must be equivalent

// check all validation variables and then create user; if user creation fails or validation variables are incorrect, redirect to registration error page
if (!$isValidEmail || !$isValidPassword || !$isConfirmedPassword || 
	//$isValidName || $isValidDob || $isValidPhone ||
	//$isValidStreet || $isValidCity || $isValidState || $isValidZip ||
	!CreateUser($database, $_POST['email'], 
		$_POST['name'], $_POST['dob'], 
		$_POST['phone'], $_POST['street'], 
		$_POST['city'], $_POST['state'], 
		$_POST['zip'], $_POST['register_password']))
{
	header('Location: ../register_error.html');
}
// if all validation variables pass and user creation succeeds, redirect to confirm page
else
{
	header('Location: ../user_created.html') ;
}
?>
