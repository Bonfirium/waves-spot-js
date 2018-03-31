const axios = require('axios');
const { init: initShader } = require('./shader');
const { init: initBuffers } = require('./buffers');
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
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(simpleShader, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(simpleShader, 'uModelViewMatrix'),
		},
	};
	const buffers = initBuffers(gl);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const fieldOfView = 45 * Math.PI / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
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
	gl.useProgram(programInfo.program);
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	{
		const offset = 0;
		const vertexCount = 4;
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
	}
})();
