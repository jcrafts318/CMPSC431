<?php
/* File Name:           customer_data.php
 * Description:         This file contains the script to get customer data linked to a specific user id
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))
{
	echo json_encode(HasCustomer($database, $_COOKIE['email']));
}
else
{
	header('Location: ../index.html#page=session_error');
}
?>
