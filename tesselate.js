hexTess = (function() {

var SHOW_ALL = false; 
var	MAX_LEVELS = 4;
var hexagons = [];
var markers = [];
var counters = [];
// var colors = ['#FF0000', '#FFFF00', '#00FF00', , '#00FFFF', '#0000FF'];
// var colors = ['#000000', '#000000', '#000000', , '#000000', '#000000'];
var colors = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'];
var toShow = [29, 32, 33, 18, 7, 21, 22];
var labels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"];
var markerLabels = [];

function createHexagon(map, center, radius, offset, level, counter, showGrid) {
	var coords = [];

	if (!showGrid) {
		return;
	}
	
	var show = (SHOW_ALL || toShow.indexOf(counter) >= 0);

	for (var i = 0; i < 6; i++) {
		coords[i] = new google.maps.LatLng(center.lat() + radius * Math.sin(i * Math.PI/3 + offset), 
				center.lng() + radius * Math.cos(i * Math.PI/3 + offset));
	}

	var hexagon = new google.maps.Polygon({
		paths: coords,
		strokeColor: colors[level],
		strokeOpacity: 0.6,
		strokeWeight: 1,
		fillColor: colors[level],
		fillOpacity: show ? 0.20 : 0,
		geodesic: true
	});
	
	hexagon.setMap(map);
	hexagons.push(hexagon);
	return hexagon;
}

function createMarker(map, center, counter, direction, showMarkers) {
	
	if (showMarkers && (SHOW_ALL || toShow.indexOf(counter) >= 0)) {
		
		var cntMarker = new StyledMarker({
//			styleIcon: new StyledIcon(StyledIconTypes.BUBBLE,{color:"00ff00",text:"" + counter + "." + direction}),
			styleIcon: new StyledIcon(StyledIconTypes.BUBBLE,{color:"000000", text:markerLabels[counter], fore:"ffffff"}),
			position:center, map:map, draggable:true});
		markers.push(cntMarker);
	}

}

function radialTesselate(map, center, radius, offset, level, direction, maxLevel, showGrid, showMarkers) {
	
	var position = counters[level];
	++counters[level];
	var counter = level * (level - 1) * 3 + position + 1;

	createHexagon(map, center, radius, offset, level, counter, showGrid);
	createMarker(map, center, counter, direction, showMarkers);

	if (level >= maxLevel) {
		return;
	}
	
	var r = 2 * radius * Math.cos(Math.PI/6);
	var alfa = Math.PI/3;
	var todo = (position % level == 0 ? 2 : 1);
	for (var dir = direction; dir < direction + todo; dir++) {
		var newCenter = new google.maps.LatLng(center.lat() + r * Math.cos(dir * alfa + offset), 
				center.lng() + r * Math.sin(dir * alfa + offset));
		radialTesselate(map, newCenter, radius, offset, level + 1, dir, maxLevel, showGrid, showMarkers);
	}
	
	return;
}

function tesselate(map, center, radius, vertical, showGrid, showMarkers) {
	// clear map
	hexagons.forEach(function(hex) {
		hex.setMap(null);
	});
	hexagons = [];

	markers.forEach(function(m) {
		m.setMap(null);
	});
	markers = [];
	
	if (!showGrid && !showMarkers) {
		return;
	}

	for (var i = 1; i <= MAX_LEVELS; i++) {
		counters[i] = 0;
	}

	for (var i = 0; i < labels.length; i++) {
		markerLabels[toShow[i]] = labels[i];
	}

	// initial offset for center hexagon
	var offset = vertical ? Math.PI/6 : 0;

	createHexagon(map, center, radius, offset, 0, 0, showGrid);

	var r = 2 * radius * Math.cos(Math.PI/6);
	var alfa = Math.PI/3;
	
	for (var i = 0; i < 6; i++) {
		var newCenter = new google.maps.LatLng(center.lat() + r * Math.cos(i * alfa + offset), 
				center.lng() + r * Math.sin(i * alfa + offset));
		radialTesselate(map, newCenter, radius, offset, 1, i, MAX_LEVELS, showGrid, showMarkers);
	}
	
//	hexagon.setMap(map);
	
}

return {tesselate: tesselate};
})();
