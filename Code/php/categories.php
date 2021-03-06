<?php
/* File Name:           categories.php
 * Description:         This file contains the script to get subcategories of a given parent
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

if ($_GET['cat'] == "")
{
	echo json_encode(GetCategories($database, urldecode($_GET['cat'])));
}
else
{
	echo json_encode(GetCategorySubtree($database, urldecode($_GET['cat'])));
}
?>
