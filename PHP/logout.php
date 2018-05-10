<?php
	ini_set('display errors','On');
	error_reporting(E_ALL);
	
	session_start();
	session_unset();
	session_destroy();
	header("Location: http://www-users.cselabs.umn.edu/~baran109/login.php");
	die();
?>


