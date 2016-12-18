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
	// TODO: fix the massive security hole, any person can arbitrarily add an item to any customer's cart or watch list if they have their id and they are logged in
	PlaceBid($database, $_GET['cust'], $_GET['item_id'], $_GET['bid']);
	AddToWatchList($database, $_GET['cust'], $_GET['item_id']);
	echo 'true';
}
else	// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
