<?php
/* File Name:           listings.php
 * Description:         This file contains the script to get listing ids based on search terms and filtered by category
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php
 * Additional Notes:    none
 */
require_once("coconut_lib.php");
require_once("connect.php");

if ($_GET['list_type'] == null)
{
	$_GET['list_type'] = 7;
}
if ($_GET['seller_id'] == null)
{
	$_GET['seller_id'] == 0;
}

$listings = GetListingIds($database, $_GET['cat'], $_GET['search'], $_GET['list_type'], $_GET['seller_id']);

$output = [];
for ($i = $listings->max; $i > 0; $i--)
{
	if (property_exists($listings, $i))
	{
		foreach ($listings->{$i} as $listing)
		{
			array_push($output, $listing);
		}
	}
}
echo json_encode($output);
?>
