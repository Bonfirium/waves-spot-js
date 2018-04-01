varying highp vec2 vTextureCoord;
uniform sampler2D uSamplerOriginal;
uniform sampler2D uSamplerNormalize;
precision highp float;

const float power = 0.02;

void main(void) {
//	vec4 normalizer = texture2D(uSamplerNormalize, vTextureCoord);
//	vec2 offset = vec2(normalizer.r - 0.5, normalizer.b - 0.5) * power;
//	gl_FragColor = texture2D(uSamplerOriginal, vTextureCoord + offset);
////	vec3 nrgb = (1.0 - gl_FragColor.rgb) * normalizer.r;
//	vec3 nrgb = vec3(0);
//	gl_FragColor = gl_FragColor + vec4(nrgb, 1.0);
	gl_FragColor = texture2D(uSamplerNormalize, vTextureCoord);
}
