
const loadShader = (gl, type, source, config) => {
	Object.keys(config).forEach((configName) => {
		source = source.split(`${configName}f`).join(config[configName].toFixed(8));
		source = source.split(`${configName}i`).join(config[configName]);
	});
	console.log(source);
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
};

const init = (gl, vsSource, fsSource, config) => {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource, config);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource, config);
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	return shaderProgram;
};

module.exports = {
	init
};
