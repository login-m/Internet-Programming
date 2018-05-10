function ValidateInput(){
  var name = document.addPlace.placename.value;
  var address1 = document.addPlace.addressline1.value;
  var address2 = document.addPlace.addressline2.value;
  var regex = /^[0-9a-zA-Z]+$/;
  if (name.match(regex) && address1.match(regex) && address2.match(regex))
    return true;
  alert("Place Name and address must be alphanumeric")
  return false;
}
