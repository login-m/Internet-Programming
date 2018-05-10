"use strict";

(function() {
	// the API end point
	var url = "/getListOfFavPlaces";
	
	// 1. Hit the getListOfFavPlaces end-point of server using AJAX get method
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
	
	// 2. Upon successful completion of API call, server will return the list of places
   //    Use the response returned to dynamically add rows to 'myFavTable' present in favourites.html page
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			// Parse and count how many elements in JSON
			var parsedJson = JSON.parse(xmlhttp.responseText);
			var placeList = parsedJson.res.placeList;	
			var count = Object.keys(placeList).length;
			
			// For every element, create a row and populate each column
			for (var i = 0; i < count; i++){			
			  var tr = document.createElement("tr");
			  var newHTML = "";
			  for (var key in placeList[i]){	  
					newHTML += placeList[i][key];	 
					
					// Concat those two cases	
					if (key == "addressline1" || key == "opentime"){
						newHTML+="\n"						
						continue;			  	
					}	
				
					// Populate a cell
			   	var tabCell = tr.insertCell(-1);
			   	tabCell.innerHTML = newHTML;
			   	newHTML = "";		
			  }
			  
			  // Append new row to tbody (second child of table)
			  document.getElementById("myFavTable").childNodes[1].appendChild(tr);		
		   }
		}
	}
})();

