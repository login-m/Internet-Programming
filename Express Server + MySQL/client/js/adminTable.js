"use strict";

// Variables to reverse changes
var replaced_node;
var isChanging = false;

// List of users
(function() {
	var url = "/getAdminTable";
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",url,true);
	xmlhttp.send();

	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			var parsedJson = JSON.parse(xmlhttp.responseText);
			var placeList = parsedJson;
			var count = Object.keys(placeList).length;

			// For every element, create a row and populate each column
			for (var i = 0; i < count; i++){			
			  var tr = document.createElement("tr");
			  var newHTML = "";
			  for (var key in placeList[i]){	  
					newHTML += placeList[i][key];;
					
					// Skip password
					if (key=="acc_password"){
						newHTML = " ";

          } 
			
					// Populate a cell
				   	var tabCell = tr.insertCell(-1);
				   	tabCell.innerHTML = newHTML;
				   	newHTML = "";		
			  }
			  
			  // Add buttons together with their indexes
			  var buttons = ` \
			      <th scope="col"><button onclick="editRow(this);">Edit</button></th> \
	          <th scope="col"><button onclick="deleteRow(this);">Delete</button></th>`;

	          var tabCell = tr.insertCell(-1);
	          tabCell.innerHTML = buttons;

			  // Append new row to tbody (second child of table)
			  document.getElementById("adminTable").childNodes[1].appendChild(tr);		
		   }
		}
	}
})();

	 
// Validation function
function validateUser(name, mode, cb)
{
  var url;
  var params;
  
  // Check what kind of validation is needed
  if (mode=="uniqueAdd"){
    url = "/validateUniqueUser";
    params = 'login='+name+'&mode=Add';
  }
  else if (mode=="uniqueEdit"){
    url = "/validateUniqueUser";
    var ol = document.getElementById("old_login_id").value;
    params = 'login='+name+'&mode=Edit&old_login='+ol;
  }
  else if (mode=="online"){
    url = "/validateOnlineUser";
    params = 'login='+name;
  }

  // Perform the request
  var xmlhttp;
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST",url,true);
  xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xmlhttp.onreadystatechange=function()
  {
	  if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
	  {
		  var parsedJson = JSON.parse(xmlhttp.responseText);
		  cb(parsedJson.result);
    }
  }
  xmlhttp.send(params);
}
		 
  
// AddUser button
function addUser(){

  if (isChanging){
        document.getElementById("error").innerHTML = "Save or Cancel previous entry to add a new one";
        return;
  }
  isChanging = true;

  var input_row = 
  ' <tr \
    <td scope="col">_</td> \
    <td scope="col"><input type="TEXT" name="username" id="username_id" form="my_form"></input></td> \
    <td scope="col"><input type="TEXT" name="login" id="login_id" form="my_form"></input></td> \
    <td scope="col"><input type="TEXT" name="password" id="password_id" form="my_form"></input></td> \
    <td scope="col"><button onclick="save()">Save</button> \
    				        <button onclick="cancel();">Cancel</button></td>';

  document.getElementById("error").innerHTML = "";
  document.getElementById("input_row").innerHTML = input_row;
}

// Save button functionality for adding new users
function save()
{

  var name = document.getElementById("login_id").value;
  validateUser(name, "uniqueAdd", function(ok) {
    var err = document.getElementById("error");
    if (ok)
    {
          isChanging = false;
          var form = document.getElementById("my_form");
          form.action = "/postUser";
			    form.submit();
    }
    else
      err.innerHTML = "This login is used by another user"; 
  });
  
}

// Cancel button to remove input row when adding new users
function cancel(){
    isChanging = false;
    document.getElementById("input_row").innerHTML = "";
    document.getElementById("error").innerHTML = "";
}


// Edit button functionality
function editRow(row){
  
  // Display error handling
  document.getElementById("error").innerHTML = "";
  if (isChanging){
        document.getElementById("error").innerHTML = "Save or Cancel to edit the next entry";
        return;
  }
  isChanging = true;

  // Prepare the input row
  var id = row.parentNode.parentNode.childNodes[0].innerHTML;
  var name = row.parentNode.parentNode.childNodes[1].innerHTML;
  var login = row.parentNode.parentNode.childNodes[2].innerHTML;

  var input_row = 
  ' <td \
    <td scope="col">' + id + '</td> \
    <td scope="col"><input type="TEXT" name="username" id="username_id_edit" form="my_form" value="'+name+'"></input></td> \
    <td scope="col"><input type="TEXT" name="login" id="login_id_edit" form="my_form" value="'+login+'"></input></td> \
    <td scope="col"><input type="TEXT" name="password" id="password_id_edit" form="my_form"></input></td> \
    <td scope="col"><button onclick="saveEdit()">Save</button> \
    				        <button onclick="cancelEdit(this);">Cancel</button></td> \
    <td scope="col"><input id="hidden_id" name="id" form="my_form" value="' + id + '" type="hidden"></input></td> \
    <td scope="col"><input id="old_login_id" name="old_login" form="my_form" value="' + login + '" type="hidden"></input></td>'
  

  // Replace selected row with the input_row variable
  var thead = row.parentNode.parentNode.parentNode;
  var node_to_replace = row.parentNode.parentNode;
  var div = document.createElement('tr');
  div.innerHTML = input_row;

  replaced_node = thead.replaceChild(div, node_to_replace);
}

// Save button functionality for editing new users
function saveEdit()
{
  var name = document.getElementById("login_id_edit").value;
  validateUser(name, "uniqueEdit", function(ok) {

    var err = document.getElementById("error");
    if (ok)
    {
          isChanging = false;
			    err.innerHTML = "";
          var form = document.getElementById("my_form");
          form.action = "/updateUser";
			    form.submit();
    }
    else
      err.innerHTML = "This login is used by another user"; 
  });
  
}

// Edit cancel button functionality
function cancelEdit(row) {

  var thead = row.parentNode.parentNode.parentNode;
  var node_to_replace = row.parentNode.parentNode;
  thead.replaceChild(replaced_node,node_to_replace);
  isChanging = false;
  document.getElementById("error").innerHTML = "";

}


// Delete button functionality
function deleteRow(row){

    var name = row.parentNode.parentNode.childNodes[2].innerHTML;
    var err = document.getElementById("error");
    validateUser(name,"online", function(ok) {
      if (ok)
        err.innerHTML = "Can not delete the user that is logged in";
      else
      {
        console.log("User is not online");
        err.innerHTML = "";

        var url = "/deleteUser";
        var httpRequest = new XMLHttpRequest();
        var params = 'login='+name;
        httpRequest.open("POST",url,true);
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
   
	      httpRequest.onreadystatechange=function()
	      {
		      if (httpRequest.readyState == 4 && httpRequest.status == 200)
		      {
            console.log("Delete is successful");
			      var parsedJson = JSON.parse(httpRequest.responseText);
			      if (parsedJson.result)
              location.reload();         
            else
              console.log("Server couldn't delete this row");
          }
        }
	    httpRequest.send(params);
      console.log("POST DELETE SENT");
      }
    });
}


