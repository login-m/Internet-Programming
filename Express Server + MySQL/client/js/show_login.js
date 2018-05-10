
//Show currently logged in user;
(function() {
  var url2 = "/getCurrentUser";
  var xmlhttp2;
  xmlhttp2 = new XMLHttpRequest();
  xmlhttp2.open("GET",url2,true);
  xmlhttp2.send();


  xmlhttp2.onreadystatechange=function()
  {
    if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200)
    {
      var parsedJson = JSON.parse(xmlhttp2.responseText);
      var response = parsedJson;
      document.getElementById("loguser").innerHTML = "Welcome " + response.username +"!";
    }
  }
})();
