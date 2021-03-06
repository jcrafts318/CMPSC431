<?php
/* File Name:           new_customer.php
 * Description:         This file contains the script to create a new customer linked to a specific user id
 * Dependencies:        auth_lib.php, auth_toolbox.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	CreateCustomer($database, $_COOKIE['email']);
	header('Location: ../index.html#page=home');
}
else				// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
