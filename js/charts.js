function renderWordCloud(){

  var diameter = 900,
      format = d3.format(",d");

  var color = d3.scale.ordinal()
      .range(["#00C020", "#A45132", "#F55C00", "#F10500", "#F4F4F2"]);


  var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(1.5);

  var svg = d3.select("#religion-bubbles").append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");

  d3.json("data/flare.json", function(error, root) {
    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(root))
        .filter(function(d) { return !d.children; }))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.className + ": " + format(d.value); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.packageName); });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.className.substring(0, d.r / 3); });
  });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: name, className: node.name, value: node.size});
    }

    recurse(null, root);
    return {children: classes};
  }

  d3.select(self.frameElement).style("height", diameter + "px");

}

renderWordCloud();

function renderNoReligion(){

  var margin = {top: 40, right: 20, bottom: 30, left: 40},
      width = 850 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var formatPercent = d3.format("");

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>No religion:</strong> <span style='color:red'>" + d.frequency + "%</span>";
    })
    
  var svg = d3.select("#no-religion").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

  svg.call(tip);

  d3.tsv("data/no-religion-data.tsv", type, function(error, data) {
    x.domain(data.map(function(d) { return d.Year; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage");

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Year); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

  });

  function type(d) {
    d.frequency = +d.frequency;
    return d;
  }
}

renderNoReligion();

function renderNoReligionAge(){
  var margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = 850 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.ordinal()
      .range(["#003869", "#DE0071", "#8F5F59"]);


  var Years = d3.format(Number.toString);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(d3.time.format("%y"))
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.Years); })
      .y(function(d) { return y(d.percentage); });

  var svg = d3.select("#no-religion-age").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.tsv("data/no-religion-age.tsv", function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Years"; }));

    data.forEach(function(d) {
      d.Years = parseDate(d.Years);
    });

    var sex = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {Years: d.Years, percentage: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.Years; }));

    y.domain([
      d3.min(sex, function(c) { return d3.min(c.values, function(v) { return v.percentage; }); }),
      d3.max(sex, function(c) { return d3.max(c.values, function(v) { return v.percentage; }); })
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

     svg.append("text")            
        .attr("x", 340 )
        .attr("y",  440 )
        .style("text-anchor", "middle")
        .text("Age");


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage");

    var sex = svg.selectAll(".sex")
        .data(sex)
      .enter().append("g")
        .attr("class", "sex");

    sex.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });

    sex.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.Years) + "," + y(d.value.percentage) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

  });

}

renderNoReligionAge();

function renderMarriageCeremonies(){
  var radius = 100,
      padding = 10;

  var color = d3.scale.ordinal()
      .range(["#47728D", "#002941"]);

  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.population; });

  d3.tsv("data/marriage-data.tsv", function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

    data.forEach(function(d) {
      d.ages = color.domain().map(function(name) {
        return {name: name, population: +d[name]};
      });
    });

    var legend = d3.select("#marriage-ceremonies").append("svg")
        .attr("class", "legend")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
      .selectAll("g")
        .data(color.domain().slice().reverse())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    var svg = d3.select("#marriage-ceremonies").selectAll(".pie")
        .data(data)
      .enter().append("svg")
        .attr("class", "pie")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
      .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    svg.selectAll(".arc")
        .data(function(d) { return pie(d.ages); })
      .enter().append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); });

    svg.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.Year; });

  });
}
renderMarriageCeremonies();

// <!-- http://bl.ocks.org/mbostock/1346410 -->

function renderIncreasingDecreasing(){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 850 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.ordinal()
      .range(["#F40703", "#F15B02", "#F39F06"]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));

  var svg = d3.select("#increasing-decreasing").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/increasing-decreasing-data.csv", function(error, data) {
    var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "Religion"; });

    data.forEach(function(d) {
      d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d.Religion; }));
    x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage");

    var state = svg.selectAll(".religion")
        .data(data)
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d.Religion) + ",0)"; });

    state.selectAll("rect")
        .data(function(d) { return d.ages; })
      .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color(d.name); });


    var legend = svg.selectAll(".legend")
        .data(ageNames.slice())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

  });

}


renderIncreasingDecreasing();

