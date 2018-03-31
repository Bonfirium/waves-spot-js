const fs = require('fs');
const browserify = require('browserify');
const watchify = require('watchify');
const root = './src/';

const filesList = fs.readdirSync(root).map(file => root + file);

const b = browserify({
	entries: filesList,
	cache: {},
	packageCache: {},
	plugin: [ watchify ]
});

const bundle = () => b.bundle().pipe(fs.createWriteStream('./public/bundle.js'));

b.on('update', bundle);

bundle();
