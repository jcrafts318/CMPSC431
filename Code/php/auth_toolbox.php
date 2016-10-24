<?php
/* File Name:           auth_toolbox.php
 * Description:         This file contains 'atomic' functions with respect to querying and error handling
 * Dependencies:        none
 * Additional Notes:    none
 */ 
     
// ===================== Function Definitions =====================     

function ThrowFatalError($message = "An unknown error has occured.") 
// PRE:  $message is a description of the error that has occurred
// POST: This function will cause the program to close itself after echoing an error message
{
	echo "Error : " . $message . " The program has been terminated.\n";
	if(!TESTING)
	{
		die();
	}
}

function ThrowMySqlDatabaseError($database, $query)
// PRE:  $database is an open database connection
//       $message is a description of the error that has occurred
// POST: This function will cause the program to close itself after echoing an error message
{
	echo "Database Error on query \"" . $query . "\"\nQuery Details: " . $database->info . "\nError Details:\n";
	echo json_encode($database->error_list) . "\n";
	if (!TESTING)
	{
		die();
	}
}

function ThrowInconvenientError($message = "An inconvenient error has occured.") 
// PRE:  $message is a description of the error that has occurred
// POST: This function will cause simply echo an error message, but unlike the above will not terminate the program
{
	echo "Error: " . $message . " Program flow will continue.\n";
}

function MySqlDatabaseConnection($host, $user, $password, $database)
// PRE:  $host, $user, $password, $database are credentials for
//       accessing some MySQL database
// POST: A database connection has been created and returned
{
	$database = new mysqli($host, $user, $password, $database);
    
	if ($database->connect_error)
	{
		ThrowFatalError("Could not connect to database.");
	}

	return $database;
}

function SanitizeString($string)
// PRE:  $string is some string to be entered into the database
// POST: FCTVAL == sanitized version of $string
{
	$string = preg_replace("/\'/", "\\\'", $string);
	$string = preg_replace("/\"/", "\\\"", $string);
	$string = preg_replace("/\;/", "\\\;", $string);
	$string = preg_replace("/DROP\s+(?:TABLE)|(?:DATABASE)/i", "", $string);
	$string = preg_replace("/CREATE\s+(?:TABLE)|(?:DATABASE)/i", "", $string);
	$string = preg_replace("/INSERT\s+INTO/i", "", $string);
	$string = preg_replace("/DELETE\s+FROM/i", "", $string);
	$string = preg_replace("/UPDATE[\s\S]+?SET/i", "", $string);
	$string = preg_replace("/ALTER\s+TABLE/i", "", $string);
	$string = preg_replace("/SELECT[\s\S]+?FROM/i", "", $string);
	return $string;
}

function MySqlDatabaseQuery($database, $query, $fail = FALSE)
// PRE:  $database is an open database connection
//       $query is a sanitized query to be sent to the database
//       $fail is a boolean that represents whether or not the query should throw a fatal error if it returns false;
//       it is initialized to false, meaning that no error is thrown
// POST: FCTVAL == the results of the query as an array, if output is needed, o.w. true or false depending on success
{
	if (($response = $database->query($query)) === FALSE && $fail)
	{
		ThrowMySqlDatabaseError($database, $query);
		return FALSE;
	}

	if ($response === TRUE || $response === FALSE)
	{
		return $response;
	}
	else
	{
		$output = array();
		while ($row = $response->fetch_assoc())
		{
			array_push($output, $row);
		}
		return $output;
	}
}

function MySqlMultiQuery($database, $query, $fail = FALSE)
// PRE:  $database is an open database connection
//       $query is a sanitized write query to be sent to the database (SELECT or any other kind of read query does not work with this function)
//       $fail is a boolean that represents whether or not the query should throw a fatal error if it returns false;
//       it is initialized to false, meaning that no error is thrown
// POST: FCTVAL == the results of the queries as an array of true/false values, with each representing the success of
//       each query in order
{
	$output = array();							// initialize empty output array
	$index = 0;								// index through query responses
	$response = $database->multi_query($query);				// query DB and set response to first query result
	do {
		if ($response === TRUE || $response === FALSE)			// if response is boolean, return response and
		{								// throw error if $fail is true and response is false
			array_push($output, $response);
			if ($response === FALSE && $fail)
			{
				ThrowMySqlDatabaseError($database, $query);
			}
		}
		else								// response is data
		{
			return FALSE;
		}
	} while ($response = $database->next_result());				// set response to next result of query

	return $output;
}

// ===================== Variable Declaration =====================
// These are global variables that describe our default values for data of the given types
define("DEFAULT_NUMBER", -1);
define("DEFAULT_STRING", "");
/*      EFFECTS OF TESTING == TRUE:
 * The ThrowFatalError doesn't kill the page
 */
define("TESTING", FALSE);
/*  EFFECTS OF EXTERNAL_ACCESS == TRUE:
 * All API calls are allowed to be accessed by non-server users
 */
define("EXTERNAL_ACCESS", FALSE);
?>
