// (function() {
var getRandomValue = (min, max) => Math.random() * (max - min) + min;

var matrix = (rows, columns) => {

	let counter = 0;
	let array = [];
	for (let x = 0; x < rows; x++) {
		for (let y = 0; y < columns; y++) {
			const z = getRandomValue(-50, 50);
			array.push({counter: counter++, x, y,z/* value: z, style: z*/});
		}
	}
	return array;
}

var { DataSet,Graph3d } = require('vis');

for(let i=0; i< 100; i++) {
	var data = new DataSet();

// create some nice looking data with sin/cos
	var counter = 0;
	var steps = 50;  // number of datapoints will be steps*steps
	var axisMax = 314;
	var axisStep = axisMax / steps;
	for (var x = 0; x < axisMax; x += axisStep) {
		for (var y = 0; y < axisMax; y += axisStep) {
			var value = (Math.sin(x / 50) * Math.cos(y / 50) * 50 + 50)+i;
			const ko = {id: counter++, x: x, y: y, z: value, style: value};
			data.add(ko);
		}
	}

// specify options
	var options = {
		width: '500px',
		height: '552px',
		style: 'surface',
		showPerspective: true,
		showGrid: true,
		showShadow: false,
		keepAspectRatio: true,
		verticalRatio: 0.5
	};

// Instantiate our graph object.
	var container = document.getElementById('visualization');
	var graph3d = new Graph3d(container, data, options);
	data.clear();
}

// })();