// File Name:           script.js
// Description:         This file contains the runtime script for index.html
// Dependencies:        all php files, d3.js
// Additional Notes:    none

/*
	RUNTIME CODE
 */

var loggedIn = false;
var seller = {retval:false};
var customer = {retval:false};
var user = {};
var args = GetPageArgs();
var categories = {};
var parentCategory = "";
var listings = {};
var transactions = {};
PageInit();

/*
	PAGE SETUP SCRIPTS
 */

function PageInit()
// POST: checks if a user is logged in, then renders the appropriate page
{
	if (!('cat' in args))
	{
		args.cat = 'All';
	}
	args.cat = decodeURIComponent(args.cat).replace('%27','\'');
	if (args.page == 'add_listing')
	{
		args.cat = '';
	}
	$.when(Categories()).done(function(cat){
		categories = cat;
	});
	$.when(ParentCategory()).done(function(parent){
		parentCategory = parent;
	});
	$.when(Authenticate()).done(function(retval)
	{
		if (retval === "true")
		{
			loggedIn = true;
			$.when(HasSeller()).done(function(sellerData)
			{
				if (sellerData.retval)
				{
					seller = sellerData;
				}
			});
			$.when(HasCustomer()).done(function(customerData)
			{
				if (customerData.retval)
				{
					customer = customerData;
				}
			});
			$.when(UserData()).done(function(userData)
			{
				user = userData;
			});
		}
		// render page after it is known if customers or sellers are attached to this user
		$(document).ajaxStop(function()
		{
    			$(this).unbind("ajaxStop");
			RenderPage();
			RenderToolbar();
		});
	});
}

function RenderPage()
// PRE:  Document must be ready, must be called in an async block from PageInit(), which checks if a user is
//       logged in and pulls relevant data. IF THIS IS NOT CALLED ASYNC THE USER WILL NEVER BE LOGGED IN.
// POST: Page specified by page args is rendered based on if a user is logged in, and what the user is doing
{
	if (!('page' in args))
	{
		args.page = "front";
	}
	switch (args.page)
	{
		case "front":
			PageFront();
			break;
		case "search":
			PageSearch();
			break;
		case "shopping_cart":
			PageCart();
			break;
		case "watch_list":
			PageWatchList();
			break;
		case "my_transactions":
			PageMyTransactions();
			break;
		case "home":
			PageHome();
			break;
		case "my_listings":
			PageMyListings();
			break;
		case "add_listing":
			PageAddListing();
			break;
		case "connect_error":
			PageConnectError();
			break;
		case "login_error":
			PageLoginError();
			break;
		case "register_error":
			PageRegisterError();
			break;
		case "session_error":
			PageSessionError();
			break;
		case "user_created":
			PageUserCreated();
			break;
		default:
			Page404Error();
	}
}

function RenderToolbar()
// PRE:  Called from PageInit()
// POST: Toolbar is rendered on top of page, depending on context
{
	var toolbar = "";
	if (loggedIn)
	{
		toolbar += LogoutButton();
		toolbar += MyAccountButton();
		if (seller.retval)
		{
			toolbar += MyListingsButton(seller.num_listings);
		}
		if (customer.retval)
		{
			toolbar += WatchListButton(customer.num_watched);
			toolbar += ShoppingCartButton(customer.num_carted);
		}
		if (seller.retval || customer.retval)
		{
			toolbar += MyTransactionsButton();
		}
	}
	else
	{
		toolbar += LoginRegisterButton();
	}
	toolbar += FrontButton();
	toolbar += SearchButton();
	
	document.getElementById("toolbar").innerHTML = toolbar;
}

function GetPageArgs()
// PRE:  page is the name of the page you're on (i.e. {{page}}.html) and there are some arguments associated
//       with this page with the following syntax: /index.html#arg1=foo&arg2=bar
// POST: FCTVAL == an object where each property is the name of an argument and its value is the argument's
//       value as specified in the URL (e.g. {arg1:foo,arg2:bar} in the above example)
{
	var queryString = "\#(.*)";
	var query = new RegExp(queryString).exec(window.location.hash);
	args = {};
	if (query != null)
	{
		query = query[1].split("&");
		for (var i in query)
		{
			query[i] = query[i].split("=");
			args[query[i][0]] = query[i][1];
		}
	}
	return args;
}

function Redirect(page, addlArgs)
// PRE:  page is the name of a page (does not contain '=' or '&' or characters invalid in url strings)
//       addlArgs is a string of the form '&arg1=foo&arg2=bar [...]' which can be appended on the end of the
//       url if more arguments must be specified
// POST: page is reloaded on page {{page}} with arguments {{addlArgs}}
{
	window.location='index.html#page=' + page + addlArgs;
	window.location.reload();
}

function UpCategory(page, addlArgs)
// PRE:  page is the name of a page (does not contain '=' or '&' or characters invalid in url strings)
//       addlArgs is a string of the form '&arg1=foo&arg2=bar [...]' which can be appended on the end of the
//       url if more arguments must be specified
// POST: redirection is made to the supplied page with arguments specified and the category which is the parent of the
//       currently selected category
{
	Redirect(page, addlArgs + "&cat=" + parentCategory);
}

function SubmitSearch()
{
	var search = document.getElementById("search").value.replace(' ', '|');
	Redirect("front", "&search=" + search);
}

/*
	PAGE RENDER SCRIPTS
 */

function PageFront()
// POST: Renders front page page
{
	SidebarBodyContainer();
	PopulateCategories(categories);
	GetListingsData();
	$(document).ajaxStop(function()
	{
    		$(this).unbind("ajaxStop");
		PopulateListingsFront();
	});
}

function PageSearch()
{
	SidebarBodyContainer();
	document.getElementById("middle").innerHTML = '<textarea id="search" rows="1" cols="50"></textarea></br><button onclick="SubmitSearch()">Search</button>';
}

