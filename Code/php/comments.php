<?php
/* File Name:           comments.php
 * Description:         This file contains the script to get comments
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

echo json_encode(GetComments($database, $_GET['item_id']));
?>
