<?php
/* File Name:           coconut_lib.php
 * Description:         This file contains application library functions directly called by client processes
 * Dependencies:        auth_lib.php, auth_toolbox.php
 * Additional Notes:    none
 */

require_once("auth_lib.php");

function GetTransactions($database, $userId)
{
	$output = new \stdClass;
	$output->asSeller = new \stdClass;
	$output->asCustomer = new \stdClass;
	$query = "SELECT T.transaction_id, T.item_id, T.cust_id, N.seller_id, N.name, T.payment_card, T.payment_exp, T.sale_price, T.payment_date, T.customer_rating, T.seller_rating, T.status, T.delivery_address, T.date_of_delivery, T.shipping_options FROM transactions T JOIN (SELECT L.item_id, L.seller_id, L.name FROM listings L JOIN (SELECT seller_id FROM sellers WHERE user_id='$userId') S ON L.seller_id=S.seller_id) N ON T.item_id=N.item_id";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		$output->asSeller->{$res['transaction_id']} = ParseTransaction($database, $res);
	}
	$query = "SELECT L.transaction_id, L.item_id, L.cust_id, N.seller_id, N.name, L.payment_card, L.payment_exp, L.sale_price, L.payment_date, L.customer_rating, L.seller_rating, L.status, L.delivery_address, L.date_of_delivery, L.shipping_options FROM listings N JOIN (SELECT T.transaction_id, T.item_id, T.cust_id, T.payment_card, T.payment_exp, T.sale_price, T.payment_date, T.customer_rating, T.seller_rating, T.status, T.delivery_address, T.date_of_delivery, T.shipping_options FROM transactions T JOIN (SELECT cust_id FROM customers WHERE user_id='$userId') C ON T.cust_id=C.cust_id) L ON L.item_id=N.item_id";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		$output->asCustomer->{$res['transaction_id']} = ParseTransaction($database, $res);
	}
	$output->totals = ParseTransactionTotals($output);
	$output->savedPayment = GetSavedPayment($database, $userId);
	return $output;
}

function GetSavedPayment($database, $userId)
{
	$query = "SELECT cust_id FROM customers WHERE user_id='$userId'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) == 0)
	{
		return [];
	}
	$output = new \stdClass;
	$custId = $result[0]['cust_id'];
	$query = "SELECT * FROM payment_info WHERE cust_id='$custId'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		$text = $res['card_number'] . ' exp. ' . $res['expiration'];
		$output->{$text} = new \stdClass;
		$output->{$text}->cardNumber = $res['card_number'];
		$output->{$text}->expiration = $res['expiration'];
		$output->{$text}->cvv = $res['security_code'];
	}
	return $output;
}

function ParseTransaction($database, $transaction)
{
	$output = new \stdClass;
	$output->name = $transaction['name'];
	$output->id = $transaction['transaction_id'];
	$output->itemId = $transaction['item_id'];
	$output->custId = $transaction['cust_id'];
	$output->sellerId = $transaction['seller_id'];
	$output->payment = new stdClass;
	$output->payment->card = $transaction['payment_card'];
	$output->payment->expires = $transaction['payment_exp'];
	$output->payment->datePaid = $transaction['payment_date'];
	$output->salePrice = $transaction['sale_price'];
	$output->rating = new \stdClass;
	$output->rating->customer = $transaction['customer_rating'];
	$output->rating->seller = $transaction['seller_rating'];
	$output->status = $transaction['status'];
	$output->delivery = new \stdClass;
	$output->delivery->address = $transaction['delivery_address'];
	$output->delivery->date = $transaction['date_of_delivery'];
	$output->delivery->shipOptions = $transaction['shipping_options'];
	return $output;
}