function PageCart()
{
	SidebarBodyContainer();
	GetShoppingCart();
	$(document).ajaxStop(function()
	{
    		$(this).unbind("ajaxStop");
		PopulateListingsFront();
	});
	document.getElementById("right-sidebar").innerHTML = '</br></br>' + CheckoutButton();
}

function PageWatchList()
{
	SidebarBodyContainer();
	GetWatchList();
	$(document).ajaxStop(function()
	{
    		$(this).unbind("ajaxStop");
		PopulateListingsFront();
	});
	document.getElementById("right-sidebar").innerHTML = '</br></br>' + ClearWatchListButton();
}

function PageMyTransactions()
{
	SidebarBodyContainer();
	$.when(GetTransactions()).done(function(data)
	{
		transactions = data;
		PopulateTransactions();
	});
}

function PageHome()
// POST: Renders home page
{
	TwoColumnContainer();
	if (loggedIn)
	{
		UserDashboard();
	}
	else
	{
		RegisterLoginPrompt();
	}
}

function PageMyListings()
// PRE:  Logged in user is a seller
// POST: Listings of logged in user are displayed
{
	SidebarBodyContainer();
	args.seller = seller.id;
	GetListingsData();
	$(document).ajaxStop(function()
	{
    		$(this).unbind("ajaxStop");
		PopulateListingsFront();
	});
	document.getElementById("right-sidebar").innerHTML = '</br></br>' + AddListingButton();
}

function PageAddListing()
// PRE:  Logged in user is a seller
// POST: Form for adding a listing is displayed
{
	SidebarBodyContainer();
	document.getElementById("middle").innerHTML =
		'<p>Listing Type</p><select id="list-type" onchange="AddListingForm()"><option value="" disabled="disabled" selected="selected">Listing Type</option>' +
		'<option value="1">Direct Sale</option>' +
		'<option value="2">Auction</option>' +
		'<option value="3">Both</option></select>' +
		'<div id="form"></div>'
}

function PageUserCreated()
// POST: Renders user created page
{
	document.getElementById("container").innerHTML = '<h2 class="prompt">You have successfully created a new user account! This page will redirect to the login page in 5 seconds, and you can log in to your new account, then register a seller or customer account!</h2>';
	setTimeout(function(){Redirect("home","");}, 5000);
}

function PageConnectError()
// POST: Renders connection error page
{
	document.getElementById("container").innerHTML = '<h2 class="prompt">There was an error connecting to the server. Please <a onclick=\'Redirect("home","");\' href="index.html#page=home">try again</a> in a few minutes. If you continue to have issues logging in, please contact the administrator at <a href="mailto@captain@coconu.ts">captain@coconu.ts</a>.</h2>';
}

function PageLoginError()
// POST: Renders login error page
{
	document.getElementById("container").innerHTML = '<h2 class="prompt">We were unable to log you in using the credentials you\'ve provided. Are you sure you put in the right username/password? <a onclick=\'Redirect("home","");\' href="index.html#page=home">Try again.</a></h2>';
}

function PageRegisterError()
// POST: Renders register error page
{
	document.getElementById("container").innerHTML = '<h2 class="prompt">There was an error registering your account. Make sure you are using the correct formats for each login field. Also make sure that both password fields are the same, and that your password is at least 10 characters long. Please <a onclick=\'Redirect("home","");\' href="index.html#page=home">try again.</a></h2>';
}

function PageSessionError()
// POST: Renders session error page
{
	document.getElementById("container").innerHTML = '<h2 class="prompt">Session Error: An error occured and you were logged out. Please try <a onclick=\'Redirect("home","");\' href="index.html#page=home">logging in again</a>.</h2>';
}

function Page404Error()
// POST: Renders 404 error page
{
	document.getElementById("container").innerHTML = '<h2 class="prompt">404: Page not found. Please try locating this resource again from the <a onclick=\'Redirect("front","");\' href="index.html#page=front">homepage</a>.</h2>';
}

/*
	MARKUP
 */

function TwoColumnContainer()
// PRE:  Document is loaded (taken care of HTML side by loading script at end of body)
// POST: #container div is filled with 2 column divs, a header above it, and a footer below it
{
	document.getElementById("container").innerHTML =
		// header div
		'<div id="header"></div>' +
		// left div
		'<div id="left"></div>' +
		// right div
		'<div id="right"></div>' +
		// footer div
		'<div id="footer"></div>';
}

function SidebarBodyContainer()
// PRE:  Document is loaded (taken care of HTML side by loading script at end of body)
// POST: #container div is filled with 2 sidebar divs, with a middle body div
{
	document.getElementById("container").innerHTML =
		// header div
		'<div id="left-sidebar"></div>' +
		// left div
		'<div id="middle"></div>' +
		// right div
		'<div id="right-sidebar"></div>';
}

