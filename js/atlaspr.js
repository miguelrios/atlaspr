var AtlasPR = klass(function (options) {
  this.options = options; 
  this.node = this.options.node; 
  this.tiles = Array.isArray(options.tiles) ? options.tiles : [options.tiles || 'isla'];
  this.main_tile = this.tiles[0];
  this.options.events = options.events || {};
  // hack to make github pages work.
  this.geotiles_path = 
    (document.URL.indexOf("github") > 0 ? "http://miguelrios.github.io/atlaspr" : "..") + "/geotiles/PATHGEN.json";
  this.center_ll = [-66.251367,18.20033];
  this.colors = d3.scale.category20c();
  this.maps = {};
  this.meta_attributes = {
    "barrios": {
      width: 1,
      id: "COUSUB"
    },
    "pueblos": {
      width: 2,
      id: "COUNTY"
    },
    "isla":{
      width: 3,
      id: "STATE"
    }
  };
  this.size_attributes = {
    "small": {
      width: 480,
    },
    "medium": {
      width: 960
    },
    "large": {
      width: 1200
    },
    "xlarge": {
      width: 2400
    }
  };
  this.width = this.size_attributes[this.options.size || "medium"].width;
  this.height = this.width/3;
  this.original_scale = this.width*27;
  this.draw();
})
.methods({
  draw: function () {
    var self = this;
    
    var color_scale = d3.scale.category20b();
    self.svg = d3.select(this.node || "body").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .call(d3.behavior.zoom().on("zoom", this.options.zoom && redraw));

    self.projection = d3.geo.mercator()
      .scale(self.original_scale)
      .center(self.center_ll)
      .translate([this.width/2,this.height/2]);

    self.translation = self.projection.translate(); // the projection's default translation
    self.scale = self.projection.scale(); // the projection's default translation
    self.path_fn = d3.geo.path()
        .projection(self.projection);

    d3.json(self.geotiles_path.replace("PATHGEN", self.tiles.sort().join("+")), function(error, data) {
      // zoom to island
      self.data = data;
      self.indexed_data = {};

      self.tiles.forEach(function(tile){
        var width = self.meta_attributes[tile].width;
        var tiletype = self.meta_attributes[tile].id;
        self.indexed_data[tile] = {};

        self.maps[tile] = self.svg.selectAll("." + tile)
          .data(data[tile].features)
          .enter()
            .append("path")  
              .attr("d", self.path_fn)
              .attr("class", tile)
              .attr("data-tiletype",tiletype)
              .attr("data-name",function(d){
                var id = d.properties[self.meta_attributes[tile].id];
                self.indexed_data[tile][id] = d;
                if(d.properties.NAME){
                  self.indexed_data[tile][d.properties.NAME.toLowerCase()] = d;
                }
                return d.properties.NAME})
              .style("stroke-width", width)
              .style("fill", "rgba(255,255,255,0)")
              .style("stroke", "#333")
              .on("click", function(d){self.options.events.on_click && self.options.events.on_click(d, this)})
              .on("mouseover", function(d){
                d3.select(this).style("stroke-width", 3);
                self.options.events.on_mouseover && self.options.events.on_mouseover(d,this);
              })
              .on("mouseout", function(d){
                d3.select(this).style("stroke-width", width);
                self.options.events.on_mouseout && self.options.events.on_mouseout(d,this);
              });
      // add labels, optionally
      self.options.labels && self.svg.selectAll(".labels-pueblo")
          .data(data.pueblos.features)
          .enter()
            .append("text")
            .attr("transform", function(d) { return "translate(" + self.path_fn.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .attr("class", "labels-pueblo")
            .text(function(d) {return d.properties.NAME; })
            .style("fill", "#555")
            .style("fill-opacity", 0.5)
            .style("font-size", 12)
            .style("text-anchor", "middle");
      });

      if(self.options.on_ready){
        self.options.on_ready(self);
      }
    });
    function redraw() {
      // d3.event.translate (an array) stores the current translation from the parent SVG element
      // t (an array) stores the projection's default translation
      // we add the x and y vales in each array to determine the projection's new translation
      var tx = self.translation[0] * d3.event.scale + d3.event.translate[0];
      var ty = self.translation[1] * d3.event.scale + d3.event.translate[1];
      self.projection.translate([tx, ty]);

      // now we determine the projection's new scale, but there's a problem:
      // the map doesn't 'zoom onto the mouse point'
      self._update();
    }
  },
  
  add_markers: function(markers_list){
    var self = this;
    self.svg.selectAll(".markers")
      .data(markers_list)
      .enter()
        .append("svg:circle")
        .attr("r", 4.5)
        .attr("class", "markers")
        .attr("cx", function(d){return self.projection(d.center)[0]})
        .attr("cy", function(d){return self.projection(d.center)[1]})
        .style("fill", self.colors(0))
        .style("stroke-width", 2)
        .style("stroke", "#333");
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
    
    var quantize = d3.scale.linear()
        .domain(domain)
        .range(["rgb(247,251,255)", "rgb(8,48,107)"]);

    this.maps[this.main_tile]
      .style("fill", function(d){
        var id = d.properties[d3.select(this).attr("data-tiletype")];
        return quantize(+datamap[id]) || "rgb(200,200,200)";
      });
  },
  zoom_to_pueblo: function(geo_id, callback){
    var self = this;
    // reset map
    self.projection
      .scale(self.original_scale)
      .center(self.center_ll)
      .translate([this.width/2,this.height/2]);
    var pueblo = self.indexed_data.pueblos[geo_id.toLowerCase()];
    var old_bounds = self.path_fn.bounds(pueblo);
    var pueblo_name = pueblo.properties.NAME; 
    var pueblo_width = Math.abs(old_bounds[1][0] - old_bounds[0][0]);
    var pueblo_height = Math.abs(old_bounds[1][1] - old_bounds[0][1]);
    var scalar = 1;
    if(pueblo_height/self.height >= pueblo_width/self.width){
      scalar = self.height/pueblo_height;
    } else{
      scalar = self.width/pueblo_width;
    }
    self.projection.scale(self.projection.scale()*scalar*0.95);
    var bounds = self.path_fn.bounds(pueblo);
    var center_x = (bounds[1][0] + bounds[0][0])/2;
    var center_y = (bounds[1][1] + bounds[0][1])/2;
    var center = [self.width - center_x, self.height-center_y];
    self.projection.translate(center);
    self.translation = self.projection.translate();
    self.scale = self.projection.scale();
    self.svg.selectAll("path")
      .transition()
        .duration(3000)
        .attr("d", self.path_fn)
        .each("end", function(d){
          if(d.properties.NAME == pueblo.properties.NAME && d.properties.COUSUB == pueblo.properties.COUSUB && callback){
            callback(d,this);
          }
        });
    //update the position of labels, if any
    self.options.labels && self.svg.selectAll(".labels-pueblo")
      .transition()
      .duration(3000)
      .attr("transform", function(d) {return "translate(" + self.path_fn.centroid(d) + ")"; });

    //update the position of markers if any
    self.svg.selectAll(".markers")
      .transition()
      .duration(3000)
      .attr("cx", function(d){return self.projection(d.center)[0]})
      .attr("cy", function(d){return self.projection(d.center)[1]});
  },

  zoom_to_original: function(callback){
    var self = this;
    self.projection
      .scale(self.original_scale)
      .center(self.center_ll)
      .translate([this.width/2,this.height/2]);
    self.svg.selectAll("path")
      .transition()          
        .duration(2000)
        .attr("d", self.path_fn);

    //update state
    self.translation = self.projection.translate();
    self.scale = self.projection.scale();
    
    // update the position of labels, if any
    self.options.labels && self.svg.selectAll(".labels-pueblo")
      .transition()
      .duration(2000)
      .attr("transform", function(d) {return "translate(" + self.path_fn.centroid(d) + ")"; });

    //update the position of markers if any
    self.svg.selectAll(".markers")
      .transition()
      .duration(3000)
      .attr("cx", function(d){return self.projection(d.center)[0]})
      .attr("cy", function(d){return self.projection(d.center)[1]});
  },
  get_barrios_mapping: function(){
    /* to be implemented */
  },
  get_pueblos_mapping: function(){
    /* to be implemented */
  },

  //Private, undocumented functions.
  _zoom_to_random_pueblo: function(callback){
    var p = this.data.pueblos.features[Math.round(Math.random()*(this.data.pueblos.features.length - 1))];
    this.zoom_to_pueblo(p.properties.COUNTY, callback);
    return p;
  },

  _update: function(){
    var self = this;
    self.projection.scale(self.scale * d3.event.scale);
    self.svg.selectAll("path").attr("d", self.path_fn);
    self.svg.selectAll(".labels-pueblo").attr("transform", function(d) {;return "translate(" + self.path_fn.centroid(d) + ")"; })
    self.svg.selectAll(".markers").attr("cx", function(d){return self.projection(d.center)[0]})
      .attr("cy", function(d){return self.projection(d.center)[1]})
  },
})
