<?php
/* File Name:           logout.php
 * Description:         This file removes the session key from the database and resets the client side cookie
 * Dependencies:        auth_lib.php, auth_toolbox.php, connect.php
 * Additional Notes:    none
 */

require_once("auth_lib.php");
require_once("connect.php");	// instantiates $database

// remove active session hash from DB
EndSession($database);
// redirect to login page
header('Location: ../home.html');
?>