function AddListingForm()
// PRE:  SidebarBodyContainer is called, a valid option is selected from the list-type dropdown box
// POST: Form is generated to add a new listing
{
	var form = document.getElementById("form");
	switch (document.getElementById("list-type").value)
	{
		case "1":
			form.innerHTML = '<form enctype="multipart/form-data" action="php/new_sale_listing.php" method="POST">' + 
				'<p>Category</p><select id="category-select" name="category"><option value="" disabled="disabled" selected="selected">Category</option></select></br>' +
				'<p>Listing Name</p><input type="text" name="name" required/></br>' +
				'<p>Price</p><input type="text" name="list_price" required/></br></br>' +
				'<input type="submit" value="Submit" /></form>';
			break;
		case "2":
			form.innerHTML = '<form enctype="multipart/form-data" action="php/new_auction_listing.php" method="POST">' + 
				'<p>Category</p><select id="category-select" name="category"><option value="" disabled="disabled" selected="selected">Category</option></select></br>' +
				'<p>Listing Name</p><input type="text" name="name" required/></br>' +
				'<p>Reserve Price</p><input type="text" name="reserve_price" required/></br>' +
				'<p>Listing Duration</p><input type="number" name="duration" required/>' +
				'<select name="time-units"><option value="" disabled="disabled" selected="selected">Time Unit</option>' +
				'<option value="minutes">minutes</option>' +
				'<option value="hours">hours</option>' +
				'<option value="days">days</option></select></br></br>' +
				'<input type="submit" value="Submit" /></form>';
			break;
		case "3":
			form.innerHTML = '<form enctype="multipart/form-data" action="php/new_dual_listing.php" method="POST">' + 
				'<p>Category</p><select id="category-select" name="category"><option value="" disabled="disabled" selected="selected">Category</option></select></br>' +
				'<p>Listing Name</p><input type="text" name="name" required/></br>' +
				'<p>Sale Price</p><input type="text" name="list_price" required/></br>' +
				'<p>Reserve Price</p><input type="text" name="reserve_price" required/></br>' +
				'<p>Listing Duration</p><input type="number" name="duration" required min="1" max="59"/>' +
				'<select name="time-units"><option value="" disabled="disabled" selected="selected">Time Unit</option>' +
				'<option value="minutes">minutes</option>' +
				'<option value="hours">hours</option>' +
				'<option value="days">days</option></select></br></br>' +
				'<input type="submit" value="Submit" /></form>';
			break;
		default:			
	}
	for (var i in categories)
	{
		var option = document.createElement("option");
		option.text = categories[i];
		option.value = categories[i];
		document.getElementById("category-select").add(option);
	}
}

function RegisterLoginPrompt()
// PRE:  TwoColumnContainer is called
// POST: Register/login prompt is displayed
{
	// header
	document.getElementById("header").innerHTML =
		'<h2 class="padding-top">Please log in or register to begin</h2>';
	// login form
	document.getElementById("left").innerHTML = 
		'<h2>Log In</h2><form enctype="multipart/form-data" action="php/login.php" method="POST">' + 
		'<p>Email Address</p><input type="text" name="email" required/>' +
		'<p>Password</p><input type="password" name="password" required/></br>' +
		'<input type="submit" value="Log In" /></form>';
	// register form
	document.getElementById("right").innerHTML = 
		'<h2>Register</h2><form enctype="multipart/form-data" action="php/new_user.php" method="POST">' + 
		'<p>Email Address</p><input type="text" name="email" required/>' +
		'<p>Name</p><input type="text" name="name" required/>' +
		'<p>Date of Birth</p><input type="text" name="dob" required/>' +
		'<p>Phone Number</p><input type="text" name="phone" required/>' +
		'<p>Street Address</p><input type="text" name="street" required/>' +
		'<p>City</p><input type="text" name="city" required/>' +
		'<p>State</p><input type="text" name="state" required/>' +
		'<p>Zip Code</p><input type="text" name="zip" required/>' +
		'<p>Password</p><input type="password" name="register_password" required/>' +
		'<p>Confirm Password</p><input type="password" name="confirm_password" required/></br>' +
		'<input type="submit" value="Register" /></form></br></br>';
	// empty footer
	document.getElementById("footer").innerHTML = '';
}

function UserDashboard()
// PRE:  User is logged in
// POST: Customer and Seller Dashboard is displayed
{
	// header
	document.getElementById("header").innerHTML =
		'<h2 class="padding-top">User Dashboard</h2>';
	DisplayCustomer();
	DisplaySeller();
	document.getElementById("footer").innerHTML = 
		'<p>Email Address: ' + user.email + '</p>' +
		'<p>Name: ' + user.name + '</p>' +
		'<p>Date of Birth: ' + user.dob + '</p>' +
		'<p>Address: ' + user.address.street + ', ' + user.address.city + ', ' + user.address.state + ' ' + user.address.zip + '</p>' +
		'<p>Phone Number: ' + user.phone + '</p>';
}

function DisplayCustomer()
// PRE:  TwoColumnContainer is called, user is logged in 
// POST: Either customer data or a customer registration is populated in the .left div, depending on if the logged in user has a customer registered or not
{
	if (customer.retval)
	{
		CustomerDashboard(customer);
	}
	else
	{
		CustomerRegistration();
	}
}

function DisplaySeller()
// PRE:  TwoColumnContainer is called, user is logged in 
// POST: Either seller data or a seller registration is populated in the .right div, depending on if the logged in user has a seller registered or not
{
	if (seller.retval)
	{
		SellerDashboard(seller);
	}
	else
	{
		SellerRegistration();
	}
}

function CustomerDashboard(data)
// PRE:  TwoColumnContainer is called, user is logged in, user has a customer account registered
// POST: Customer data and options are populated on the page in the .left div
{
	document.getElementById("left").innerHTML = 
		'<h2>Customer Account</h2></br>' +
		'<p>Customer Rating : ' + Number(data.rating).toPrecision(2) + ' from ' + data.num_ratings + ' ratings</p>' +
		ShoppingCartButton(data.num_carted) + '</br>' +
		WatchListButton(data.num_watched) + '</br>';
}

function CustomerRegistration()
// PRE:  TwoColumnContainer is called, user is logged in, user does not have a customer account registered
// POST: Customer registration form is populated on the page in the .left div
{
	document.getElementById("left").innerHTML = 
		'<h2>Customer Account</h2><form enctype="multipart/form-data" action="php/new_customer.php" method="POST">' + 
		'<input type="submit" value="Register as Customer" /></form>';
}

function SellerDashboard(data)
// PRE:  TwoColumnContainer is called, user is logged in, user has a seller account registered
// POST: Seller data and options are populated on the page in the .right div
{
	document.getElementById("right").innerHTML = 
		'<h2>Seller Account</h2></br>' +
		'<p>Seller Rating : ' + Number(data.rating).toPrecision(2) + ' from ' + data.num_ratings + ' ratings</p></br>' +
		MyListingsButton(data.num_listings);
}