function ParseTransactionTotals($transactionObj)
{
	$output = new \stdClass;
	$output->asSeller = new \stdClass;
	$output->asSeller->grossSales = 0;
	$output->asSeller->itemsSold = 0;
	$output->asSeller->pendingSales = new \stdClass;
	$output->asSeller->pendingSales->count = 0;
	$output->asSeller->pendingSales->unpaid = [];
	$output->asSeller->pendingSales->paid = [];
	$output->asSeller->pendingSales->shipped = [];
	$output->asSeller->completedSales = [];
	foreach ($transactionObj->asSeller as $trans)
	{
		if ($trans->status != "unpaid")
		{
			$output->asSeller->grossSales += $trans->salePrice;
			$output->asSeller->itemsSold++;
		}
		if ($trans->status != "delivered")
		{
			$output->asSeller->pendingSales->count++;
			array_push($output->asSeller->pendingSales->{$trans->status}, $trans->id);
		}
		else
		{
			array_push($output->asSeller->completedSales, $trans->id);
		}
	}
	$output->asCustomer = new \stdClass;
	$output->asCustomer->grossReceipts = 0;
	$output->asCustomer->itemsBought = 0;
	$output->asCustomer->pendingReceipts = new \stdClass;
	$output->asCustomer->pendingReceipts->count = 0;
	$output->asCustomer->pendingReceipts->unpaid = [];
	$output->asCustomer->pendingReceipts->paid = [];
	$output->asCustomer->pendingReceipts->shipped = [];
	$output->asCustomer->completedReceipts = [];
	foreach ($transactionObj->asCustomer as $trans)
	{
		if ($trans->status != "unpaid")
		{
			$output->asCustomer->grossReceipts += $trans->salePrice;
			$output->asCustomer->itemsBought++;
		}
		if ($trans->status != "delivered")
		{
			$output->asCustomer->pendingReceipts->count++;
			array_push($output->asCustomer->pendingReceipts->{$trans->status}, $trans->id);
		}
		else
		{
			array_push($output->asCustomer->completedReceipts, $trans->id);
		}
	}
	return $output;
}

function GetComments($database, $listingId)
{
	$output = [];
	$query = "SELECT F.name, E.date, E.text FROM users F JOIN (SELECT user_id, date, text FROM comments WHERE item_id='$listingId') E ON F.user_id=E.user_id";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		$comment = new \stdClass;
		$comment->user = $res['name'];
		$comment->date = $res['date'];
		$comment->content =$res['text'];
		array_push($output, $comment);
	}
	return $output;
}

function AddComment($database, $itemId, $userId, $text)
{
	$date = date('Y-m-d H:i:s', time());
	$text = SanitizeString($text);
	$query = "INSERT INTO comments SET user_id='$userId', item_id='$itemId', text='$text', date='$date'";
	MySqlDatabaseQuery($database, $query);
}

function GetLocation($database, $locationId)
{
	$output = new \stdClass;
	$query = "SELECT * FROM addresses WHERE address_id='$locationId'";
	$result = MySqlDatabaseQuery($database, $query);
	$output->street = $result[0]['street'];
	$output->city = $result[0]['city'];
	$output->state = $result[0]['state'];
	$output->zip = $result[0]['zip'];
	return $output;
}

