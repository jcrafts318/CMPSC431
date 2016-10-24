// File Name:           script.js
// Description:         This file contains the runtime script for index.html
// Dependencies:        php/authenticate.php, d3.js
// Additional Notes:    none

/*
	RUNTIME CODE
 */

// display whichever prompt is needed
IsLoggedIn();

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
		console.log(data);
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
		console.log(data);
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

function DisplayLogout()
// PRE:  User is logged in 
// POST: A log out button is added to the banner section
{
	document.getElementById("toolbar").innerHTML =
		'<a href="php/logout.php"><button>Log Out</button></a>';
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

/*
	ENTRY POINT TO SCRIPTS
 */

function IsLoggedIn()
// POST: if user is logged in, submission prompt is displayed, o.w. login/register prompt is displayed
{
	$.when(Authenticate()).done(function(retval){
		if (retval === "true")
		{
			TwoColumnContainer();
			UserDashboard();
			DisplayLogout();
		}
		else
		{
			TwoColumnContainer();
			RegisterLoginPrompt();
		}
	});
}