function SellerRegistration()
// PRE:  TwoColumnContainer is called, user is logged in, user does not have a seller account registered
// POST: Seller registration form is populated on the page in the .right div
{
	document.getElementById("right").innerHTML = 
		'<h2>Seller Account</h2><form enctype="multipart/form-data" action="php/new_seller.php" method="POST">' + 
		'<input type="submit" value="Register as Seller" /></form>';
}

function PopulateCategories()
// PRE:  list of categories is populated (be careful of async conditions here)
//       sidebar body container is set up
// POST: the left sidebar of the sidebar body layout is populated with a list of categories and a header which says what the current browsing category is
{
	document.getElementById("left-sidebar").innerHTML =
		'</br><p style="color:#efe;font-size:16px;">Browsing ' + args.cat + '</p></br>' +
		CategoryButtons();
}

function ListingBox(id)
{
	var markup='<div class="divider"></div></br><div id="listing-' + id + '"><h3>' + listings[id].name + '</h3>' +
		'<h5>' + listings[id].category + '</h5>' +
		'<h5>sold by ' + SellerLink(listings[id].seller) + '</h5>' +
		'<h5>rating : ' + Number(listings[id].rating).toPrecision(2) + ' from ' + listings[id].numRatings + ' ratings</h5>' +
		'<h5>' + listings[id].type + ' listing</h5>' +
		ListingPriceText(listings[id]) +
		'</div></br>' + 
		ListingActionButtons(listings[id]) + 
		'<div id="comments-' + id + '"></div><br>';
	return markup;
}

function SellerTransactions()
{
	var sellerTotals = transactions.totals.asSeller;
	var markup = "";
	markup += '<h5>' + sellerTotals.pendingSales.unpaid.length + ' transactions awaiting payment from customer</h5>' +
		'<h5>' + sellerTotals.pendingSales.paid.length + ' transactions paid and awaiting your shipping confirmation</h5>' +
		'<h5>' + sellerTotals.pendingSales.shipped.length + ' transactions awaiting delivery confirmation from customer</h5>' +
		'<h5>' + sellerTotals.completedSales.length + ' completed transactions</h5>' +
		'<h5>Gross Sales: $' + sellerTotals.grossSales + '</h5>' +
		'<h5>Items Sold: ' + sellerTotals.itemsSold + '</h5>';
	markup += '<div class="divider"></div><h3>Unpaid Transactions</h3>';
	for (var i in sellerTotals.pendingSales.unpaid)
	{
		markup += SellerTransactionBox(transactions.asSeller[sellerTotals.pendingSales.unpaid[i]]);
	}
	markup += '<div class="divider"></div><h3>Paid Transactions</h3>';
	for (var i in sellerTotals.pendingSales.paid)
	{
		markup += SellerTransactionBox(transactions.asSeller[sellerTotals.pendingSales.paid[i]]);
	}
	markup += '<div class="divider"></div><h3>Shipped Transactions</h3>';
	for (var i in sellerTotals.pendingSales.shipped)
	{
		markup += SellerTransactionBox(transactions.asSeller[sellerTotals.pendingSales.shipped[i]]);
	}
	markup += '<div class="divider"></div><h3>Completed Transactions</h3>';
	for (var i in sellerTotals.completedSales)
	{
		markup += SellerTransactionBox(transactions.asSeller[sellerTotals.completedSales[i]]);
	}
	markup += '<div class="divider"></div>';
	return markup;
}

function CustomerTransactions()
{
	var customerTotals = transactions.totals.asCustomer;
	var markup = "";
	markup += '<h5>' + customerTotals.pendingReceipts.unpaid.length + ' transactions confirmed and awaiting your payment</h5>' +
		'<h5>' + customerTotals.pendingReceipts.paid.length + ' transactions awaiting shipping confirmation from seller</h5>' +
		'<h5>' + customerTotals.pendingReceipts.shipped.length + ' transactions shipped and awaiting your delivery confirmation</h5>' +
		'<h5>' + customerTotals.completedReceipts.length + ' completed transactions</h5>' +
		'<h5>Gross Receipts: $' + customerTotals.grossReceipts + '</h5>' +
		'<h5>Items Bought: ' + customerTotals.itemsBought + '</h5>';
	markup += '<div class="divider"></div><h3>Unpaid Transactions</h3>';
	for (var i in customerTotals.pendingReceipts.unpaid)
	{
		markup += CustomerTransactionBox(transactions.asCustomer[customerTotals.pendingReceipts.unpaid[i]]);
	}
	markup += '<div class="divider"></div><h3>Paid Transactions</h3>';
	for (var i in customerTotals.pendingReceipts.paid)
	{
		markup += CustomerTransactionBox(transactions.asCustomer[customerTotals.pendingReceipts.paid[i]]);
	}
	markup += '<div class="divider"></div><h3>Shipped Transactions</h3>';
	for (var i in customerTotals.pendingReceipts.shipped)
	{
		markup += CustomerTransactionBox(transactions.asCustomer[customerTotals.pendingReceipts.shipped[i]]);
	}
	markup += '<div class="divider"></div><h3>Completed Transactions</h3>';
	for (var i in customerTotals.completedReceipts)
	{
		markup += CustomerTransactionBox(transactions.asCustomer[customerTotals.completedReceipts[i]]);
	}
	markup += '<div class="divider"></div>';
	return markup;
}

