<?php
/* File Name:           add_to_watch_list.php
 * Description:         This file contains the script to add an item to the watch list
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	// TODO: fix the massive security hole, any person can arbitrarily add an item to any customer's cart or watch list if they have their id and they are logged in
	AddToWatchList($database, $_GET['cust'], $_GET['item_id']);
	echo 'true';
}
else				// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
