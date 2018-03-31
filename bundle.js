(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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
},{"2d-bicubic-interpolate":3,"fs":1}],3:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _cubicSpline = require('cubic-spline');
var _cubicSpline2 = _interopRequireDefault(_cubicSpline);
var _splitArray = require('split-array');
var _splitArray2 = _interopRequireDefault(_splitArray);
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function interpolateArray(data, n) {
    //interploation of simple row or column
    function interpoalateDirection(axis, Z, n) {
        var ZNew = [];
        for (var i = 0; i < Z.length - 1; i++) {
            ZNew.push(Z[i]);
            for (var j = 0; j < n; j++) {
                ZNew.push((0, _cubicSpline2.default)(axis[i] + (axis[i + 1] - axis[i]) / (n + 1) * (j + 1), axis, Z));
            }
        }
        ZNew.push(Z[Z.length - 1]);
        return ZNew;
    }
    //interpolate arguments array (axis)
    function interpolateAxis(axis, n) {
        var newAxis = [];
        for (var i = 0; i < axis.length - 1; i++) {
            newAxis.push(axis[i]);
            for (var j = 0; j < n; j++) {
                newAxis.push(axis[i] + (axis[i + 1] - axis[i]) / (n + 1) * (j + 1));
            }
        }
        newAxis.push(axis[axis.length - 1]);
        return newAxis;
    }
    /*data = [
        {x: x1, y:y1, z:z1},
        {x: xn, y:yn, z:zn}
    ];
    n is a number of points, that will be inserted between data points
    */
    //sort data firstly by x and then by y
    data.sort(function (a, b) {
        //sort firstly by 1st column, if equal then sort by second column
        return a.x - b.x || a.y - b.y;
    });
    //dissasemble object
    var X = [];
    var Y = [];
    var Z = [];
    var X2 = [];
    var Y2 = [];
    var Z2 = [];
    var Z3 = [];
    var dataInt = [];
    data.map(function (record) {
        if (X.indexOf(record.x) === -1) {
            X.push(record.x);
        }
        return record;
    });
    data.map(function (record) {
        if (Y.indexOf(record.y) === -1) {
            Y.push(record.y);
        }
        return record;
    });
    data.map(function (record) {
        if (Z.indexOf(record.z) === -1) {
            Z.push(record.z);
        }
        return record.z;
    });
    Z = (0, _splitArray2.default)(Z, Y.length);
    //interpolate along columns
    var interpColumns = [];
    for (var i = 0; i < Y.length; i++) {
        var tempZ = [];
        for (var j = 0; j < X.length; j++) {
            tempZ.push(Z[j][i]);
        }
        interpColumns.push(interpoalateDirection(X, tempZ, n));
    }
    //interpolate along rows
    for (var _i = 0; _i < interpColumns[0].length; _i++) {
        var row = [];
        for (var _j = 0; _j < interpColumns.length; _j++) {
            row.push(interpColumns[_j][_i]);
        }
        Z2.push(row);
    }
    Z3 = Z2.map(function (row) {
        return interpoalateDirection(Y, row, n);
    });
    //interpolate arguments x and y
    X2 = interpolateAxis(X, n);
    Y2 = interpolateAxis(Y, n);
    //assemble data object
    for (var y = 0; y < Y2.length; y++) {
        for (var x = 0; x < X2.length; x++) {
            dataInt.push({
                x: X2[x],
                y: Y2[y],
                z: Z3[x][y]
            });
        }
    }
    if (n===0) {
        return data;
    } else {
        return dataInt;
    }
};

module.exports = interpolateArray;

},{"cubic-spline":4,"split-array":5}],4:[function(require,module,exports){
module.exports = function spline(x, xs, ys) {
  var ks = xs.map(function(){return 0})
  ks = getNaturalKs(xs, ys, ks)
  var i = 1;
  while(xs[i]<x) i++;
  var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
  var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
  var b = -ks[i]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);
  var q = (1-t)*ys[i-1] + t*ys[i] + t*(1-t)*(a*(1-t)+b*t);
  return q;
}

function getNaturalKs (xs, ys, ks) {
  var n = xs.length-1;
  var A = zerosMat(n+1, n+2);
    
  for(var i=1; i<n; i++)  // rows
  {
    A[i][i-1] = 1/(xs[i] - xs[i-1]);
    A[i][i] = 2 * (1/(xs[i] - xs[i-1]) + 1/(xs[i+1] - xs[i])) ;
    A[i][i+1] = 1/(xs[i+1] - xs[i]);
    A[i][n+1] = 3*( (ys[i]-ys[i-1])/((xs[i] - xs[i-1])*(xs[i] - xs[i-1]))  +  (ys[i+1]-ys[i])/ ((xs[i+1] - xs[i])*(xs[i+1] - xs[i])) );
  }
  
  A[0][0] = 2/(xs[1] - xs[0]);
  A[0][1] = 1/(xs[1] - xs[0]);
  A[0][n+1] = 3 * (ys[1] - ys[0]) / ((xs[1]-xs[0])*(xs[1]-xs[0]));
  
  A[n][n-1] = 1/(xs[n] - xs[n-1]);
  A[n][n] = 2/(xs[n] - xs[n-1]);
  A[n][n+1] = 3 * (ys[n] - ys[n-1]) / ((xs[n]-xs[n-1])*(xs[n]-xs[n-1]));
    
  return solve(A, ks);    
}


function solve (A, ks) {
  var m = A.length;
  for(var k=0; k<m; k++)  // column
  {
    // pivot for column
    var i_max = 0; var vali = Number.NEGATIVE_INFINITY;
    for(var i=k; i<m; i++) if(A[i][k]>vali) { i_max = i; vali = A[i][k];}
    swapRows(A, k, i_max);    
    
    // for all rows below pivot
    for(var i=k+1; i<m; i++)
    {
      for(var j=k+1; j<m+1; j++)
        A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
        A[i][k] = 0;
    }
  }
  for(var i=m-1; i>=0; i--) // rows = columns
  {
    var v = A[i][m] / A[i][i];
    ks[i] = v;
    for(var j=i-1; j>=0; j--) // rows
    {
      A[j][m] -= A[j][i] * v;
      A[j][i] = 0;
    }
  }
  return ks;
}

function zerosMat (r,c) {
  var A = []; 
  for(var i=0; i<r; i++) {
    A.push([]); 
    for(var j=0; j<c; j++) A[i].push(0);
  } 
  return A;
}

function swapRows (m, k, l) {
  var p = m[k]; m[k] = m[l]; m[l] = p;
}
    

},{}],5:[function(require,module,exports){
'use strict';
module.exports = function (input, maxLength) {
	if (!Array.isArray(input)) {
		throw new TypeError('Expected an array to split');
	}

	if (typeof maxLength !== 'number') {
		throw new TypeError('Expected a number of groups to split the array in');
	}

	var result = [];
	var part = [];

	for (var i = 0; i < input.length; i++) {
		part.push(input[i]);

		// check if we reached the maximum amount of items in a partial
		// or just if we reached the last item
		if (part.length === maxLength || i === input.length - 1) {
			result.push(part);
			part = [];
		}
	}

	return result;
};

},{}]},{},[2]);
