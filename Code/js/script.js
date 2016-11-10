// File Name:           script.js
// Description:         This file contains the runtime script for index.html
// Dependencies:        php/authenticate.php, d3.js
// Additional Notes:    none

/*
	RUNTIME CODE
 */

var loggedIn = false;
PageInit();

/*
	PAGE SETUP SCRIPTS
 */

function PageInit()
// POST: checks if a user is logged in, then renders the appropriate page
{
	$.when(Authenticate()).done(function(retval){
		if (retval === "true")
		{
			loggedIn = true;
		}
		RenderPage(GetPageArgs());
		RenderToolbar();
	});
}

function RenderPage(args)
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
		case "home":
			PageHome();
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
	var queryString = "\#((?:[a-z0-9]+\=[a-z0-9\_]+\&?)*)";
	var query = new RegExp(queryString).exec(window.location.hash);
	query = query[1].split("&");
	args = {};
	for (var i in query)
	{
		query[i] = query[i].split("=");
		args[query[i][0]] = query[i][1];
	}
	return args;
}

function Redirect(page, args)
{
	window.location='index.html#page=' + page + args;
	window.location.reload();
}

/*
	PAGE RENDER SCRIPTS
 */

function PageFront()
// POST: Renders front page page
{
}

function PageHome()
// POST: Renders home page
{
	if (loggedIn)
	{
		TwoColumnContainer();
		UserDashboard();
	}
	else
	{
		TwoColumnContainer();
		RegisterLoginPrompt();
	}
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
	document.getElementById("container").innerHTML = '<h2 class="prompt">404: Page not found. Please try locating this resource again from the <a onclick=\'Redirect("home","");\' href="index.html#page=home">homepage</a>.</h2>';
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
		'<input type="submit" value="Register" /></form>';
	// empty footer
	document.getElementById("footer").innerHTML = '';
}

function UserDashboard()
{
	// header
	document.getElementById("header").innerHTML =
		'<h2 class="padding-top">User Dashboard</h2>';
	DisplayCustomer();
	DisplaySeller();
}

function DisplayCustomer()
// PRE:  TwoColumnContainer is called, user is logged in 
// POST: Either customer data or a customer registration is populated in the .left div, depending on if the logged in user has a customer registered or not
{
	$.when(HasCustomer()).done(function(data){
		if (data.retval)
		{
			CustomerDashboard(data);
		}
		else
		{
			CustomerRegistration();
		}
	});
}

function DisplaySeller()
// PRE:  TwoColumnContainer is called, user is logged in 
// POST: Either seller data or a seller registration is populated in the .right div, depending on if the logged in user has a seller registered or not
{
	$.when(HasSeller()).done(function(data){
		if (data.retval)
		{
			SellerDashboard(data);
		}
		else
		{
			SellerRegistration();
		}
	});
}

function CustomerDashboard(data)
// PRE:  TwoColumnContainer is called, user is logged in, user has a customer account registered
// POST: Customer data and options are populated on the page in the .left div
{
	document.getElementById("left").innerHTML = 
		'<h2>Customer Account</h2></br>' +
		'<p>Customer Rating : ' + Number(data.rating).toPrecision(2) + ' from ' + data.num_ratings + ' ratings</p></br>' +
		'<p>Royalty Points : ' + data.points + '</p></br>' +
		'<p>Royalty Subscription Remaining : ' + data.days + ' days</p></br>' +
		'<button>Manage Royalty Subscription</button></br>' +
		'<p>' + data.num_carted + ' items in your shopping cart</p></br>' +
		'<button>View Your Shopping Cart</button></br>' +
		'<p>' + data.num_watched + ' items in your shopping cart</p></br>' +
		'<button>View Your Watch List</button></br>';
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
		'<p>' + data.num_listings + ' items listed</p></br>' +
		'<button>Manage Your Listings</button></br>';
}

function SellerRegistration()
// PRE:  TwoColumnContainer is called, user is logged in, user does not have a seller account registered
// POST: Seller registration form is populated on the page in the .right div
{
	document.getElementById("right").innerHTML = 
		'<h2>Seller Account</h2><form enctype="multipart/form-data" action="php/new_seller.php" method="POST">' + 
		'<input type="submit" value="Register as Seller" /></form>';
}

/*
	TOOLBARS
 */

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

function MyListingsButton()
// POST: FCTVAL == html for a my listings button
{
	return '<button onclick=\'Redirect("my_listings","");\'>My Listings</button>';
}

function WatchListButton()
// POST: FCTVAL == html for a watch list button
{
	return '<button onclick=\'Redirect("watch_list","");\'>watch_list</button>';
}

function ShoppingCartButton()
// POST: FCTVAL == html for a shopping cart button
{
	return '<button onclick=\'Redirect("shopping_cart","");\'>Shopping Cart</button>';
}

function FrontButton()
// POST: FCTVAL == html for a login/register button
{
	return '<button onclick=\'Redirect("front","");\'>Front Page</button>';
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
	AJAX CALLS
 */

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