function renderJediPente(){

  var margin = {top: 45, right: 150, bottom: 20, left: 20},
      width = 420 - margin.left - margin.right,
      height =  400 - margin.top - margin.bottom;

  var formatPercent = d3.format(".0%");

  var color = d3.scale.ordinal()
      .domain(["pentecostalism", "jedi"])
      .range(["#F600AB", "#BF006A"])


  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  // Scales. Note the inverted domain fo y-scale: bigger is up!
  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>" + d.religion + "\t" + d.year + ": </strong><br/><span style='color:#fff'>" + d.value + "</span>";
    })

  // csv loaded asynchronously
  d3.tsv("data/jedi-pente.tsv", type, function(data) {

    // Data is nested by religion
    var countries = d3.nest()
        .key(function(d) { return d.religion; })
        .entries(data);

    // Parse dates and numbers. We assume values are sorted by date.
    // Also compute the maximum price per symbol, needed for the y-domain.
    // symbols.forEach(function(s) {
    //   s.values.forEach(function(d) { d.date = parse(d.date); d.price = +d.price; });
    //   s.maxPrice = d3.max(s.values, function(d) { return d.price; });
    // });

    // Compute the minimum and maximum year and percent across symbols.
    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, d3.max(countries, function(s) { return s.values[0].value; })]);

    // Add an SVG element for each religioj, with the desired dimensions and margin.
    var svg = d3.select("#jedi-pente").selectAll("svg")
      .data(countries)
      .enter()
      .append("svg:svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        // Hide y axis
        // .attr("class", "y axis")
        // .call(yAxis)
      .append("text")
      .attr("x", width + 10)
      .attr("y", height/3)
      .attr("dy", ".71em")
      .attr("text-anchor", "start")
      .attr("font-size", "1.1em")
      .text(function(d) { return d.key});

    // Accessing nested data: https://groups.google.com/forum/#!topic/d3-js/kummm9mS4EA
    // data(function(d) {return d.values;}) 
    // this will dereference the values for nested data for each group
    svg.selectAll(".bar-jedi")
        .data(function(d) {return d.values;})
        .enter()
        .append("rect")
        .attr("class", "bar-jedi")
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) {return color(d.value)})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

    svg.call(tip);

  });

  function type(d) {
    d.value = +d.value;
    return d;
  }

}
renderJediPente();


function renderBornOverseas(){

  var dispatch = d3.dispatch("load", "statechange");

  var groups = [
    "Born in Australia",
    "Born overseas"
  ];


  d3.csv("data/born-overseas.csv", type, function(error, states) {
    if (error) throw error;
    var stateById = d3.map();
    states.forEach(function(d) { stateById.set(d.id, d); });
    dispatch.load(stateById);
    dispatch.statechange(stateById.get("Christian"));
  });

  // A drop-down menu for selecting a state; uses the "menu" namespace.
  dispatch.on("load.menu", function(stateById) {
    var select = d3.select("#born-overseas")
      .append("div")
      .append("select")
        .on("change", function() { dispatch.statechange(stateById.get(this.value)); });

    select.selectAll("option")
        .data(stateById.values())
      .enter().append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.id; });

    dispatch.on("statechange.menu", function(state) {
      select.property("value", state.id);
    });
  });

  // A bar chart to show total population; uses the "bar" namespace.
  dispatch.on("load.bar", function(stateById) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 80 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom;

    var y = d3.scale.linear()
        .domain([0, d3.max(stateById.values(), function(d) { return d.total; })])
        .rangeRound([height, 0])
        .nice();

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("#born-overseas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var rect = svg.append("rect")
        .attr("x", 4)
        .attr("width", width - 4)
        .attr("y", height)
        .attr("height", 0)
        .style("fill", "#aaa");

    dispatch.on("statechange.bar", function(d) {
      rect.transition()
          .attr("y", y(d.total))
          .attr("height", y(0) - y(d.total));
    });
  });

  // A pie chart to show population by age group; uses the "pie" namespace.
  dispatch.on("load.pie", function(stateById) {
    var width = 600,
        height = 500,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
        .domain(groups)
        .range(["#2248C1", "#e6ad1d"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

    var pie = d3.layout.pie()
        .sort(null);

    var svg = d3.select("#born-overseas").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var legend = d3.select("#born-overseas").append("svg")
        .attr("class", "legend")
        .attr("width", 150)
        .attr("height", 120)
      .selectAll("g")
        .data(color.domain().slice().reverse())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    var path = svg.selectAll("path")
        .data(groups)
      .enter().append("path")
        .style("fill", color)
        .each(function() { this._current = {startAngle: 0, endAngle: 0}; });

    dispatch.on("statechange.pie", function(d) {
      path.data(pie.value(function(g) { return d[g]; })(groups)).transition()
          .attrTween("d", function(d) {
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return arc(interpolate(t));
            };
          });
    });
  });

  // Coerce population counts to numbers and compute total per state.
  function type(d) {
    d.total = d3.sum(groups, function(k) { return d[k] = +d[k]; });
    return d;
  }

}
renderBornOverseas();


function renderRecentlyArrived(){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 850 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.ordinal()
      .range(["#025275", "#478A18"]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));

  var svg = d3.select("#recently-arrived").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/recently-arrived.csv", function(error, data) {
    var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "Religion"; });

    data.forEach(function(d) {
      d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d.Religion; }));
    x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage");

    var state = svg.selectAll(".state")
        .data(data)
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d.Religion) + ",0)"; });

    state.selectAll("rect")
        .data(function(d) { return d.ages; })
      .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color(d.name); });

    var legend = svg.selectAll(".legend")
        .data(ageNames.slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

  });

}

renderRecentlyArrived();

