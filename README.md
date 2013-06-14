AtlasPR
=====

Free, open, interactive, detailed maps of Puerto Rico for your web applications.

![AtlasPR](https://raw.github.com/miguelrios/atlaspr/master/images/blank.png)

### Notice

Documentation for this project, including basic how tos is in progress. Visit our [homepage](http://miguelrios.github.io/atlaspr) and [examples page](http://miguelrios.github.io/atlaspr/examples.html) in the meantime. 

**This is my fork of Miguel's AtlasPR** It should be mostly the same, but I have ironed it out in some places or just changed it to how I like it.

### Usage
1. [Download the library](https://github.com/commonwealth-of-puerto-rico/atlaspr/archive/master.zip).
2. Unzip it (by default the directory will be called ```atlaspr-master```).
3. Create a new directory: ```mkdir mymaps```.
4. Copy the javascript code and geotiles from Atlas to your directory: 
```cp -r atlaspr-master/js mymaps/
   cp -r atlaspr-master/geotiles mymaps/```
5. Create an html file inside mymaps with this: 

```html
<!DOCTYPE html>
<meta charset="utf-8">
<script src="./js/lib/d3.js"></script>
<script src="./js/lib/klass.js"></script>
<script src="./js/atlaspr.js"></script>
<body>
  <div id = 'map'></div>
  <script type = 'text/javascript'>
    var node = document.getElementById("map");
    new AtlasPR({node: node, tiles: ['pueblos']});
  </script>
```
6. Run in your terminal: ```python -m SimpleHTTPServer```
7. Go to localhost:8000 in your web browser. 
8. Go crazy!

### API Documentation
AtlasPR makes it easy to developers who want to color maps of Puerto Rico by pueblo or barrio; add markers and other functionality. We are in the process of documenting all the possible options. In the meantime, visit the [examples page](http://miguelrios.github.io/atlaspr/examples.html) to see what's possible.

### Compatibility
AtlasPR does not work in old browsers, particularly in Internet Explorer 8 and less. This is because we use SVG to render tiles. SVG is a web standard for scalable web graphics, and it's implemented in every modern browser.

### Acknowledgements
This library is just a few lines of code written in the shoulders of an awesome giant called [d3.js](htttp://d3js.org).

### Contributions
Feel free to open issues whenever you find a bug or think about that awesome feature you want implemented in this library. Even better, fork the repo, implement them and submit a pull request.

### Documentation [in progress]
Reading through Miguel source there seem to be about 10 functions:
	
	draw()

	update()

	add_markers()

	encode_quan()

	encode_qual()

	zoom_to_pueblo()

	_zoom_to_random_pueblo()

	zoom_to_original()

	get_barrios_mapping()

	get_pueblos_mapping()

as well as a bunch of options for labels and mouse events:

	options.events
	
	options.size
	
	options.events.on_click
	
	options.events.on_mouseover
	
	options.events.on_mouseout
	
	options.labels
	
	options.on_ready

With more options possible to add.

Note that AtlasPR draws maps in a 3:1 aspect ratio.

In order to interact with the tiles, we need the `d3.js` projection used by AtlasPR:

    self.svg = d3.select(this.options.node).append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .call(d3.behavior.zoom().on("zoom", this.options.zoom && redraw));

    self.projection = d3.geo.mercator()
      .scale(self.original_scale)
      .center(self.center_ll)
      .translate([this.width/2,this.height/2]);


    self.translation = self.projection.translate(); // the projection's default translation
    self.scale = self.projection.scale(); // the projection's default translation
      // .translate([width / 2, height / 2]);
    self.path_fn = d3.geo.path()
        .projection(self.projection);