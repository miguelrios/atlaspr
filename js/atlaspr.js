var AtlasPR = klass(function (options) {
  this.options = options;
  this.tiles = Array.isArray(options.tiles) ? options.tiles : [options.tiles || 'isla'];
  this.main_tile = this.tiles[0];
  this.options.events = options.events || {};
  //WARNING: only here for github pages version of lib
  this.path = "http://miguelrios.github.io/atlaspr/geotiles/puertorico-geo.json";
  this.maps = {};
  this.meta_attributes = {
    "barrios": {
      width: 1,
      id: "GEO_ID"
    },
    "pueblos": {
      width: 2,
      id: "COUNTY"
    },
    "isla":{
      width: 3,
      id: "GEOID"
    }
  };
  this.size_attributes = {
    "small": {
      width: 480,
      height: 160,
      scale: 23000
    },
    "medium": {
      width: 960,
      height: 320,
      scale: 23000
    },
    "large": {
      width: 1200,
      height: 400,
      scale: 23000
    }
  };
  this.width = this.size_attributes[this.options.size || "medium"].width;
  this.height = this.width/3;
  this.scale = this.width*27;
  this.draw();
})
.methods({
	draw: function () {
    var self = this;
    
    var color_scale = d3.scale.category20b();
    var svg = d3.select(this.options.node).append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    var projection = d3.geo.mercator()
      .scale(this.scale)
      .center([-66.251367,18.20033])
      .translate([this.width/2,this.height/2])
      // .translate([width / 2, height / 2]);

    d3.json(self.path, function(error, data) {
      // zoom to island
      var path = d3.geo.path()
        .projection(projection);

      self.tiles.forEach(function(tile){
        var width = self.meta_attributes[tile].width;
        var tiletype = self.meta_attributes[tile].id;
        self.maps[tile] = svg.selectAll("." + tile)
          .data(data[tile].features)
          .enter()
            .append("path")  
              .attr("d", path)
              .attr("class", tile)
              .attr("data-tiletype",tiletype)
              .attr("data-name",function(d){return d.properties.NAME})
              .style("stroke-width", width)
              .style("fill", "rgba(255,255,255,0)")
              .style("stroke", "#333")
              .on("click",self.options.events.on_click)
              .on("mouseover", function(d){
                d3.select(this).style("stroke-width", 3);
                self.options.events.on_mouseover && self.options.events.on_mouseover(d,this);
              })
              .on("mouseout", function(d){
                d3.select(this).style("stroke-width", width);
                self.options.events.on_mouseout && self.options.events.on_mouseout(d,this);
              });
      });
      if(self.options.on_ready){
        self.options.on_ready(self.maps);
      }
    });
  },
  encode_qual: function(datamap, colormap){
    this.maps[this.main_tile]
      .style("fill", function(d){
        var id = d.properties[d3.select(this).attr("data-tiletype")];
        return colormap[datamap[id]];
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
    
    var quantize = d3.scale.quantize()
        .domain(domain)
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

    this.maps[this.main_tile]
      .style("fill", undefined)
      .attr("class", function(d){
        var id = d.properties[d3.select(this).attr("data-tiletype")];
        return quantize(+datamap[id]) || "grey";
      });
  }
})
