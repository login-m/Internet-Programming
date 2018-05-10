<?php
	ini_set('display errors','On');
	error_reporting(E_ALL);

	session_start();
	if (!isset($_SESSION['username'])) {
		header("Location: http://www-users.cselabs.umn.edu/~baran109/login.php");
		die();
	}
	
	include_once('./database.php');
	$squery = "SELECT *
				  FROM tbl_places";
	
	$conn = new mysqli($db_host, $db_username, $db_password, $db_name, intval($db_port));
	
	if ($conn->connect_error)
      echo  die("Could not connect to database </body></html>" );
   else {
	   $result = mysqli_query($conn,$squery);
   	$conn->close(); 
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
      <link rel="stylesheet" href="http://www-users.cselabs.umn.edu/~baran109/css/style.css">
      <title>My favourite places</title>
  </head>

  <body> 
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <ul class="nav navbar-nav">
            <li><a href="/"><b>Home</b></a></li>
            <li><a href="/favourites"><b>Favourite places</b></a></li>
            <li><a href="/addPlace"><b>Add Place</b></a></li>
            <li><a href="/admin"><b>Admin</b></a></li>
            <li><a href="http://www-users.cselabs.umn.edu/~baran109/logout.php"><b>Log out</b></a></li>
          </ul>
        <b id="loguser"><?php echo("Welcome: " . $_SESSION['username']);?></b>
        </div>
      </nav>
      <div class="container">
        <table class="table" id="myFavTable">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Address</th>
              <th scope="col">Open / Close</th>
              <th scope="col">Information</th>
              <th scope="col">URL</th>
            </tr>
          </thead>
          <tbody>
			<?php 
			if ($result->num_rows > 0) 
	 		{
		     //output data of each row
		     while($row = $result->fetch_assoc()) 
			    echo("<tr><td>" . $row["place_name"] . "</td> " . 
						"<td> " . $row["addr_line1"] . "," . $row["addr_line2"] . "</td>" . 
						"<td> " . $row["open_time"] . "<br>" . $row["close_time"] . "</td>" .  
						"<td> " . $row["add_info"] . "</td> " .
						"<td> " . $row["add_info_url"] . "</td></tr>");
			}
			?>
          </tbody>
        </table>
      </div>
  </body>
</html>