function SellerTransactionBox(transaction)
{
	var markup = "";
	markup += '<h5>Transaction #' + transaction.id + ' selling ' + transaction.name + ' for $' + transaction.salePrice + '</h5>';
	switch (transaction.status)
	{
		case "unpaid":
			markup += '<h5>status: awaiting payment from customer</h5>' +
				'<h5>please remember to rate this transaction when it is completed</h5>';
			break;
		case "paid":
			markup += '<h5>status: payment received</h5>' +
				'<button onclick="MarkAsShipped(\'' + transaction.id + '\')">mark as shipped</button></br>' +
				'<h5>please remember to rate this transaction when it is completed</h5>';
			break;
		case "shipped":
			markup += '<h5>status: awaiting delivery confirmation from customer</h5>' +
				'<h5>please remember to rate this transaction when it is completed</h5>';
			break;
		case "delivered":
			markup += '<h5>status: delivered to customer</h5>';
			if (transaction.rating.seller == null)
			{
				markup += '<input type="number" min="1" max="5" id="transaction-seller-rating-' + transaction.id + '"></input>' +
					'<button onclick="RateAsSeller(\'' + transaction.id + '\')">submit rating</button>';
			}
			else
			{
				markup += '<h5>rating: ' + Number(transaction.rating.seller).toPrecision(1) + '</h5>';
			}
			break;
		default:
	}
	markup += '</br>';
	return markup;
}

function CustomerTransactionBox(transaction)
{
	var markup = "";
	markup += '<h5>Transaction #' + transaction.id + ' buying ' + transaction.name + ' for $' + transaction.salePrice + '</h5>';
	switch (transaction.status)
	{
		case "unpaid":
			markup += '<h5>status: unpaid, please submit payment details in form on left sidebar</h5>' +
				'<h5>please remember to rate this transaction when it is completed</h5>';
			break;
		case "paid":
			markup += '<h5>status: payment received, awaiting shipping confirmation from seller</h5>' +
				'<h5>please remember to rate this transaction when it is completed</h5>';
			break;
		case "shipped":
			markup += '<h5>status: shipped, please confirm as received when you receive the item</h5>' +
				'<button onclick="MarkAsDelivered(\'' + transaction.id + '\')">mark as delivered</button></br>' +
				'<h5>please remember to rate this transaction when it is completed</h5>';
			break;
		case "delivered":
			markup += '<h5>status: received</h5>';
			if (transaction.rating.customer == null)
			{
				markup += '<input type="number" min="1" max="5" id="transaction-customer-rating-' + transaction.id + '"></input>' +
					'<button onclick="RateAsCustomer(\'' + transaction.id + '\')">submit rating</button>';
			}
			else
			{
				markup += '<h5>rating: ' + Number(transaction.rating.customer).toPrecision(1) + '</h5>';
			}
			break;
		default:
	}
	markup += '</br>';
	return markup;
}

function PopulateTransactions()
{
	var markup = "";
	markup += '<h3>Transaction Summary</h3>';
	markup += '<div id="transaction-left">' +
		'<h3>Transactions as seller</h3>' +
		SellerTransactions() +
		'</div><div id="transaction-right">' +
		'<h3>Transactions as customer</h3>' +
		CustomerTransactions() +
		'</div>';
	document.getElementById("middle").innerHTML = markup;

	markup = "";
	markup += '</br></br><h3>Complete Payment</h3>' +
		'<p>Whichever option is selected below will be used to complete payment on all outstanding transactions in which you are the customer. ' +
		'Details input using the bottom form will be saved for use for future transactions.</p>' +
		'<p>Select saved payment details</p><select id="payment-select"><option value="" disabled="disabled" selected="selected">Saved Payment</option></select></br>' +
		'<p>Security Code</p><textarea id="card-cvv-select" rows="1" cols="3"></textarea></br>' +
		'<button onclick="PayWithSelected()">Pay with selected payment details</button>' +
		'<p>Card Number</p><textarea id="card-number" rows="1" cols="16"></textarea></br>' +
		'<p>Expiration Date</p><textarea id="card-exp" rows="1" cols="10"></textarea></br>' +
		'<p>Security Code</p><textarea id="card-cvv-input" rows="1" cols="3"></textarea></br>' +
		'<button onclick="PayWithInput()">Pay with above details</button>';
	document.getElementById("left-sidebar").innerHTML = markup;
	for (var i in transactions.savedPayment)
	{
		var option = document.createElement("option");
		option.text = i;
		option.value = i;
		document.getElementById("payment-select").add(option);
	}
}

function PayWithSelected()
{
	var key = document.getElementById("payment-select").value;
	var cvv = document.getElementById("card-cvv-select").value;
	if (key != "" && cvv == transactions.savedPayment[key].cvv)
	{
		MakePayment(key);
	}
}

function PayWithInput()
{
	var card = document.getElementById("card-number").value;
	var exp = document.getElementById("card-exp").value;
	var cvv = document.getElementById("card-cvv-input").value;
	var key = card + ' exp. ' + exp;
	transactions.savedPayment[key] = {
		cardNumber: card,
		expiration: exp,
		cvv: cvv
	}
	MakePayment(key);
}

function PopulateListingsFront()
{
	var markup = "";
	markup += '<h3>Showing listings ' + Math.min(listings.ids.length, ((Number(args.browse_page)-1)*10+1)) + ' through ' + Math.min(Number(args.browse_page)*10, listings.ids.length)  + ' of ' + listings.ids.length + '</h3>';
	for (var i = (Number(args.browse_page)-1)*10; i < (Number(args.browse_page))*10 && i < listings.ids.length; i++)
	{
		markup += ListingBox(listings.ids[i]);
	}
	markup += '<div class="divider"></div></br>';
	// page buttons
	var addlArgs = "";
	// preserve other arguments
	for (var i in Object.keys(args))
	{
		if (Object.keys(args)[i] != "page" && Object.keys(args)[i] != "browse_page" && Object.keys(args)[i] != "")
		{
			addlArgs += "&" + Object.keys(args)[i] + "=" + args[Object.keys(args)[i]];
		}
	}
	markup += '<span style="display:inline;">';
	if (args.browse_page > 1)
	{
		markup += '<button onclick=\'Redirect("' + args.page + '", "' + addlArgs + '&browse_page=' + (Number(args.browse_page)-1) + '");\'>previous page</button>';
	}
	for (var i = 1; i <= (listings.ids.length / 10) + 1; i++)
	{
		if (args.browse_page==i)
		{
			markup += '<h5 style="display:inline;"> ' + i + ' </h5>';
		}
		else
		{
			markup += '<button onclick=\'Redirect("' + args.page + '", "' + addlArgs + '&browse_page=' + i + '");\'>'+ i +'</button>';
		}
	}
	if (args.browse_page*10 < listings.ids.length)
	{
		markup += '<button onclick=\'Redirect("' + args.page + '", "' + addlArgs + '&browse_page=' + (Number(args.browse_page)+1) + '");\'>next page</button>';
	}
	markup += '</span>';

	document.getElementById("middle").innerHTML = markup;
}

