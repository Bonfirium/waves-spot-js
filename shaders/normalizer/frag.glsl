varying highp vec2 vTextureCoord;
uniform sampler2D uSamplerInterpolated;
uniform sampler2D uSamplerOriginal;
uniform int uGlareType;
uniform int uIsCutted;
precision highp float;

const float p = 0.2;
const float xd = p * sqrt(3.0) / 2.0;
const float yd = p / 2.0;
const float offset_power = 0.02;
const vec3 lightDirection = normalize(vec3(1.0, -1.0, 1.0));
const float halfPI = 3.1415926535 / 2.0;
const vec4 lightColor = vec4(0.62, 0.86, 1.0, 0.7);
const vec4 darkColor = vec4(-0.62, -0.86, -1.0, 0.45);
const vec4 skyColor = vec4(0.26, 0.7, 0.95, 1.0);

void main(void) {
	float x, y;

	vec2 coord;
	if (uIsCutted == 1) {
		coord = vTextureCoord * 0.9 + 0.05;
	} else {
		coord = vTextureCoord * 1.1 - 0.05;
	}

	x = coord.x;
	y = coord.y - p;
	vec3 v1 = vec3(x, y, texture2D(uSamplerInterpolated, vec2(x, y)).r);

	x = coord.x - xd;
	y = coord.y + yd;
	vec3 v2 = vec3(x, y, texture2D(uSamplerInterpolated, vec2(x, y)).r);

	x = coord.x + xd;
	vec3 v3 = vec3(x, y, texture2D(uSamplerInterpolated, vec2(x, y)).r);

	vec3 a = v1 - v2;
	vec3 b = v3 - v2;
	vec3 normal = normalize(cross(a, b));

	if (uGlareType == 3) {
		gl_FragColor = vec4(normal.x, normal.z, normal.y, 1.0);
		return;
	}

	vec2 res = coord + normal.xy * offset_power;

	if (res.x < 0.0 || res.x > 1.0 || res.y < 0.0 || res.y > 1.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
	}

	gl_FragColor = texture2D(uSamplerOriginal, res);
	vec4 cl;
	if (uGlareType == 1) {
		cl = lightColor;
	} else if (uGlareType == 2) {
		cl = darkColor;
	} else {
		return;
	}
	float originAlpha = gl_FragColor.a;
	float angle = acos(dot(normal, lightDirection));
	if (angle < halfPI) {
		float al = 1.0 - angle / halfPI;
		vec3 nrgb = (1.0 - gl_FragColor.rgb) * al;
		gl_FragColor = gl_FragColor + vec4(nrgb * cl.rgb * cl.a, 0.0);
	} else {
		float al = angle / halfPI - 1.0;
		vec3 nrgb = (1.0 - gl_FragColor.rgb) * al;
		gl_FragColor = gl_FragColor + vec4(nrgb * skyColor.rgb * skyColor.a, 0.0);
	}
	gl_FragColor.a = originAlpha;
//	gl_FragColor = gl_FragColor + vec4((1.0 - gl_FragColor.rgb) * (normal.x * 2.0), 1.0);
}
