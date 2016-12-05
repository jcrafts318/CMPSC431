<?php
/* File Name:           watch_list.php
 * Description:         This file contains the script to get all ids on the watch list for a given customer
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	echo json_encode(GetWatchListIds($database, $_GET['cust']));
}
else				// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