function GetListing($database, $listingId)
{
	$output = new \stdClass;

	$query = "SELECT * FROM listings WHERE item_id='$listingId'";
	$result = MySqlDatabaseQuery($database, $query);

	$output->active = $result[0]['active'];
	$output->id = $listingId;
	$output->name = $result[0]['name'];
	$output->type = $result[0]['list_type'];
	$output->category = $result[0]['category'];
	$output->rating = $result[0]['avg_rating'];
	$output->numRatings = $result[0]['num_ratings'];
	$output->location = GetLocation($database, $result[0]['location_id']);
	$sellerId = $result[0]['seller_id'];
	if ($output->type == "sale" || $output->type == "dual")
	{
		$output->listPrice = $result[0]['list_price'];
	}
	if ($output->type == "auction" || $output->type == "dual")
	{
		$output->reservePrice = $result[0]['reserve_price'];
		$output->endTime = $result[0]['end_time'];
		$query = "SELECT C.max_bid, C.num_bids, D.cust_id, D.time FROM (SELECT * FROM bidded_on WHERE item_id='$listingId') D JOIN (SELECT MAX(B.amount) AS max_bid, COUNT(B.amount) AS num_bids FROM (SELECT amount FROM bidded_on WHERE item_id='$listingId') B) C ON D.amount = C.max_bid";
		$result = MySqlDatabaseQuery($database, $query);
		$output->bids = new \stdClass;
		if (count($result) == 0)
		{
			$output->bids = "none";
		}
		else
		{
			$output->bids->count = $result[0]['num_bids'];
			$output->bids->highBidder = new \stdClass;
			$output->bids->highBidder->id = $result[0]['cust_id'];
			$output->bids->highBidder->bid = $result[0]['max_bid'];
			$output->bids->highBidder->time = $result[0]['time'];
			$custId = $result[0]['cust_id'];
			$query = "SELECT U.name FROM users U JOIN (SELECT user_id FROM customers WHERE cust_id='$custId') D ON D.user_id = U.user_id";
			$result = MySqlDatabaseQuery($database, $query);
			$output->bids->highBidder->name = $result[0]['name'];
		}
	}
	$output->seller = new \stdClass;
	$query = "SELECT U.name FROM users U JOIN (SELECT user_id FROM sellers WHERE seller_id='$sellerId') D ON D.user_id = U.user_id";
	$result = MySqlDatabaseQuery($database, $query);
	$output->seller->id = $sellerId;
	$output->seller->name = $result[0]['name'];
	$query = "SELECT COUNT(*) FROM comments WHERE item_id='$listingId'";
	$result = MySqlDatabaseQuery($database, $query);
	$output->commentCount = $result[0]['COUNT(*)'];
	return $output;
}

function GetWatchListIds($database, $custId)
{
	$output = [];
	$query = "SELECT item_id FROM watch_list WHERE cust_id='$custId'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		array_push($output, $res['item_id']);
	}
	return $output;
}

function GetShoppingCartIds($database, $custId)
{
	$output = [];
	$query = "SELECT item_id FROM shopping_cart WHERE cust_id='$custId'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		array_push($output, $res['item_id']);
	}
	return $output;
}

function GetListingIds($database, $category, $searchTerms = "", $listType = 7, $sellerId = 0, $inactive = false)
// PRE:  $database is an open database connection
//       $listType is an integer between 0 and 7
//       $sellerId is a seller id for the desired result set
//       $category is a category for which matches in the underlying subtree should be returned
//       $searchTerms is a string of search terms separated by |
//       $inactive is a bool that says whether inactive results are returned
// POST: FCTVAL == a list of item_ids for the listing result set, keyed by the number of points
//       for each listing, determined by the number of occurrences of any one search term in the
//       name or category of a listing
{
	// set up list type filtering
	$listTypeClause = "";
	$listTypes = [];
	if ($listType & 1)
	{
		array_push($listTypes, "sale");
	}
	if ($listType & 2)
	{
		array_push($listTypes, "auction");
	}
	if ($listType & 4)
	{
		array_push($listTypes, "dual");
	}
	for ($i = 0; $i < count($listTypes); $i++)
	{
		$listTypeClause .= "list_type='" . $listTypes[$i] . "' ";
		if ($i < count($listTypes)-1)
		{
			$listTypeClause .= "OR ";
		}
	}
	// create sellerId portion of search query
	$sellerIdClause = "";
	if ($sellerId > 0)
	{
		$sellerIdClause .= "seller_id='$sellerId' AND ";
	}
	// get all subcategories of browsing category
	$categories = FlattenKeys(GetCategorySubtree($database, $category));
	array_push($categories, $category);
	$categoryClause = "";
	// create category portion of search query
	for ($i = 0; $i < count($categories); $i++)
	{
		$categoryClause .= "category='" . $categories[$i] . "' ";
		if ($i < count($categories)-1)
		{
			$categoryClause .= "OR ";
		}
	}
	// prep result object
	$listings = new \stdClass;
	// get search terms as array; no search term will result in single empty string as search
	// term and return full result set
	$searchTerms = preg_split('/\|/', $searchTerms);
	// get active clause
	if ($inactive)
	{
		$activeClause = "";
	}
	else
	{
		$activeClause = " AND active=1";
	}
	// get result set
	foreach ($searchTerms as $term)
	{
		$term = SanitizeString($term);
		// select listings where search terms appear in name
		$query = "SELECT item_id FROM listings WHERE " . $sellerIdClause . "(" . $listTypeClause . ") AND name LIKE '%$term%' AND (" . $categoryClause . ")" . $activeClause;
		$result = MySqlDatabaseQuery($database, $query);
		foreach ($result as $res)
		{
			// count occurrences of each id in each result set
			if (!property_exists($listings, $res['item_id']))
			{
				$listings->{$res['item_id']} = 1;
			}
			else
			{
				$listings->{$res['item_id']} += 1;
			}
		}
		// select listings where search terms appear in category name
		$query = "SELECT item_id FROM listings WHERE " . $sellerIdClause . "(" . $listTypeClause . ") AND category LIKE '%$term%' AND (" . $categoryClause . ")" . $activeClause;
		$result = MySqlDatabaseQuery($database, $query);
		foreach ($result as $res)
		{
			// count occurrences of each id in each result set
			if (!property_exists($listings, $res['item_id']))
			{
				$listings->{$res['item_id']} = 1;
			}
			else
			{
				$listings->{$res['item_id']} += 1;
			}
		}
	}
	// prep output object
	$ranking = new \stdClass;
	$max = 0;	// max rank
	$count = 0;	// number of individual results
	foreach ($listings as $id=>$points)
	{
		if ($points > $max)
		{
			$max = $points;
		}
		if (!property_exists($ranking, $points))
		{
			$ranking->{$points} = [];
		}
		array_push($ranking->{$points}, $id);
		$count++;
	}
	$ranking->max = $max;
	$ranking->count = $count;
	return $ranking;
}

