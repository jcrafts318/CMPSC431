<?php
/* File Name:           connect.php
 * Description:         This file instantiates a database connection as $database
 * Dependencies:        auth_toolbox.php
 * Additional Notes:    none
 */

require_once('auth_toolbox.php');

// acquire database connection
$database = MySqlDatabaseConnection('localhost', 'root', 'tobleronepuddingp)p', 'coconut');
