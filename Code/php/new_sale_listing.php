<?php
/* File Name:           new_sale_listing.php
 * Description:         This file contains the script to create a new direct sale listing
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	if ($_POST['category'] != '')
	{
		NewListing($database, $_COOKIE['email'], $_POST['name'], 'sale', $_POST['category'], $_POST['list_price'], -1, 0);
		header('Location: ../index.html#page=my_listings');
	}
	else
	{
		header('Location: ../index.html#page=add_listing_error');
	}
}
else				// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