function NewListing($database, $email, $name, $listType, $category, $listPrice, $reservePrice, $duration)
// PRE:  $database is an open database connection
//       $email is the email of the seller adding this listing
//       $listType is 1, 2, or 3 (direct sale, auction, or both)
//       $category is the category for this item
//       $listPrice is the sale price for the item
//       $reservePrice is the reserve price for the item
//       $duration is the duration of the listing in minutes
//       all fields have been validated
// POST: a new listing along the specified arguments is added to the seller's listings
{
	$email = SanitizeString($email);
	$name = SanitizeString($name);
	$category = SanitizeString($category);
	$query = "SELECT E.seller_id, F.address_id FROM users F JOIN sellers E ON F.user_id = E.user_id WHERE F.email = '$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$seller = $result[0]['seller_id'];
	$addressId = $result[0]['address_id'];
	$endTime = date('Y-m-d H:i:s', time() + $duration*60);
	$query = "INSERT INTO listings SET seller_id='$seller', list_type='$listType', " .
		"category='$category', list_price='$listPrice', reserve_price='$reservePrice', " .
		"end_time='$endTime', location_id='$addressId', name='$name', active=1, " .
		"avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}

function GetParentCategory($database, $category)
// PRE:  $database is an open database connection
//       $category is the name of a category which is not 'All'
// POST: FCTVAL == json encoding of an array of categories which are children of $parent
{
	$query = "SELECT parent FROM categories WHERE name='$category'";
	$result = MySqlDatabaseQuery($database, $query);

	return $result[0]['parent'];
}

function GetCategories($database, $parent)
// PRE:  $database is an open database connection
//       $parent is the name of a category (base category being 'All')
// POST: FCTVAL == json encoding of an array of categories which are children of $parent
{
	$output = array();
	if ($parent == "")
	{
		$query = "SELECT name FROM categories";
		$result = MySqlDatabaseQuery($database, $query);
		foreach ($result as $res)
		{
			array_push($output, $res['name']);
		}
		return $output;
	}
	$parent = SanitizeString($parent);
	$query = "SELECT name FROM categories WHERE parent='$parent'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		array_push($output, $res['name']);
	}
	return $output;
}

function GetCategorySubtree($database, $parent)
// PRE:  $database is an open database connection
//       $parent is the name of a category to get the descendents of
// POST: FCTVAL == an object containing the descendents and structure of $parent
{
	$tree = new \stdClass;
	$categories = GetCategories($database, $parent);
	foreach ($categories as $category)
	{
		$tree->{$category} = GetCategorySubtree($database, $category);
	}
	return $tree;
}

