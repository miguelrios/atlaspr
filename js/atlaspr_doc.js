// AtlasPR
// =====

// **AtlasPR** is a small library to generate interactive, detailed and customizable
// maps of Puerto Rico. It's built in top of the awesome [d3.js](http:d3js.org), 
// a library to manipulate documents based on data.

// AtlasPR maps are generated using [Scalable Vector Graphics (SVG)](http:www.w3.org/Graphics/SVG/), 
// a web standard that's supported in all modern web browsers. Sadly, it doesn't work in IE 8 or less.

// Usage
// -----
// AtlasPR relies heavily in configuration parameters, but adds flexibility with 
// functions to manipulate the maps and perform actions in them. The underlying geo data
// and SVG elements being drawn are also exposed in the API, so you can go crazy if that's your thing. 

// Ok, let's create a basic map. 

new AtlasPR();

// That's it. That will generate an empty map with boundaries in every minucipality on the island.
// This map will be appened to your HTML document. But you probably want to have more flexibility than that.
// right? Ok. 

// Assuming you have a ```<div id ='map'></div>``` somewhere in your HTML, you can do:

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node
});

// This will render the map in your div element. 

// ```node``` is an optional parameter. It accepts an HTML object, 
// like the ```<div>``` element we just passed. By **default** it's the ```body``` object.

// But now the map will have a predetermined size (960px x 320px). 
// You may want to control this too. Let's see... right now, there are four possible sizes, 
// you can control this by adding the parameter ```size``` to the options. This is not optimal,
// in the future, i'd like the maps to be bounded to the parent element. But that's another story. 

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node, 
 size: "large"
});

// ```size``` is an optional parameter. It's a string, with four possible values. 

// - ```small```: 480px x 160px
// - ```medium```: 960px x 320px
// - ```large```: 1200px x 400px
// - ```xlarge```: 2400px x 800px

// By **default** this parameter is ```medium```.

// The municipalities map is nice, but you may want more details. Let's see you want to 
// draw a map with all the barrios in it. Puerto Rico has more than 900 barrios. 
// AtlasPR can draw all of them for you by adding a simple parameter, ```tiles```.

// Let's start with a simple one. 
// Let's draw only all the barrios. 

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node, 
 size: "large", 
 tiles: "barrios"
 });

// ```tiles``` can be either a single string or an array of them and it's ```pueblos``` by default. 
// There are three supported options right now: 

// - ```isla```: draw the outline of Puerto Rico, including Vieques and Culebra
// - ```pueblos```: draw the outline of all 78 municipalities.
// - ```barrios```: draw the outline of all 902 barrios.

// You can combine these tiles to draw an even more detailed map. Here's an example of
// using all three of them: 

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node, 
 size: "large", 
 tiles: ["isla", "pueblos", "barrios"]
});

// This will draw the island borders, the municipalities borders and the barrios borders.

// Now, one of the beauties of SVG is that the graphics are scalable. You can zoom them in 
// and they will preserve their details. Let's try this by adding the ```zoom``` property
// to the options object: 

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node, 
 size: "large", 
 tiles: ["isla", "pueblos", "barrios"], 
 zoom: true
});

// Now hover over the map and double click, or zoom it in gradually by scrolling. 
// You can also move the map around by dragging it. Isn't that awesome?

// ```zoom``` is a boolean option and is ```false``` by **default**.

// When you hover a map with either pueblos or barrios boundaries, you can see there's 
// a ticker border in the hovered items. You can attach other actions if you want, 
// like showing a message when you hover or better, when you click an element. 

// For this, there's the ```events``` parameter, which is an object with two supported options:

// - ```on_click(feature, svg_path)```: Executed whenever you click a tile. It contains two objects you can manipulate: 
//   - ```feature```: The GeoJSON feature you clicked. Useful if you want to know information about the object you clicked (e.g. the name of the minucipality). Read more on GeoJSON features.
//   - ```svg_path```: The SVG ```path``` element you are clicking. Useful to manipulate visual information about it (e.g.: change its color to red). Read more about these SVG objects.
// - ```on_hover(feature, svg_path)```: Executed whenever you hover over a tile. It contains two objects you can manipulate: ```feature``` and ```svg_path```, explained above in ```on_click```.

// Let's code an example. Easy, whenever you click on a municipality, let's show a message with it's name. 

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node, 
 size: "large", 
 tiles: ["pueblos"], 
 zoom: true,
 events: {
  on_click: function(feature, svg_path){alert(feature.properties.NAME);}
 }
});

// Not that hard, right? Now let's change the color of the hovered barrio to red. 

