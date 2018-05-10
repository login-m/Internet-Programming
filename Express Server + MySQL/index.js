
// Variables
var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var xml2js = require("xml2js");
var session = require('express-session');
var sha1 = require('sha1');
var mysql = require("mysql");
var con;


// Connect to DB using XML config file
fs.readFile(__dirname + '/dbconfig.xml', 'utf8',function(err,file){
	if (err) throw err;
	xml2js.parseString(file,{},function(err,parsed){
		parsed = parsed.dbconfig;
		for (var attributename in parsed){
			parsed[attributename] = parsed[attributename][0];
		}
		con = mysql.createConnection(parsed);
		con.connect(function(err) {
			if (err) throw err;
			console.log('Connected to DB!');		
		});
	});
});


// middle ware to server static files
app.use('/client', express.static(__dirname + '/client'));

// apply the body-parser middleware to all incoming requests
app.use(bodyparser()); 

// use express-session
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));


// // GET method route for the favourites page.
app.get('/favourites',function(req, res) {
	if (!req.session.value)
		res.sendFile(__dirname + '/client/login.html');
	else 
		res.sendFile(__dirname + '/client/favourites.html');
});


// GET method route for the addPlace page.
app.get('/addPlace',function(req, res) {
	if (!req.session.value)
		res.sendFile(__dirname + '/client/login.html');
	else 
		res.sendFile(__dirname + '/client/addPlace.html');
});


// GET method route for the admin page.
app.get('/admin',function(req,res) {
	 if(!req.session.value)
		 res.sendFile(__dirname +'/client/login.html');
	 else 
		res.sendFile(__dirname + '/client/admin.html');	
});


// GET method route for the login page.
app.get('/login',function(req, res) {
	res.sendFile(__dirname + '/client/login.html');
});


// GET method route for the Home page.
app.get('/',function(req, res) {
	if(!req.session.value)
		res.sendFile(__dirname + '/client/login.html');
	else
		res.sendFile(__dirname + '/client/home.html');
});


// GET method to return the list of favourite places
// The function queries the table tbl_places for the list of places and sends the response back to client
app.get('/getListOfFavPlaces', function(req, res) {
	var sql = `SELECT *
	   		  FROM tbl_places`;
	con.query(sql,function(err,result){
		if(err)
			throw err;
		res.send(result);	
	});
});


// GET method route to retrieve list of users
app.get('/getAdminTable', function(req,res) {
	var sql = `SELECT *
			       FROM tbl_accounts`;
	con.query(sql,function(err,result){
		if(err) throw err;
		res.send(result);	
	});
});

// GET method route to retrieve currently logged in user
app.get('/getCurrentUser',function(req,res){
  if(typeof req.session.username !== 'undefined'){
    res.send({username: req.session.username});
  }
});

// POST method to validate if user is online
app.post('/validateOnlineUser', function(req,res) {
    if (req.session && req.session.username === req.body.login)
			res.send({"result": true});
		else
			res.send({"result": false});	
});

// GET method route to log out of the application
app.get('/logout', function(req, res) {
  req.session.value = 0;
  res.sendFile(__dirname + '/client/login.html');
});


// GET method to return the 404 message and error to the client
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/client/404.html');
});


// POST method to add user to database
app.post('/postUser', function(req,res) {
	var rowToBeInserted = {
		acc_name: req.body.username,
		acc_login: req.body.login,
		acc_password: sha1(req.body.password)
	};
	
	var sql = `INSERT tbl_accounts SET ?`;
	con.query(sql,rowToBeInserted,function(err,result) {
		if (err) throw err;
		console.log("New user has been added!");
		res.sendFile(__dirname + '/client/admin.html');
	});	
});
	

// POST method to insert details of a new place to tbl_places table
app.post('/postPlace', function(req, res) {
  
	var place_name = req.body.placename;
	var addr_line1 = req.body.addressline1;
	var addr_line2 = req.body.addressline2;
	var open_time = req.body.opentime;
	var close_time = req.body.closetime;
	var add_info = req.body.additionalinfo;
	var add_info_url = req.body.additionalinfourl;

	var rowToBeInserted = {
		place_name: req.body.placename,
		addr_line1:  req.body.addressline1,
		addr_line2: req.body.addressline2,
		open_time: req.body.opentime,
		close_time: req.body.closetime,
		add_info: req.body.additionalinfo,
		add_info_url: req.body.additionalinfourl
	};

	var sql = `INSERT tbl_places SET ?`;
	con.query(sql,rowToBeInserted,function (err, result) {
		if(err) {
		  throw err;
		}
		console.log("New place has been added!");
		res.sendFile(__dirname + '/client/favourites.html');
});
});


// POST method to validate user login
// upon successful login, user session is created
app.post('/validateLoginDetails', function(req, res) { 

	// Get login name and password
	var logname = req.body.acc_login;
	var sha1pass = sha1(req.body.acc_pass);
	
	// Perform SQL query
	var sql = `SELECT T.acc_password, T.acc_id
				  FROM tbl_accounts T
				  WHERE T.acc_login = ?`;
	con.query(sql, logname, function(err, result, fields) {
		if (err) 
			throw err;	
		// If match occurs - send favourites, if not - send log_fail
		if (result.length > 0 && sha1pass == result[0].acc_password){
			req.session.value = 1;
      req.session.username = logname;
      req.session.accid = result[0].acc_id;
			res.sendFile(__dirname + '/client/favourites.html');
		}
		else 
			res.sendFile(__dirname + '/client/log_fail.html');	
		});
});


// POST method to validate:
// 1) If new user is being added - the login is unique
// 2) The user is being edited - new login is unique or matches the old login
app.post('/validateUniqueUser', function(req,res) {

		var select_sql = `SELECT T.acc_login 
						  FROM tbl_accounts T
						  WHERE T.acc_login = ?`;
		con.query(select_sql,req.body.login,function(err,result) {
		  if(err) throw err;
      if (req.body.mode=="Add")
		    result.length > 0 ? res.send({"result": false}) : res.send({"result": true});
      else if (req.body.mode=="Edit"){
        if (result.length == 0 || (result.length == 1 && result[0].acc_login==req.body.old_login)){
          res.send({"result": true});
        }
        else
          res.send({"result":false});
      }
	});
});


// POST method to validate if user is online
app.post('/validateOnlineUser', function(req,res) {
    if (req.session && req.session.username === req.body.login)
			res.send({"result": true});
		else
			res.send({"result": false});	
});


// POST method to delete user from database
app.post('/deleteUser', function(req,res) {
  var sql = `DELETE FROM tbl_accounts
             WHERE acc_login = ?`;
  con.query(sql,req.body.login,function(err,result) {
    if (err) throw err;
    console.log("User: " + req.body.login + " has been deleted!");
    res.send({"result":result});
  });
});
  

// POST method to update user information
app.post('/updateUser', function(req,res) {
  if (req.session.accid == req.body.id)
    req.session.username = req.body.login;

  var sql = `UPDATE tbl_accounts
             SET acc_name = ?, acc_login = ?, acc_password = ?
             WHERE acc_id = ?`;
  params = [req.body.username, req.body.login, sha1(req.body.password), req.body.id];
  con.query(sql,params,function(err,result) {
    if (err) throw err;
    console.log("User " + req.body.id + ": information has been updated!");
	  res.sendFile(__dirname + '/client/admin.html');	
  });
});
	
		
		
