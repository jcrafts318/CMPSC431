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
var categories = [];
var parentCategory = "";
PageInit();

/*
	PAGE SETUP SCRIPTS
 */

function PageInit()
// POST: checks if a user is logged in, then renders the appropriate page
{
	console.log(args);
	if (!('cat' in args))
	{
		args.cat = 'All';
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

/*
	PAGE RENDER SCRIPTS
 */

function PageFront()
// POST: Renders front page page
{
	SidebarBodyContainer();
	PopulateCategories(categories);
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
		'<p>Address: ' + user.address.street + ', ' + user.address.city + ', ' + user.address.state + ' ' + user.address.zip + '</p>' + ChangeAddressButton() +
		'<p>Phone Number: ' + user.phone + '</p>' + ChangePhoneNumberButton() + '</br>' +
		CommentHistoryButton() + '</br>' +
		ChangePasswordButton();
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
		'<p>Royalty Points : ' + data.points + '</p>' +
		'<p>Royalty Subscription Remaining : ' + data.days + ' days</p>' +
		ShoppingCartButton(data.num_carted) + '</br>' +
		WatchListButton(data.num_watched) + '</br>' +
		ActiveBidsButton(data.bids) + '</br>' +
		RoyaltySettingsButton() + '</br>' +
		PaymentDetailsButton();
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

/*
	TOOLBAR AND BUTTONS
 */

function CategoryButtons()
// PRE:  list of categories is populated (be careful of async conditions here)
// POST: FCTVAL == html for a list of buttons which link to category filters, and a button to the parent category if it the current category is not 'All'
{
	var output = "";
	var addlArgs = "";
	// preserve other arguments
	for (var i in Object.keys(args))
	{
		if (Object.keys(args)[i] != "page" && Object.keys(args)[i] != "cat" && Object.keys(args)[i] != "")
		{
			addlArgs += "&" + Object.keys(args)[i] + "=" + args[Object.keys(args)[i]];
		}
	}
	for (var j in categories)
	{
		output += CategoryButton(args.page, addlArgs, categories[j]) + '</br>';
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
	return '<button onclick=\'Redirect("' + page + '", "' + addlArgs + '&cat=' + category + '");\'>' + category + '</button>';
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

function AddToShoppingCart(id)
// PRE:  id is a listing id of a direct sale listing
// POST: item is added to cart, or is declined if the id is invalid or is auction only
{
	return $.ajax({                                      
		url: "",//TODO: add actual url for this call
		dataType: "json"
	});
}

function AddToWatchList(id)
// PRE:  id is a listing id of an auction listing
// POST: item is added to watch list, or is declined if the id is invalid or is direct sale only
{
	return $.ajax({                                      
		url: "",//TODO: add actual url for this call
		dataType: "json"
	});
}
