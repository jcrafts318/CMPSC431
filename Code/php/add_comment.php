<?php
/* File Name:           add_comment.php
 * Description:         This file contains the script to add a comment
 * Dependencies:        auth_lib.php, auth_toolbox.php, coconut_lib.php, connect.php
 * Additional Notes:    none
 */

require_once("coconut_lib.php");
require_once("connect.php");

session_start();
if (VerifySession($database))	// if session token is valid for this user, echo true
{
	if ($_POST['text'] != "")
	{
		AddComment($database, $_POST['item_id'], $_POST['user'], $_POST['text']);
	}
}
else				// if session token is invalid, echo false
{
	header('Location: ../index.html#page=session_error');
}
?>
