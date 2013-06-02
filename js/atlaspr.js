var AtlasPR = klass(function (options) {
  this.options = options;
  this.tiles = Array.isArray(options.tiles) ? options.tiles : [options.tiles || 'isla'];
  this.main_tile = this.tiles[0];
  this.options.events = options.events || {};
  this.path = "../geotiles/puertorico-geo.json";
  this.maps = {};
  this.map_type = this.options.map_type || "simple";
  this.center = [-66.251367,18.20033];
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
    d3.select(this.options.node)
      .style("width", this.width + "px")
      .style("height", this.height + "px");

    if(this.map_type == 'multilayer'){
      this.leaflet_map = new L.Map(this.options.node, {
            center: this.center.reverse(),
            zoom: 9
          })
          // get your own api key at cloudmade.com
          .addLayer(new L.TileLayer("http://{s}.tile.cloudmade.com/3a2a10a1869e40c7b80e1ebd2d53696c/97799/256/{z}/{x}/{y}.png"));
    
      this.project_fn = function project(x) {
        var point = self.leaflet_map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
        return [point.x, point.y];
      }
      var svg = d3.select(self.leaflet_map.getPanes().overlayPane).append("svg").attr("class", "parent"),
        container = svg.append("g").attr("class", "leaflet-zoom-hide container");
    } else{
      this.project_fn = d3.geo.mercator()
        .scale(this.scale)
        .center([-66.251367,18.20033])
        .translate([this.width/2,this.height/2]);
      var container = d3.select(this.options.node).append("svg");
    } 
    var color_scale = d3.scale.category20b();

    d3.json(self.path, function(error, data) {
      // zoom to island
      var path = d3.geo.path().projection(self.project_fn),
        bounds = d3.geo.bounds(data.isla);

      self.tiles.forEach(function(tile){
        var width = self.meta_attributes[tile].width;
        var tiletype = self.meta_attributes[tile].id;
        self.maps[tile] = container.selectAll("." + tile)
          .data(data[tile].features)
          .enter()
            .append("path")  
              .attr("d", path)
              .attr("class", tile)
              .attr("data-tiletype",tiletype)
              .attr("data-name",function(d){return d.properties.NAME})
              .style("stroke-width", width)
              .style("fill", "rgba(255,255,255,0)")
              .style("fill-opacity", self.map_type == "simple" ? 1 : 0.66)
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
      if(self.map_type == 'multilayer'){
        self.leaflet_map.on("viewreset", reset);
        reset();
        function reset(){
          var bottomLeft = self.project_fn(bounds[0]),
              topRight = self.project_fn(bounds[1]);

          svg.attr("width", topRight[0] - bottomLeft[0])
              .attr("height", bottomLeft[1] - topRight[1])
              .style("margin-left", bottomLeft[0] + "px")
              .style("margin-top", topRight[1] + "px");

          container.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

          self.tiles.forEach(function(tile){
            self.maps[tile].attr("d", path);
          });
        }
      }

      // optional callback
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
  },
  zoom: function(multiplier){
    
  },
  get_leaflet_map: function(){
    return this.leaflet_map;
  }
})