var my_node = document.getElementById("map");
new AtlasPR({
 node: my_node, 
 size: "large", 
 tiles: ["barrios"], 
 zoom: true,
 events: {
  on_hover: function(feature, svg_path){d3.select(svg_path).style("fill", "red")}
 }
});

// Performing actions on maps
// --------------------------
// Now to the cool part. AtlasPR has support for performing some actions after drawing the maps. 
// The tiles used to render the maps are rendered asynchronously, so anything we want to do to the map
// after drawing it has to be done as a callback function that will be executed after the map is rendered.

// That function can be passed as the ```on_ready``` parameter in the options object. This function has
// the AtlasPR map as a parameter, so you can perform the supported actions or even manipulate the SVG yourself
// using d3.

// Confusing? I know. Let's do some examples to clarify things up. One of the supported functions is called ```AtlasPR.zoom_to_pueblo```.
// This function takes the name of a municipality and zooms the map into it. It calculate the exact zoom that;s necessary to show the 
// municipality without clipping it or not zooming enough. Let's try this. 

var my_node = document.getElementById("map");
function zoom_to_barranquitas(atlaspr){
  atlaspr.zoom_to_pueblo("Barranquitas");
}
new AtlasPR({
  node: my_node,
  size: "large",
  tiles: ["pueblos"], 
  zoom: true,
  on_ready: zoom_to_barranquitas
});

// ```zoom_to_pueblo``` accepts an optional second parameter, a callback that will be executed after the map zooms to the specified pueblo.

var my_node = document.getElementById("map");
function zoom_to_barranquitas(atlaspr){
  atlaspr.zoom_to_pueblo("Barranquitas", function(){
    atlaspr.zoom_to_original();
  });
};
new AtlasPR({
  node: my_node,
  size: "large",
  tiles: ["pueblos"], 
  zoom: true,
  on_ready: zoom_to_barranquitas
});

// Whaaa? What's ```zoom_to_original``` you ask? It's another supported function that zooms a map back to the original view. It also accepts a callback so you can do something after the map gets zoomed to the original view. 

var my_node = document.getElementById("map");
function zoom_to_barranquitas(atlaspr){
  atlaspr.zoom_to_pueblo("Barranquitas", function(){
    atlaspr.zoom_to_original(function(){alert("cool?")});
  });
};
new AtlasPR({
  node: my_node,
  size: "large",
  tiles: ["pueblos"], 
  zoom: true,
  on_ready: zoom_to_barranquitas
});

// Coloring maps
// -------------

// AtlasPR supports two ways of coloring tiles in maps, ```encode_qual``` and ```encode_quan```. The first one accepts a map from
// the id of a municipality or barrio to a particular color, the second one accepts a map from the id of a municipality or barrio
// to a number, we do the coloring for you. 

// Examples: 

// Coloring municipalities either red or blue, depending on which party is in power (data in https://github.com/commonwealth-of-puerto-rico/atlaspr/blob/master/data/).

var my_node = document.getElementById("map");
d3.json("data/munidata.json", function(data){
  var party_datamap = {};
  data.forEach(function(pueblo){
    var fips_3digits = pueblo.fips.length == 1 ? ("00" + pueblo.fips) : 
      (pueblo.fips.length == 2 ? ("0" + pueblo.fips) : pueblo.fips);
    party_datamap[fips_3digits] = pueblo.party;
  });
  var party_map = new AtlasPR({node: my_node, size: "large",tiles: 'pueblos', on_ready: function(){
    party_map.encode_qual(party_datamap, {"PPD": "#ff0000", "PNP": "#0000ff"});
  }});
});

// ```AtlasPR.encode_qual(datamap, colormap)``` accepts a map of pueblo or barrio id to a string value, and a second parameter
// with a map from possible values (in this case PPD and PNP) to the colors you want to color the map.

// Coloring barrios by the percentage of families over poverty levels (data in https://github.com/commonwealth-of-puerto-rico/atlaspr/blob/master/data/).

var my_node = document.getElementById("pobreza-map");
d3.json("data/barriosdata.json", function(data){
  var pob_datamap = {};
  data.forEach(function(barrio){
    if(barrio.below_poverty != null){
      pob_datamap[barrio.geo_id.substring(14)] = barrio.below_poverty;
    }
  });
  var pop_map = new AtlasPR({node: my_node, tiles: 'barrios', size: "large", on_ready: function(){
    pop_map.encode_quan(pob_datamap);
  }});
});

// ```AtlasPR.encode_quan``` accepts one parameter: a map from pueblo or barrio id to the number you want to map. 