function FlattenKeys($object)
// PRE:  $object is a tree
// POST: FCTVAL == an array containing all keys of $object at all levels as elements
{
	$flat = [];
	$flat = FlattenTree($object, $flat);
	return $flat;
}

function FlattenTree($object, $flat)
// PRE:  $object is a tree
//       $flat is an array, which may contain previously added keys
// POST: FCTVAL == $flat, with keys of $object at all levels added as elements
{
	foreach ($object as $key=>$subtree)
	{
		array_push($flat, SanitizeString($key));
		$flat = FlattenTree($subtree, $flat);
	}
	return $flat;
}

function EndAuctions($database)
{
	$date = date('Y-m-d H:i:s', time());
	$query = "UPDATE listings SET active=0 WHERE (list_type='dual' OR list_type='auction') AND end_time < '$date'";
	MySqlDatabaseQuery($database, $query);
}

function UserData($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: FCTVAL == json encoding of an object with all data relevant to this user profile not explicitly associated
//       with a customer or seller (comments, address, dob, phone, etc.)
{
	EndAuctions($database);
	$output = new \stdClass;
	$query = "SELECT E.user_id, E.name, E.dob, E.phone, A.street, A.city, A.state, A.zip FROM users E JOIN addresses A ON E.address_id = A.address_id WHERE E.email='$email'";
	$result = MySqlDatabaseQuery($database, $query);

	$output->id = $result[0]['user_id'];
	$output->name = $result[0]['name'];
	$output->email = $email;
	$output->dob = $result[0]['dob'];
	$output->address = new \stdClass;
	$output->address->street = $result[0]['street'];
	$output->address->city = $result[0]['city'];
	$output->address->state = $result[0]['state'];
	$output->address->zip = $result[0]['zip'];
	$output->phone = $result[0]['phone'];

	return $output;
}

function HasSeller($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: FCTVAL == json encoding of an object with a "retval" indicating if a seller record exists for this user,
//       and relevant data accompanying that if the record exists
{
	$output = new \stdClass;
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "SELECT seller_id, avg_rating, num_ratings FROM sellers WHERE user_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		$output->retval = true;
		$output->rating = $result[0]['avg_rating'];
		$output->num_ratings = $result[0]['num_ratings'];
		$id = $result[0]['seller_id'];
		$output->id = $id;
		$query = "SELECT COUNT(*) FROM listings WHERE seller_id='$id' AND active=1";
		$result = MySqlDatabaseQuery($database, $query);
		$output->num_listings = $result[0]['COUNT(*)'];
	}
	else
	{
		$output->retval = false;
	}
	return $output;
}

function HasCustomer($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: FCTVAL == json encoding of an object with a "retval" indicating if a customer record exists for this user,
//       and relevant data accompanying that if the record exists
{
	$output = new \stdClass;
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "SELECT cust_id, avg_rating, num_ratings FROM customers WHERE user_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) > 0)
	{
		$output->retval = true;
		$output->rating = $result[0]['avg_rating'];
		$output->num_ratings = $result[0]['num_ratings'];
		$id = $result[0]['cust_id'];
		$output->id = $id;
		$query = "SELECT COUNT(*) FROM watch_list WHERE cust_id='$id'";
		$result = MySqlDatabaseQuery($database, $query);
		$output->num_watched = $result[0]['COUNT(*)'];
		$output->watch = GetWatchList($database, $id);
		$query = "SELECT COUNT(*) FROM shopping_cart WHERE cust_id='$id'";
		$result = MySqlDatabaseQuery($database, $query);
		$output->num_carted = $result[0]['COUNT(*)'];
		$output->cart = GetShoppingCart($database, $id);
	}
	else
	{
		$output->retval = false;
	}
	return $output;
}

function GetWatchList($database, $id)
{
	$output = [];
	$query = "SELECT item_id FROM watch_list WHERE cust_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		array_push($output, $res['item_id']);
	}
	return $output;
}

function GetShoppingCart($database, $id)
{
	$output = [];
	$query = "SELECT item_id FROM shopping_cart WHERE cust_id='$id'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		array_push($output, $res['item_id']);
	}
	return $output;
}

