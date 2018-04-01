const axios = require('axios');
const { init: initShader } = require('./shader');
const { init: initBuffers } = require('./buffers');
const { load: loadTexture, initTarget: initTargetTexture } = require('./texture');
const { mat4 } = require('gl-matrix');

let interpolationTargetTexture = null;
let interpolationTargetFrameBuffer = null;
let normalizerTargetTexture = null;
let normalizerTargetFrameBuffer = null;
let buffers = null;
let projectionMatrix = null;
let modelViewMatrix = null;

const SHADER_CONFIG = {
	$WIDTH$: 16,
	$HEIGHT$: 16
};
SHADER_CONFIG.$WIDTH_1$ = SHADER_CONFIG.$WIDTH$ + 1;
SHADER_CONFIG.$HEIGHT_1$ = SHADER_CONFIG.$HEIGHT$ + 1;
SHADER_CONFIG.$LESS_WIDTH$ = SHADER_CONFIG.$WIDTH$ - 1;
SHADER_CONFIG.$LESS_HEIGHT$ = SHADER_CONFIG.$HEIGHT$ - 1;
SHADER_CONFIG.$AREA_1$ = SHADER_CONFIG.$WIDTH_1$ * SHADER_CONFIG.$HEIGHT_1$;

const render = (gl, { interpolateShader, normalizerShader, distorsherShader }, posses) => {
	for (let i = 0; i < SHADER_CONFIG.$AREA_1$; i++) {
		posses[i] += Math.random() * Math.PI / 13;
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, interpolationTargetFrameBuffer);
	// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.useProgram(interpolateShader.program);
	gl.uniform1fv(interpolateShader.uniformLocations.uHeights, new Float32Array(posses.map((pos) => Math.sin(pos) / 2 + 0.5)));
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	// gl.bindFramebuffer(gl.FRAMEBUFFER, normalizerTargetFrameBuffer);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.useProgram(normalizerShader.program);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	// gl.useProgram(distorsherShader.program);
	// gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
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
		},
	};
	const distorsherFilter = initShader(gl,
		(await axios.get('shaders/distorsher/vect.glsl')).data,
		(await axios.get('shaders/distorsher/frag.glsl')).data,
		SHADER_CONFIG
	);
	const distorsherShader = {
		program: distorsherFilter,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(distorsherFilter, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(distorsherFilter, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(distorsherFilter, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(distorsherFilter, 'uModelViewMatrix'),
			uSamplerNormalize: gl.getUniformLocation(distorsherFilter, 'uSamplerNormalize'),
			uSamplerOriginal: gl.getUniformLocation(distorsherFilter, 'uSamplerOriginal'),
		},
	};
	buffers = initBuffers(gl);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
	[interpolateShader, normalizerShader, distorsherShader].forEach((shader) => {
		gl.useProgram(shader.program);
		gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	});

	let interpolationTarget = initTargetTexture(gl); // 0
	interpolationTargetTexture = interpolationTarget.targetTexture;
	interpolationTargetFrameBuffer = interpolationTarget.targetFrameBuffer;

	const texture1 = await loadTexture(gl, 'images/texture3.png'); // 1

	gl.useProgram(normalizerShader.program);
	gl.uniform1i(normalizerShader.uniformLocations.uSamplerInterpolated, 0);
	gl.uniform1i(normalizerShader.uniformLocations.uSamplerOriginal, 1);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, interpolationTargetTexture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture1);

	let posses = [];
	for (let i = 0; i < SHADER_CONFIG.$AREA_1$; i++) {
		posses.push(Math.random() * Math.PI * 2);
	}
	setInterval(() => render(gl, { interpolateShader, normalizerShader, distorsherShader }, posses), 17);
})();