function ListingActionButtons(listing)
{
	var output = '<span style="display:block"><div id="listing-buttons-' + listing.id + '">';
	if (customer.retval)
	{
		if (listing.type == 'dual' || listing.type == 'sale')
		{
			if (args.page != 'shopping_cart')
			{
				if (customer.cart.indexOf(listing.id) == -1)
				{
					output += AddToCartButton(listing.id);
				}
				else
				{
					output += '<h5>Item already in cart    </h5>';
				}
			}
		}
		if (listing.type == 'dual' || listing.type == 'auction')
		{
			if (args.page != 'watch_list')
			{
				if (customer.watch.indexOf(listing.id) == -1)
				{
					output += AddToWatchListButton(listing.id);
				}
				else
				{
					output += '<h5>Item already in watch list    </h5>';
				}
			}
			output += '<textarea cols="7" rows="1" id="bid-field-' + listing.id + '"></textarea><button onclick=\'PlaceBidWrapper("' + listing.id + '")\'>Place Bid</button>';
			if (listing.bids != "none" && listing.bids.highBidder.id == customer.id)
			{
				output += '<h5>You have the current high bid</h5>';
			}
		}
	}
	output += ExpandCommentsButton(listing.id) + '</div></span>';
	return output;
}

function ListingPriceText(listing)
{
	var output = "";
	if (listing.type == "dual" || listing.type == "sale")
	{
		output += '<h5>list price: $' + listing.listPrice + '</h5>';
	}
	if (listing.type == "dual" || listing.type == "auction")
	{
		if (listing.bids == "none")
		{
			output += '<h5>no bids yet</h5>';
		}
		else
		{
			if (listing.active == 1)
			{
				output += '<h5>high bid: $' + listing.bids.highBidder.bid + ' by ' + listing.bids.highBidder.name + '</h5>';
				output += '<h5>reserve price ';
				if (Number(listing.bids.highBidder.bid) < Number(listing.reservePrice))
				{
					output += 'not ';
				}
				output += 'met</h5>';
			}
			else
			{
				if (listing.bids.highBidder.id == customer.id && listing.bids.highBidder.bid >= listing.reservePrice)
				{
					output += '<h5>you have won this item!</h5>';
				}
				else if (listing.bids.highBidder.bid < listing.reservePrice)
				{
					output += '<h5>the reserve price was not met for this item</h5>';
				}
				else
				{
					output += '<h5>another user has won this item</h5>';
				}
				output += '<h5>winning bid: $' + listing.bids.highBidder.bid + '</h5>';
			}
		}
		if (listing.active == 1)
		{
			output += '<h5>ending at ' + listing.endTime + '</h5>';
		}
		else
		{
			output += '<h5>auction has ended</h5>';
		}
	}
	return output;
}

function SellerLink(sell)
{
	var link = '<a href="index.html#page=front&seller_id=' + sell.id + '" onclick=\'Redirect("front","&seller_id=' + sell.id + '");\'>' + sell.name;
	if (seller.retval && sell.id == seller.id)
	{
		link += ' (you)';
	}
	link += '</a>';
	return link;
}

function ExpandComments(id)
{
	var markup = "";

	$.when(GetComments(id)).done(function(comments)
	{
		markup += '<h5>' + comments.length + ' comments on this listing</h5>';
		for (var i in comments)
		{
			markup += '<h5>posted at ' + comments[i].date + ' by ' + comments[i].user + '</h5>';
			markup += '<h5>' + comments[i].content + '</h5></br>';
		}
		if (loggedIn)
		{
			markup += '<textarea id="add-comment-' + id + '" rows="4" cols="50"></textarea></br>';
			markup += AddCommentButton(id);
		}
		document.getElementById("comments-" + id).innerHTML=markup;
	});
	document.getElementById('comm-button-' + id).outerHTML = CollapseCommentsButton(id);
}

function CollapseComments(id)
{
	document.getElementById("comments-" + id).innerHTML="";
	document.getElementById('comm-button-' + id).outerHTML = ExpandCommentsButton(id);
}



/*
	TOOLBAR AND BUTTONS
 */

function CheckoutButton()
{
	return '<button onclick=\'CheckoutWrapper();\'>Checkout Cart</button>';
}

function ClearWatchListButton()
{
	return '<button onclick=\'ClearWatchListWrapper();\'>Checkout Won Auctions and Clear Lost Auctions</button>';
}

function AddToCartButton(id)
{
	return '<button onclick=\'AddToShoppingCartWrapper("' + id + '");\'>Add to Cart</button>';
}

function AddToWatchListButton(id)
{
	return '<button onclick=\'AddToWatchListWrapper("' + id + '");\'>Add to Watch List</button>';
}

function ExpandCommentsButton(id)
{
	return '<button id="comm-button-' + id + '" onclick=\'ExpandComments("' + id + '");\'>Expand Comments(' + listings[id].commentCount + ')</button>';
}

function CollapseCommentsButton(id)
{
	return '<button id="comm-button-' + id + '" onclick=\'CollapseComments("' + id + '");\'>Collapse Comments</button>';
}

function AddCommentButton(id)
{
	return '<button onclick=\'AddCommentWrapper("' + id + '");\'>Add Comment</button>';
}

