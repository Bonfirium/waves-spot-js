varying highp vec2 vTextureCoord;
uniform sampler2D uSamplerInterpolated;
uniform sampler2D uSamplerOriginal;
precision highp float;

const float p = 0.2;
const float xd = p * sqrt(3.0) / 2.0;
const float yd = p / 2.0;
const float offset_power = 0.01;

void main(void) {
	float x, y;

	x = vTextureCoord.x;
	y = vTextureCoord.y - p;
	vec3 v1 = vec3(x, y, texture2D(uSamplerInterpolated, vec2(x, y)).r);

	x = vTextureCoord.x - xd;
	y = vTextureCoord.y + yd;
	vec3 v2 = vec3(x, y, texture2D(uSamplerInterpolated, vec2(x, y)).r);

	x = vTextureCoord.x + xd;
	vec3 v3 = vec3(x, y, texture2D(uSamplerInterpolated, vec2(x, y)).r);

	vec3 a = v1 - v2;
	vec3 b = v3 - v2;
	vec3 normal = normalize(cross(a, b));

	gl_FragColor = texture2D(uSamplerOriginal, vTextureCoord + normal.xy * offset_power);
	if (normal.x > 0.0) {
		float al = normal.x / 2.0;
		vec3 nrgb = (1.0 - gl_FragColor.rgb) * al;
		gl_FragColor = gl_FragColor + vec4(nrgb, 0.0);
	}
//	gl_FragColor = gl_FragColor + vec4((1.0 - gl_FragColor.rgb) * (normal.x * 2.0), 1.0);
}
