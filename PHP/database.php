<?php

  ini_set('display_errors','1');
  error_reporting(E_ALL);
   
         
  $xml = simplexml_load_file("dbconfig.xml");
  $db_host = $xml->host;
  $db_username = $xml->user;
  $db_password = $xml->password;
  $db_name = $xml->database;
  $db_port = $xml->port;
     
?>