function AddToWatchList($database, $custId, $listingId)
{
	$query = "INSERT INTO watch_list SET cust_id='$custId', item_id='$listingId'";
	MySqlDatabaseQuery($database, $query);
}

function AddToShoppingCart($database, $custId, $listingId)
{
	$query = "INSERT INTO shopping_cart SET cust_id='$custId', item_id='$listingId'";
	MySqlDatabaseQuery($database, $query);
}

function PlaceBid($database, $custId, $listingId)
{
	$listing = GetListing($database, $listingId);
	if ($listing->bids == "none")
	{
		$highBid = 0;
	}
	else
	{
		$highBid = $listing->bids->highBidder->bid;
	}
	$newBid = $highBid + 5;
	$time = date('Y-m-d H:i:s', time());
	$query = "SELECT active FROM listings WHERE item_id='$listingId'";
	$result = MySqlDatabaseQuery($database, $query);
	if ($result[0]['active'] == 0)
	{
		return "false";
	}
	$query = "INSERT INTO bidded_on SET cust_id='$custId', item_id='$listingId', amount='$newBid', time='$time'";
	MySqlDatabaseQuery($database, $query);
	$query = "INSERT INTO watch_list SET cust_id='$custId', item_id='$listingId'";
	MySqlDatabaseQuery($database, $query);
	return "true";
}

function NewTransaction($database, $custId, $itemId, $salePrice)
{
	$query = "SELECT U.address_id FROM users U JOIN (SELECT user_id FROM customers WHERE cust_id='$custId') C ON U.user_id = C.user_id";
	$result = MySqlDatabaseQuery($database, $query);
	$addressId = $result[0]['address_id'];
	$query = "INSERT INTO transactions SET cust_id='$custId', item_id='$itemId', sale_price='$salePrice', status='unpaid', delivery_address='$addressId'";
	MySqlDatabaseQuery($database, $query);
}

function Checkout($database, $custId)
{
	$query = "SELECT item_id FROM shopping_cart WHERE cust_id='$custId'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		$id = $res['item_id'];
		$listing = GetListing($database, $id);
		NewTransaction($database, $custId, $res['item_id'], $listing->listPrice);
		$query = "DELETE FROM shopping_cart WHERE cust_id='$custId' AND item_id='$id'";
		MySqlDatabaseQuery($database, $query);
	}
}

function ClearWatchList($database, $custId)
{
	$query = "SELECT item_id FROM watch_list WHERE cust_id='$custId'";
	$result = MySqlDatabaseQuery($database, $query);
	foreach ($result as $res)
	{
		$id = $res['item_id'];
		$listing = GetListing($database, $id);
		if ($listing->active == "0" && $listing->bids != "none" && $listing->bids->highBidder->id == $custId && $listing->bids->highBidder->bid >= $listing->reservePrice)
		{
			NewTransaction($database, $custId, $res['item_id'], $listing->bids->highBidder->bid);
		}
		if ($listing->active == "0")
		{
			$query = "DELETE FROM watch_list WHERE cust_id='$custId' AND item_id='$id'";
			MySqlDatabaseQuery($database, $query);
		}
	}
}

function MakePayment($database, $cardNum, $exp, $cvv, $custId)
{
	$query = "SELECT * FROM payment_info WHERE cust_id='$custId' AND card_number='$cardNum' AND expiration='$exp'";
	$result = MySqlDatabaseQuery($database, $query);
	if (count($result) == 0)
	{
		$query = "SELECT U.address_id, U.name FROM users U JOIN (SELECT user_id FROM customers WHERE cust_id='$custId') C ON U.user_id=C.user_id";
		$result = MySqlDatabaseQuery($database, $query);
		$address = $result[0]['address_id'];
		$name = $result[0]['name'];
		$query = "INSERT INTO payment_info SET cust_id='$custId', card_number='$cardNum', expiration='$exp', security_code='$cvv', address_id='$address', name='$name'";
		MySqlDatabaseQuery($database, $query);
	}
	$date = date('Y-m-d', time());
	$query = "UPDATE transactions SET status='paid', payment_date='$date', payment_card='$cardNum', payment_exp='$exp' WHERE status='unpaid'";
	MySqlDatabaseQuery($database, $query);
}

