<?php
/* File Name:           new_dual_listing.php
 * Description:         This file contains the script to create a new dual listing
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	if ($_POST['category'] != '' && $_POST['time-units'] != '')
	{
		switch ($_POST['time-units'])
		{
			// breaks intentionally left out so days will also multiply by 60
			case 'days':
				$_POST['duration'] *= 24;
			case 'hours':
				$_POST['duration'] += 60;
			case 'minutes':
			default:
		}
		NewListing($database, $_COOKIE['email'], $_POST['name'], 'dual', $_POST['category'], $_POST['list_price'], $_POST['reserve_price'], $_POST['duration']);
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
