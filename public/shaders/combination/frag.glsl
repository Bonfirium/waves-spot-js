varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
precision highp float;

void main(void) {
	gl_FragColor = texture2D(uSampler, vTextureCoord);
}
