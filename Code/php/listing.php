<?php
/* File Name:           listing.php
 * Description:         This file contains the script to get all data related to a listing id
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php
 * Additional Notes:    none
 */
require_once("coconut_lib.php");
require_once("connect.php");

echo json_encode(GetListing($database, $_GET['item_id']));
?>
