<?php
/* File Name:           transactions.php
 * Description:         This file contains the script to get transaction data linked to a specific user id
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))
{
	MakePayment($database, $_POST['card_number'], $_POST['expiration'], $_POST['cvv'], $_POST['cust_id']);
}
else
{
	header('Location: ../index.html#page=session_error');
}
?>
