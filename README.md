AtlasPR
=====

Free, open, interactive, detailed maps of Puerto Rico for your web applications.

![AtlasPR](https://raw.github.com/miguelrios/atlaspr/master/images/blank.png)

### Notice

Documentation for this project, including basic how tos is in progress. Visit our [homepage](http://miguelrios.github.io/atlaspr) and [examples page](http://miguelrios.github.io/atlaspr/examples.html) in the meantime. 

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

### Acknoledgements
This library is just a few lines of code written in the shoulders of an awesome giant called [d3.js](htttp://d3js.org).

### Contributions
Feel free to open issues whenever you find a bug or think about that awesome feture you want implemented in this library. Even better, fork the repo, implement them and submit a pull request.