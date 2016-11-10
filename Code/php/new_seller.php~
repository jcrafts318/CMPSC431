<?php
/* File Name:           new_seller.php
 * Description:         This file contains the script to create a new seller linked to a specific user id
 * Dependencies:        auth_lib.php, auth_toolbox.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	CreateSeller($database, $_COOKIE['email']);
	header('Location: ../home.html');
}
else				// if session token is invalid, echo false
{
	header('Location: ../session_error.html');
}
?>
