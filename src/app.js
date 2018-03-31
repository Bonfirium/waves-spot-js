import PIXI from 'pixi.js';

console.log(PIXI);

import ImgBack from 'assets/images/back.png';

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
	type = "canvas";
}

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