function MarkAsShipped($database, $transactionId)
{
	$query = "UPDATE transactions SET status='shipped' WHERE transaction_id='$transactionId'";
	MySqlDatabaseQuery($database, $query);
}

function MarkAsDelivered($database, $transactionId)
{
	$date = date('Y-m-d', time());
	$query = "UPDATE transactions SET status='delivered', date_of_delivery='$date' WHERE transaction_id='$transactionId'";
	MySqlDatabaseQuery($database, $query);
}

function RateAsCustomer($database, $rating, $transactionId)
{
	$query = "SELECT L.seller_id, T.cust_id, T.item_id FROM listings L JOIN transactions T ON L.item_id=T.item_id";
	$result = MySqlDatabaseQuery($database, $query);
	$seller = $result[0]['seller_id'];
	$item = $result[0]['item_id'];
	$query = "UPDATE transactions SET customer_rating='$rating' WHERE transaction_id='$transactionId'";
	MySqlDatabaseQuery($database, $query);
	$query = "SELECT avg_rating, num_ratings FROM sellers WHERE seller_id='$seller'";
	$result = MySqlDatabaseQuery($database, $query);
	$numRatings = $result[0]['num_ratings'] + 1;
	$newRating = (($result[0]['avg_rating']*$result[0]['num_ratings'])+$rating)/$numRatings;
	$query = "UPDATE sellers SET avg_rating='$newRating', num_ratings='$numRatings' WHERE seller_id='$seller'";
	MySqlDatabaseQuery($database, $query);
	$query = "SELECT avg_rating, num_ratings FROM listings WHERE item_id='$item'";
	$result = MySqlDatabaseQuery($database, $query);
	$numRatings = $result[0]['num_ratings'] + 1;
	$newRating = (($result[0]['avg_rating']*$result[0]['num_ratings'])+$rating)/$numRatings;
	$query = "UPDATE listings SET avg_rating='$newRating', num_ratings='$numRatings' WHERE item_id='$item'";
	MySqlDatabaseQuery($database, $query);
}

function RateAsSeller($database, $rating, $transactionId)
{
	$query = "SELECT L.seller_id, T.cust_id, T.item_id FROM listings L JOIN transactions T ON L.item_id=T.item_id";
	$result = MySqlDatabaseQuery($database, $query);
	$customer = $result[0]['cust_id'];
	$item = $result[0]['item_id'];
	$query = "UPDATE transactions SET seller_rating='$rating' WHERE transaction_id='$transactionId'";
	MySqlDatabaseQuery($database, $query);
	$query = "SELECT avg_rating, num_ratings FROM customers WHERE cust_id='$customer'";
	$result = MySqlDatabaseQuery($database, $query);
	$numRatings = $result[0]['num_ratings'] + 1;
	$newRating = (($result[0]['avg_rating']*$result[0]['num_ratings'])+$rating)/$numRatings;
	$query = "UPDATE customers SET avg_rating='$newRating', num_ratings='$numRatings' WHERE cust_id='$customer'";
	MySqlDatabaseQuery($database, $query);
}

function CreateSeller($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: a seller record is created for this user
{
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "INSERT INTO sellers SET user_id='$id', avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}

function CreateCustomer($database, $email)
// PRE:  $database is an open database connection
//       $email is the email address of a user
// POST: a customer record is created for this user
{
	$query = "SELECT user_id FROM users WHERE email='$email'";
	$result = MySqlDatabaseQuery($database, $query);
	$id = $result[0]['user_id'];
	$query = "INSERT INTO customers SET user_id='$id', royalty_points=0, royalty_days_remaining=0, avg_rating=0, num_ratings=0";
	MySqlDatabaseQuery($database, $query);
}
?>