function CategoryButtons()
// PRE:  list of categories is populated (be careful of async conditions here)
// POST: FCTVAL == html for a list of buttons which link to category filters, and a button to the parent category if it the current category is not 'All'
{
	var output = "";
	var addlArgs = "";
	// preserve other arguments
	for (var i in Object.keys(args))
	{
		if (Object.keys(args)[i] != "page" && Object.keys(args)[i] != "cat" && Object.keys(args)[i] != "" && Object.keys(args)[i] != "browse_page")
		{
			addlArgs += "&" + Object.keys(args)[i] + "=" + args[Object.keys(args)[i]];
		}
	}
	for (var j in categories)
	{
		output += CategoryButton(args.page, addlArgs, j) + '</br>';
	}
	if (args.cat != 'All')
	{
		output += '</br>' + UpCategoryButton(args.page, addlArgs);
	}
	return output;
}

function UpCategoryButton(page, addlArgs)
// POST: FCTVAL == html for a button to return to parent of whatever category is currently being browsed on the same
//       page the user is on, preserving search arguments
{
	return '<button onclick=\'UpCategory("' + page + '", "' + addlArgs + '");\'>back to parent category</button>';
}

function CategoryButton(page, addlArgs, category)
// POST: FCTVAL == html for a button to select the given category for browsing
{
	var urlCat = encodeURIComponent(category.replace('\'','%27'));
	return '<button onclick=\'Redirect("' + page + '", "' + addlArgs + '&cat=' + urlCat + '");\'>' + category + '</button>';
}

function AddListingButton()
// POST: FCTVAL == html for a button to add a listing
{
	return '<button onclick=\'Redirect("add_listing","");\'>Add New Listing</button>';
}

function RoyaltySettingsButton()
// POST: FCTVAL == html for a royalty settings button
{
	return '<button onclick=\'Redirect("royalty_settings","");\'>Manage Royalty Settings</button>';
}

function ActiveBidsButton()
// POST: FCTVAL == html for an active bids button
{
	return '<button onclick=\'Redirect("my_active_bids","");\'>My Active Bids</button>';
}

function ChangePasswordButton()
// POST: FCTVAL == html for a change password button
{
	return '<button onclick=\'Redirect("change_password","");\'>Change Password</button>';
}

function ChangeAddressButton()
// POST: FCTVAL == html for a change address button
{
	return '<button onclick=\'Redirect("change_address","");\'>Change Address</button>';
}

function ChangePhoneNumberButton()
// POST: FCTVAL == html for a change phone number button
{
	return '<button onclick=\'Redirect("change_phone","");\'>Change Phone Number</button>';
}

function CommentHistoryButton()
// POST: FCTVAL == html for a comment history button
{
	return '<button onclick=\'Redirect("my_comments","");\'>My Comments</button>';
}

function PaymentDetailsButton()
// POST: FCTVAL == html for a payment details button
{
	return '<button onclick=\'Redirect("payment_details","");\'>Manage Payment Details</button>';
}

function MyTransactionsButton()
// POST: FCTVAL == html for a my account button
{
	return '<button onclick=\'Redirect("my_transactions","");\'>My Transactions</button>';
}

function MyAccountButton()
// POST: FCTVAL == html for a my account button
{
	return '<button onclick=\'Redirect("home","");\'>My Account</button>';
}

function MyListingsButton(num)
// POST: FCTVAL == html for a my listings button
{
	return '<button onclick=\'Redirect("my_listings","");\'>My Listings (' + num + ')</button>';
}

function WatchListButton(num)
// POST: FCTVAL == html for a watch list button
{
	return '<button onclick=\'Redirect("watch_list","");\'>Watch List (' + num + ')</button>';
}

function ShoppingCartButton(num)
// POST: FCTVAL == html for a shopping cart button
{
	return '<button onclick=\'Redirect("shopping_cart","");\'>Shopping Cart (' + num + ')</button>';
}

function FrontButton()
// POST: FCTVAL == html for a login/register button
{
	return '<button onclick=\'Redirect("front","");\'>Front Page</button>';
}

function SearchButton()
// POST: FCTVAL == html for a search button
{
	return '<button onclick=\'Redirect("search","");\'>Search</button>';
}

function LoginRegisterButton()
// POST: FCTVAL == html for a login/register button
{
	return '<a onclick=\'Redirect("home","");\' href="index.html#page=home"><button>Log In/Register</button></a>';
}

function LogoutButton()
// POST: FCTVAL == html for a logout button
{
	return '<a href="php/logout.php"><button>Log Out</button></a>';
}

/*
	SERVER CALLS
 */

function GetTransactions()
{
	return $.ajax({                                      
		url: "php/transactions.php?user_id=" + user.id,
		dataType: "json"
	});
}

function Authenticate()
// POST: FCTVAL == return value of php/authenticate.php
{
	return $.ajax({                                      
		url: "php/authenticate.php",
		dataType: "text"
	});
}

function HasCustomer()
// POST: FCTVAL == return value of php/authenticate.php
{
	return $.ajax({                                      
		url: "php/customer_data.php",
		dataType: "json"
	});
}

function HasSeller()
// POST: FCTVAL == return value of php/authenticate.php
{
	return $.ajax({                                      
		url: "php/seller_data.php",
		dataType: "json"
	});
}

function UserData()
// POST: FCTVAL = return value of php/user_data.php
{
	return $.ajax({                                      
		url: "php/user_data.php",
		dataType: "json"
	});
}

function Categories()
// POST: FCTVAL = return value of php/categories.php
{
	return $.ajax({                                      
		url: "php/categories.php?cat=" + encodeURI(args.cat),
		dataType: "json"
	});
}

function ParentCategory()
// POST: FCTVAL = return value of php/parent_category.php
{
	return $.ajax({                                      
		url: "php/parent_category.php?cat=" + encodeURI(args.cat),
		dataType: "text"
	});
}

