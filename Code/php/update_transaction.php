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
	switch ($_POST['update'])
	{
		case 'seller_rating':
			RateAsSeller($database, $_POST['rating'], $_POST['transaction_id']);
			break;
		case 'customer_rating':
			RateAsCustomer($database, $_POST['rating'], $_POST['transaction_id']);
			break;
		case 'shipped':
			MarkAsShipped($database, $_POST['transaction_id']);
			break;
		case 'delivered':
			MarkAsDelivered($database, $_POST['transaction_id']);
			break;
		default:
	}
}
else
{
	header('Location: ../index.html#page=session_error');
}
?>
