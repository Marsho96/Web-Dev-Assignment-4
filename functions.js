var name = "Cork, IE";
var latitude = "51.9010550";
var longitude = "-8.4818984";
var map;
var marker;
var bigPictures = [];
var currPos = 0;

window.addEventListener("load", makeMap);
window.addEventListener("load", start);
window.addEventListener("resize", centerDiv);
window.addEventListener("keydown", checkKey)
	
function start()
 {
	centerDiv();
	var check = document.getElementById("location");
	check.addEventListener("change", locations);
	document.getElementById("searchButton").onclick = flickr;
	load(latitude, longitude, name);
 }
 
function moveLeft(){
	if(bigPictures.length>0)
	displayImg(currPos - 1);
}

function moveRight(){
	if(bigPictures.length>0)
	displayImg(currPos + 1);
}

function makeMap(){
	map = L.map('map',{center: [latitude,longitude], zoom: 5});
	marker = L.marker([latitude,longitude]).addTo(map);	 
 }
 
function load(latitude, longitude, name){
	map.panTo(new L.LatLng(latitude, longitude));
	map.removeLayer(marker);
	marker = L.marker([latitude,longitude]).addTo(map);
	var markerHTML = "<h2>" + name + "</h2>";
	marker.bindPopup(markerHTML);
	
	tileTemplateURL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
	attrHTML = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' ;
	L.tileLayer(tileTemplateURL, {attribution: attrHTML }).addTo(map);

 }
 
function flickr()
 {
	document.getElementById("searchButton").innerHTML = "<img src = 'images/loader.gif'>";
	var loc = (document.getElementById("location").value);
	var tags = (document.getElementById("tags").value);
	var newTags = tags.split(' ').join(',');
	var newLoc = loc.split(' ');
	send_JSONP_Request("http://api.flickr.com/services/feeds/photos_public.gne?tags=" + newLoc + "," + newTags + "&tagmode=all&size=big&format=json&jsoncallback=getImages");
	
	}
 
 
 
function getImages(data) 
 {
	document.getElementById("innerDiv").innerHTML = "";
	document.getElementById("bigImg").innerHTML = "";
	if (data.items.length == 0)
	{
		var noResultsNode = document.createTextNode("No Results")
		document.getElementById("bigImg").appendChild(noResultsNode);
		document.getElementById("searchButton").innerHTML = "Find Images";
	}
	else
	{
		document.getElementById("innerDiv").style.display = "none";
		bigPictures = [];
		
		var nrOfImages = 10;
		if (data.items.length < nrOfImages)
		{
			nrOfImages = data.items.length;
		}
		for (var x=0; x<nrOfImages; x++)
		{ 
	
			var imageSrc = data.items[x].media.m;
				
			var removeM = imageSrc.lastIndexOf('m');
			var highResImage = imageSrc.substring(0, removeM) + 'b' + imageSrc.substring(removeM + 1);
				
			var imageIndex = x;
			bigPictures[imageIndex] = highResImage;
			i = document.createElement('img');
			i.setAttribute('id', x);
			i.setAttribute('class', "imgs");
			i.setAttribute('src', highResImage);
			i.setAttribute('onclick','displayImg(id);');
			i.style.opacity = "0.2";
			document.getElementById("innerDiv").appendChild(i);

			i.onload = function(){
				nrOfImages--;
				if (nrOfImages <= 0)
				{
					document.getElementById("innerDiv").style.display = "block";
					document.getElementById("searchButton").innerHTML = "Find Images";
				}
			}
		}
		
		
	}
 }
 
function checkKey(key){
	 if (key.keyCode == 37 && bigPictures.length>0)
	 {
		 displayImg(currPos - 1);
	 }
	 
	  if (key.keyCode == 39 && bigPictures.length>0)
	  {
		displayImg(currPos + 1);
	  }
 }
 
function displayImg(pos){
	 document.getElementById("bigImg").innerHTML = "";
	 if (pos>9)
	 {
		 pos=0;
	 }
	 if (pos<0)
	 {
		 pos = 9;
	 }
	 var a = document.createElement('img');
	 var width;
	 var height;
	 a.addEventListener("load", function(){
		 width = this.width;
		 height = this.height
		 if (width>=height)
		 {
			var containerW = document.getElementById("bigImg").offsetWidth;
			 a.width = containerW - 20;
			 var containerH = document.getElementById("bigImg").offsetHeight;
			 var imgH = a.height - 20;
			 a.style.marginTop = (containerH - imgH) /2;
		 }
		 else 
			 if(height>width)
			 {
				 var containerH = document.getElementById("bigImg").offsetHeight;
				 a.height = containerH - 20;
				 a.style.marginTop = 10;
			 }
	 });
	 
	 a.setAttribute('src', bigPictures[pos]);
	 centerImage(pos);
	 currPos = pos - 1;
	 currPos = currPos + 1;
	 document.getElementById("bigImg").appendChild(a);
 }
 
function centerImage(pos){
	for ( var x = 0; x<bigPictures.length; x++)
	{
		document.getElementById(x).style.opacity = "0.2";
	}
	 document.getElementById(pos).style.opacity = "1";
	 var innerLeftOffset = document.getElementById(pos).offsetLeft;
	 var halfOuterW = document.getElementById("outerDiv").offsetWidth / 2;
	 var halfImageW = document.getElementById(pos).offsetWidth / 2;
	 
	 var outerLeftOffset = halfOuterW - halfImageW;
	 
	 var leftPos = outerLeftOffset - innerLeftOffset;
	 
	 document.getElementById("innerDiv").style.left = leftPos + "px";
}

function locations(){
	l1 = (document.getElementById("location").value);
	send_JSONP_Request("http://www.mapquestapi.com/geocoding/v1/address?key=ocvpN72LIXopQw6651b6to7GdAtRMe1Q&location=" + 
	l1 + "&callback=getAddress");
	}
	
function send_JSONP_Request(request){
	newScript = document.createElement('script');
	newScript.setAttribute('src', request);
	document.getElementsByTagName('head')[0].appendChild(newScript);
	}
	
function getAddress(data){
		
		latitude = data.results[0].locations[0].latLng.lat;
		longitude = data.results[0].locations[0].latLng.lng;
		name = data.results[0].locations[0].adminArea5 + ", " + data.results[0].locations[0].adminArea1;
		load(latitude, longitude, name);
	}

function centerDiv(){
	var w = window.innerWidth;
	var center = w/2;
	var halfDiv = 400;
	var pos = center - halfDiv;
	document.getElementById("outerDiv").setAttribute("style", "left: " + pos + "px;");
	document.getElementById("bigImg").setAttribute("style", "left: " + pos + "px;");
}