<?php
  //Debug mode ON
  ini_set('display_errors', 'On');
  error_reporting(E_ALL);

  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    // establish connection
    include_once('./database.php');

    // get the data from the login form
    $login = $_POST["acc_login"];
    $pass = $_POST["acc_pass"];

    // build SELECT query
    $squery = "SELECT T.acc_password
				       FROM tbl_accounts T
				       WHERE T.acc_login = '$login'";
           
    //echo $squery;
   // echo "<br>";
     
    $conn = new mysqli($db_host, $db_username, $db_password, $db_name, intval($db_port));
     
    if ($conn->connect_error)
      echo  die("Could not connect to database </body></html>" );
    else 
    {
      //$result = $conn->query($squery);
	   $result = mysqli_query($conn,$squery);
	   if ($result->num_rows > 0) 
	   {
		  // output data of each row
		  //while($row = $result->fetch_assoc()) 
			  //echo "password: " . $row["acc_password"] . "<br>";
		  $row = $result->fetch_assoc();
		  $stored_pass = $row["acc_password"];
		  if (sha1($pass) == $stored_pass)
		  {
			  session_start();
			  $_SESSION["username"] = $login;
			  header("Location: http://www-users.cselabs.umn.edu/~baran109/favplaces.php");
			  die();
		  } 
		  header("Location: http://www-users.cselabs.umn.edu/~baran109/login.php");
		  die();
		
	   }
    
	     //echo "10 results";   
    $conn->close(); 
    }
  }
?>

<!doctype html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <title>Log in</title>
  </head>

  <body>
  
  <div class="container">
    <div class="row">
      <p></p>
      <p></p>
    </div>
    
    <div class="row">
      <h1 style="color:black; text-align: center">Login Page</h1>
      <h4 style="color:black; text-align: center">Please enter your user name and password. Both are case sensitive.</h4>
    </div>


    <div class="row">
      <p></p>
      <p></p>
      <form action="login.php" method="POST">
      User: <br> <input type="text" name="acc_login" required> <br>
      Password: <br> <input type="password" name="acc_pass" required> <br>
      <input type="submit" value="Log in">
    </div>
  </div>

  </body>
</html>
