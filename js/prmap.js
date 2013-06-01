var PRMap = klass(function (options) {
  this.options = options;
  this.options.tiles = Array.isArray(options.tiles) ? options.tiles : [options.tiles];
  this.options.events = options.events || {};
  this.paths = {};
  this.paths['barrios'] = "../geotiles/barrios-geo.json";
  this.paths['pueblos'] = "../geotiles/pueblos-geo.json";
  this.draw();
})
.methods({
	draw: function () {
    var self = this;
    var width = 960,
      height = 300;
    var color_scale = d3.scale.category20b();
    var svg = d3.select(this.options.node).append("svg")
      .attr("width", width)
      .attr("height", height);

    var projection = d3.geo.mercator()
      .scale(125000)
      .center([-66.401367,18.23033])
      .translate([width / 2, height / 2]);

    var path = d3.geo.path()
      .projection(projection);

    this.options.tiles.forEach(function(tile){
      d3.json(self.paths[tile], function(error, data) {
        // var barrios_path = topojson.feature(barrios, barrios.objects.barrios);
      self.top_map = svg.selectAll("." + tile)
        .data(data.features)
        .enter()
          .append("path")  
            .attr("d", path)
            .attr("class", tile)
            .style("stroke-width", tile == "barrios" ? 1 : 2)
            // .style("fill", function(d){return color_scale(Math.floor(Math.random()*20))})
            .style("fill", "rgba(255,255,255,0)")
            .style("stroke", "#333")
            .on("click",self.options.events.on_click)
            .on("mouseover", function(d){
              d3.select(this).style("stroke-width", 3);
              self.options.events.on_mouseover && self.options.events.on_mouseover(d,this);
            })
            .on("mouseout", function(d){
              d3.select(this).style("stroke-width", tile == "barrios" ? 1 : 2);
              self.options.events.on_mouseout && self.options.events.on_mouseout(d,this);
            });
      self.tile_attribute = tile == 'barrios' ? "GEO_ID" : "COUNTY";
      if(tile == self.options.tiles[self.options.tiles.length -1]){
        self.options.on_ready();
      }
    });
  });
},
encode_qual: function(datamap, colormap){

  this.top_map
    .style("fill", function(d){
      return colormap[datamap[d.properties.COUNTY || d.properties.GEO_ID]];
    });
},
encode_quan: function(datamap){
  var min, max;
  var a = [];
  var self = this;
  Object.keys(datamap).forEach(function(k){
    a.push(+datamap[k]);
  });
  var domain = [d3.min(a), d3.max(a)];
  console.log(domain)
  var quantize = d3.scale.quantize()
      .domain(domain)
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
  this.top_map
    .style("fill", undefined)
    .attr("class", function(d){
      console.log(self.tile_attribute)
      return quantize(+datamap[d.properties[self.tile_attribute]]) || "grey";
    });
}
})
