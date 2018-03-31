const interpolateArray = require('2d-bicubic-interpolate');
const fs = require('fs');
const data = [
	{
		x: 0,
		y: 0,
		z: 0.3
	},
	{
		x: 1,
		y: 0,
		z: 1.2
	},
	{
		x: 0,
		y: 1,
		z: 1.4
	},
	{
		x: 1,
		y: 1,
		z: 2.2
	}
];
console.log(interpolateArray);
console.log(fs);
console.log(interpolateArray(data, 1));