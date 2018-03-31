(async () => {
	const PIXI = require('pixi.js');
	const ImgBack = 'images/back.png';
	const axios = require('axios');

	let type = "WebGL";
	if (!PIXI.utils.isWebGLSupported()) {
		console.warn("WebGL is not supported");
		type = "canvas";
	}

	let shaderCode = (await axios.get('/shaders/simple.glsl')).data;
	let simpleShader = new PIXI.Filter(null, shaderCode);

	let app = new PIXI.Application({
		antialias: true,
		resolution: 1
	});
	app.renderer.view.style.position = "absolute";
	app.renderer.view.style.display = "block";
	app.renderer.view.style.left = "0";
	app.renderer.view.style.top = "0";
	app.renderer.autoResize = true;
	app.renderer.resize(window.innerWidth, window.innerHeight);
	app.stage.filters = [simpleShader];

	PIXI.loader
		.add(ImgBack)
		.load(setup);

	function setup() {
		let back = new PIXI.Sprite(PIXI.loader.resources[ImgBack].texture);
		back.width = window.innerWidth;
		back.height = window.innerHeight;
		app.stage.addChild(back);
	}

	document.body.appendChild(app.view);
})();
