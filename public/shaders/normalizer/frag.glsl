varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
precision highp float;

const float p = 0.05;
const float xd = p * sqrt(3.0) / 2.0;
const float yd = p / 2.0;

void main(void) {
	float x, y;

	x = vTextureCoord.x;
	y = vTextureCoord.y - p;
	vec3 v1 = vec3(x, y, texture2D(uSampler, vec2(x, y)));

	x = vTextureCoord.x - xd;
	y = vTextureCoord.y + yd;
	vec3 v2 = vec3(x, y, texture2D(uSampler, vec2(x, y)));

	x = vTextureCoord.x + xd;
	vec3 v3 = vec3(x, y, texture2D(uSampler, vec2(x, y)));

	vec3 a = v1 - v2;
	vec3 b = v3 - v2;
	vec3 normal = normalize(cross(a, b));

	gl_FragColor = vec4(normal.x, 0.0, normal.y, 1.0);
}