function GetListingIds(cat, search, listType, sellerId)
{
	var query = "?";
	if (cat != undefined)
	{
		query += 'cat=' + cat + '&';
	}
	if (search != undefined)
	{
		query += 'search=' + search + '&';
	}
	if (listType != undefined)
	{
		query += 'list_type=' + listType + '&';
	}
	if (sellerId != undefined)
	{
		query += 'seller_id=' + sellerId;
	}
	return $.ajax({                                      
		url: "php/listings.php" + query,
		dataType: "json"
	});
}

function GetListing(id)
{
	return $.ajax({                                      
		url: "php/listing.php?item_id=" + id,
		dataType: "json"
	});
}

function GetListingsData()
{
	$.when(GetListingIds(args.cat,args.search,args.list_type,args.seller)).done(function(data)
	{
		listings.ids = data;
		if (!('browse_page' in args))
		{
			args.browse_page=1;
		}
		for (var i = (args.browse_page-1)*10; i < (args.browse_page)*10 && i < listings.ids.length; i++)
		{
			$.when(GetListing(listings.ids[i])).done(function(data)
			{
				listings[data.id] = data;
			});
		}
	});
}

function GetWatchList()
{
	$.when(GetWatchListIds()).done(function(data)
	{
		listings.ids = data;
		if (!('browse_page' in args))
		{
			args.browse_page=1;
		}
		for (var i = (args.browse_page-1)*10; i < (args.browse_page)*10 && i < listings.ids.length; i++)
		{
			$.when(GetListing(listings.ids[i])).done(function(data)
			{
				listings[data.id] = data;
			});
		}
	});
}

function GetShoppingCart()
{
	$.when(GetShoppingCartIds()).done(function(data)
	{
		listings.ids = data;
		if (!('browse_page' in args))
		{
			args.browse_page=1;
		}
		for (var i = (args.browse_page-1)*10; i < (args.browse_page)*10 && i < listings.ids.length; i++)
		{
			$.when(GetListing(listings.ids[i])).done(function(data)
			{
				listings[data.id] = data;
			});
		}
	});
}

function GetWatchListIds()
{
	return $.ajax({                                      
		url: "php/watch_list.php?cust=" + customer.id,
		dataType: "json"
	});
}

function GetShoppingCartIds()
{
	return $.ajax({                                      
		url: "php/shopping_cart.php?cust=" + customer.id,
		dataType: "json"
	});
}

function GetComments(id)
{
	return $.ajax({                                      
		url: "php/comments.php?item_id=" + id,
		dataType: "json"
	});
}

function AddCommentWrapper(id)
{
	$.post("php/add_comment.php",
	{
		item_id: id,
		user: user.id,
		text: document.getElementById("add-comment-" + id).value
	},
	function(data, status){
		window.location.reload();
	});
}

function MarkAsShipped(id)
{
	$.post("php/update_transaction.php",
	{
		update: "shipped",
		transaction_id: id
	},
	function(data, status){
		window.location.reload();
	});
}

function MarkAsDelivered(id)
{
	$.post("php/update_transaction.php",
	{
		update: "delivered",
		transaction_id: id
	},
	function(data, status){
		window.location.reload();
	});
}

function RateAsCustomer(id)
{
	$.post("php/update_transaction.php",
	{
		update: "customer_rating",
		rating: document.getElementById("transaction-customer-rating-" + id).value,
		transaction_id: id
	},
	function(data, status){
		window.location.reload();
	});
}

function RateAsSeller(id)
{
	$.post("php/update_transaction.php",
	{
		update: "seller_rating",
		rating: document.getElementById("transaction-seller-rating-" + id).value,
		transaction_id: id
	},
	function(data, status){
		window.location.reload();
	});
}

function MakePayment(key)
{
	$.post("php/payment.php",
	{
		card_number: transactions.savedPayment[key].cardNumber,
		expiration: transactions.savedPayment[key].expiration,
		cvv: transactions.savedPayment[key].cvv,
		cust_id: customer.id
	},
	function(data, status){
		window.location.reload();
	});
}

function AddToShoppingCartWrapper(id)
{
	$.when(AddToShoppingCart(id)).done(function()
	{
		window.location.reload();
	});
}

function CheckoutWrapper()
{
	$.when(Checkout()).done(function()
	{
		Redirect("my_transactions","");
	});
}

function AddToWatchListWrapper(id)
{
	$.when(AddToWatchList(id)).done(function()
	{
		window.location.reload();
	});
}

function ClearWatchListWrapper()
{
	$.when(ClearWatchList()).done(function()
	{
		Redirect("my_transactions","");
	});
}

function PlaceBidWrapper(id)
{
	$.when(PlaceBid(id)).done(function()
	{
		window.location.reload();
	});
}

function PlaceBid(id)
// PRE:  id is a listing id of an auction listing
// POST: a bid is placed on the item
{
	var bid = document.getElementById("bid-field-" + id).value;
	return $.ajax({                                      
		url: "php/place_bid.php?cust=" + customer.id + "&item_id=" + id + "&bid=" + bid,
		dataType: "text"
	});
}

function AddToShoppingCart(id)
// PRE:  id is a listing id of a direct sale listing
// POST: item is added to cart, or is declined if the id is invalid or is auction only
{
	return $.ajax({                                      
		url: "php/add_to_cart.php?cust=" + customer.id + "&item_id=" + id,
		dataType: "text"
	});
}

function Checkout()
{
	return $.ajax({                                      
		url: "php/checkout.php?cust=" + customer.id,
		dataType: "text"
	});
}

function AddToWatchList(id)
// PRE:  id is a listing id of an auction listing
// POST: item is added to watch list, or is declined if the id is invalid or is direct sale only
{
	return $.ajax({                                      
		url: "php/add_to_watch_list.php?cust=" + customer.id + "&item_id=" + id,
		dataType: "text"
	});
}

function ClearWatchList()
{
	return $.ajax({                                      
		url: "php/clear_watch_list.php?cust=" + customer.id,
		dataType: "text"
	});
}
