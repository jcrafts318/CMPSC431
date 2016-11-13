<?php
/* File Name:           parent_category.php
 * Description:         This file contains the script to get the parent category of a given category
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

echo GetParentCategory($database, SanitizeString(urldecode($_GET['cat'])));
?>
