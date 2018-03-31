const axios = require('axios');
const { init: initShader } = require('./shader');
const { init: initBuffers } = require('./buffers');
const { load: loadTexture } = require('./texture');
const { mat4 } = require('gl-matrix');

(async () => {
	const canvas = document.querySelector("#glCanvas");
	const gl = canvas.getContext("webgl");
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	const simpleShader = initShader(gl,
		(await axios.get('shaders/simple/vect.glsl')).data,
		(await axios.get('shaders/simple/frag.glsl')).data,
	);
	const programInfo = {
		program: simpleShader,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(simpleShader, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(simpleShader, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(simpleShader, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(simpleShader, 'uModelViewMatrix'),
			uSampler: gl.getUniformLocation(simpleShader, 'uSampler'),
		},
	};
	const buffers = initBuffers(gl);
	const texture = await loadTexture(gl, 'images/back.png');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const projectionMatrix = mat4.create();
	mat4.ortho(projectionMatrix, 0, 1, 0, 1, 0.1, 100.0);
	const modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	}
	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	gl.useProgram(programInfo.program);
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	{
		const offset = 0;
		const type = gl.UNSIGNED_SHORT;
		const vertexCount = 6;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
})();
