varying highp vec2 vTextureCoord;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSamplerCombiner;
precision highp float;

void main(void) {
	float combiner = texture2D(uSamplerCombiner, vTextureCoord).r;
	gl_FragColor =
		texture2D(uSampler1, vTextureCoord) * combiner +
		texture2D(uSampler2, vTextureCoord) * (1.0 - combiner);
//	gl_FragColor = texture2D(uSampler2, vTextureCoord);
}
