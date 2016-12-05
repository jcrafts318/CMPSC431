<?php
/* File Name:           place_bid.php
 * Description:         This file contains the script to place a bid on an item
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	Checkout($database, $_GET['cust']);
	echo 'true';
}
else	// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
