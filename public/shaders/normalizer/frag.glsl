varying highp vec2 vTextureCoord;
uniform sampler2D uSamplerInterpolated;
uniform sampler2D uSamplerOriginal;
precision highp float;

const float p = 0.2;
const float xd = p * sqrt(3.0) / 2.0;
const float yd = p / 2.0;
const float offset_power = 0.01;
const vec3 lightDirection = normalize(vec3(1.0, -1.0, 1.0));
const float halfPI = 3.1415926535 / 2.0;
const vec4 lightColor = vec4(0.62, 0.86, 1.0, 0.45);
const vec4 skyColor = vec4(0.26, 0.7, 0.95, 0.7);

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

	vec2 res = vTextureCoord + normal.xy * offset_power;

	if (res.x < 0.0 || res.x > 1.0 || res.y < 0.0 || res.y > 1.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
	}

	gl_FragColor = texture2D(uSamplerOriginal, res);
	float angle = acos(dot(normal, lightDirection));
	if (angle < halfPI) {
		float al = 1.0 - angle / halfPI;
		vec3 nrgb = (1.0 - gl_FragColor.rgb) * al;
		gl_FragColor = gl_FragColor + vec4(nrgb * lightColor.rgb * lightColor.a, 0.0);
	} else {
		float al = angle / halfPI - 1.0;
		vec3 nrgb = (1.0 - gl_FragColor.rgb) * al;
		gl_FragColor = gl_FragColor + vec4(nrgb * skyColor.rgb * skyColor.a, 0.0);
	}
//	gl_FragColor = gl_FragColor + vec4((1.0 - gl_FragColor.rgb) * (normal.x * 2.0), 1.0);
}
