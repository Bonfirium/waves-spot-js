const axios = require('axios');
const { init: initShader } = require('./shader');
const { init: initBuffers } = require('./buffers');
const { load: loadTexture, initTarget: initTargetTexture, isPowerOf2 } = require('./texture');
const { mat4 } = require('gl-matrix');

let interpolationTargetTexture = null;
let interpolationTargetFrameBuffer = null;
let buffers = null;
let projectionMatrix = null;
let modelViewMatrix = null;
let btnPrev = null;
let btnNext = null;

const SHADER_CONFIG = {
	$WIDTH$: 16,
	$HEIGHT$: 16
};
SHADER_CONFIG.$WIDTH_1$ = SHADER_CONFIG.$WIDTH$ + 1;
SHADER_CONFIG.$HEIGHT_1$ = SHADER_CONFIG.$HEIGHT$ + 1;
SHADER_CONFIG.$LESS_WIDTH$ = SHADER_CONFIG.$WIDTH$ - 1;
SHADER_CONFIG.$LESS_HEIGHT$ = SHADER_CONFIG.$HEIGHT$ - 1;
SHADER_CONFIG.$AREA_1$ = SHADER_CONFIG.$WIDTH_1$ * SHADER_CONFIG.$HEIGHT_1$;

const GLARES_TYPE = {
	NONE: 0,
	DEFAULT: 1,
	DARK: 2,
};

const images = [
	{ id: 'texture4.png', glares: GLARES_TYPE.DARK },
	{ id: 'texture3.png', glares: GLARES_TYPE.DARK },
	{ id: 'texture1.png', glares: GLARES_TYPE.DEFAULT, isCutted: true },
	{ id: 'texture2.png', glares: GLARES_TYPE.DEFAULT, isCutted: true },
	// { id: 'texture5.png', glares: GLARES_TYPE.NONE },
	{ id: 'texture6.png', glares: GLARES_TYPE.NONE },
];
let currentImageIndex = 0;
let texture = null;

const render = (gl, { interpolateShader, normalizerShader }, posses, spds) => {
	for (let i = 0; i < SHADER_CONFIG.$AREA_1$; i++) {
		spds[i] = Math.min(0.16, Math.max(-0.16, spds[i] + (Math.random() - 0.5) * 0.04));
		posses[i] += spds[i];
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, interpolationTargetFrameBuffer);
	// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.useProgram(interpolateShader.program);
	gl.uniform1fv(interpolateShader.uniformLocations.uHeights, new Float32Array(posses.map((pos) => Math.sin(pos) / 2 + 0.5)));
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.useProgram(normalizerShader.program);
	gl.uniform1i(normalizerShader.uniformLocations.uGlareType, images[currentImageIndex].glares);
	gl.uniform1i(normalizerShader.uniformLocations.uIsCutted, images[currentImageIndex].isCutted === true ? 1 : 0);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
};

const changeImage = async (gl, imageIndex) => {
	if (
		!Number.isSafeInteger(imageIndex) || imageIndex < 0 ||
		imageIndex >= images.length || currentImageIndex === imageIndex
	) {
		return;
	}
	currentImageIndex = imageIndex;
	let image = await new Promise((resolve) => {
		const result = new Image();
		result.onload = function () {
			resolve(result)
		};
		result.src = `images/${images[imageIndex].id}`;
	});
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
};

(async () => {
	const canvas = document.querySelector("#waves-spot-content");
	const gl = canvas.getContext("webgl");
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	const interpolateFilter = initShader(gl,
		(await axios.get('shaders/interpolate/vect.glsl')).data,
		(await axios.get('shaders/interpolate/frag.glsl')).data,
		SHADER_CONFIG
	);
	const interpolateShader = {
		program: interpolateFilter,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(interpolateFilter, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(interpolateFilter, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(interpolateFilter, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(interpolateFilter, 'uModelViewMatrix'),
			uHeights: gl.getUniformLocation(interpolateFilter, 'uHeights'),
		},
	};
	const normalizerFilter = initShader(gl,
		(await axios.get('shaders/normalizer/vect.glsl')).data,
		(await axios.get('shaders/normalizer/frag.glsl')).data,
		SHADER_CONFIG
	);
	const normalizerShader = {
		program: normalizerFilter,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(normalizerFilter, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(normalizerFilter, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(normalizerFilter, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(normalizerFilter, 'uModelViewMatrix'),
			uSamplerInterpolated: gl.getUniformLocation(normalizerFilter, 'uSamplerInterpolated'),
			uSamplerOriginal: gl.getUniformLocation(normalizerFilter, 'uSamplerOriginal'),
			uGlareType: gl.getUniformLocation(normalizerFilter, 'uGlareType'),
			uIsCutted: gl.getUniformLocation(normalizerFilter, 'uIsCutted'),
		},
	};
	buffers = initBuffers(gl);

	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	projectionMatrix = mat4.create();
	mat4.ortho(projectionMatrix, 0, 1, 1, 0, 0.1, 100.0);
	modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

	[interpolateShader, normalizerShader].forEach((shader) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(shader.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(shader.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.attribLocations.textureCoord);
	});

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	[interpolateShader, normalizerShader].forEach((shader) => {
		gl.useProgram(shader.program);
		gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	});

	let interpolationTarget = initTargetTexture(gl); // 0
	interpolationTargetTexture = interpolationTarget.targetTexture;
	interpolationTargetFrameBuffer = interpolationTarget.targetFrameBuffer;

	texture = await loadTexture(gl, `images/${images[currentImageIndex].id}`); // 1

	gl.useProgram(normalizerShader.program);
	gl.uniform1i(normalizerShader.uniformLocations.uSamplerInterpolated, 0);
	gl.uniform1i(normalizerShader.uniformLocations.uSamplerOriginal, 1);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, interpolationTargetTexture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	let posses = [];
	for (let i = 0; i < SHADER_CONFIG.$AREA_1$; i++) {
		posses.push(Math.random() * Math.PI * 2);
	}
	let spds = [];
	for (let i = 0; i < SHADER_CONFIG.$AREA_1$; i++) {
		spds.push((Math.random() - 0.5) * 0.16);
	}
	btnNext = document.querySelector('#btnNext');
	btnNext.onclick = (e) => {
		e.preventDefault();
		changeImage(gl, (currentImageIndex + 1) % images.length);
	};
	btnPrev = document.querySelector('#btnPrev');
	btnPrev.onclick = (e) => {
		e.preventDefault();
		changeImage(gl, (currentImageIndex + images.length - 1) % images.length);
	};
	setInterval(() => render(gl, { interpolateShader, normalizerShader }, posses, spds), 17);
})();
