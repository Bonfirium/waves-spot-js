const axios = require('axios');
const { init: initShader } = require('./shader');
const { init: initBuffers } = require('./buffers');
const { load: loadTexture } = require('./texture');
const { mat4 } = require('gl-matrix');

let targetTexture = null;
let targetFrameBuffer = null;
let buffers = null;
let projectionMatrix = null;
let modelViewMatrix = null;

const render = (gl, { interpolateShader, combinationShader }, heights) => {
	for (let i = 0; i < 25; i++) {
		heights[i] = Math.min(1.0, Math.max(0.0, heights[i] + (Math.random() - 0.5) / 10));
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, targetFrameBuffer);
	gl.useProgram(interpolateShader.program);
	{
		gl.uniform1fv(interpolateShader.uniformLocations.uHeights, new Float32Array(heights));
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.useProgram(combinationShader.program);
	{
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}
};

(async () => {
	const canvas = document.querySelector("#glCanvas");
	const gl = canvas.getContext("webgl");
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	const interpolateFilter = initShader(gl,
		(await axios.get('shaders/interpolate/vect.glsl')).data,
		(await axios.get('shaders/interpolate/frag.glsl')).data,
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
	const combinationFilter = initShader(gl,
		(await axios.get('shaders/combination/vect.glsl')).data,
		(await axios.get('shaders/combination/frag.glsl')).data,
	);
	const combinationShader = {
		program: combinationFilter,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(combinationFilter, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(combinationFilter, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(combinationFilter, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(combinationFilter, 'uModelViewMatrix'),
			uSampler1: gl.getUniformLocation(combinationFilter, 'uSampler1'),
			uSampler2: gl.getUniformLocation(combinationFilter, 'uSampler2'),
			uSamplerCombiner: gl.getUniformLocation(combinationFilter, 'uSamplerCombiner'),
		},
	};
	buffers = initBuffers(gl);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	projectionMatrix = mat4.create();
	mat4.ortho(projectionMatrix, 0, 1, 0, 1, 0.1, 100.0);
	modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

	[interpolateShader, combinationShader].forEach((shader) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(shader.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(shader.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.attribLocations.textureCoord);
	});

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	[interpolateShader, combinationShader].forEach((shader) => {
		gl.useProgram(shader.program);
		gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	});

	targetTexture = gl.createTexture();
	gl.uniform1i(combinationShader.uniformLocations.uSamplerCombiner, 0);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	{
		const level = 0;
		const internalFormat = gl.RGBA;
		const border = 0;
		const format = gl.RGBA;
		const type = gl.UNSIGNED_BYTE;
		const data = null;
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 256, 256, border, format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	targetFrameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, targetFrameBuffer);
	const attachmentPoint = gl.COLOR_ATTACHMENT0;
	const level = 0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

	const texture1 = await loadTexture(gl, 'images/texture1.png');
	const texture2 = await loadTexture(gl, 'images/texture2.png');

	gl.useProgram(combinationShader.program);
	gl.uniform1i(combinationShader.uniformLocations.uSamplerCombiner, 0);
	gl.uniform1i(combinationShader.uniformLocations.uSampler1, 1);
	gl.uniform1i(combinationShader.uniformLocations.uSampler2, 2);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, texture2);

	let heights = [];
	for (let i = 0; i < 25; i++) {
		heights.push(Math.random());
	}
	setInterval(() => render(gl, { interpolateShader, combinationShader }, heights), 17);
})();
