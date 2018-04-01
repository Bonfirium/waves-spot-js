varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp float uHeights[$AREA_1$i];
precision highp float;

float getData(int id) {
	for (int i = 0; i < $AREA_1$i; i++) {
		if (i == id) {
			return uHeights[i];
		}
	}
}

float cosine_interpolate(in float a, in float b, in float x) {
	float ft = x * 3.1415926535;
	float f = (1.0 - cos(ft)) * 0.5;
	return a * (1.0 - f) + b * f;
}

void main(void) {
	float xx = vTextureCoord.x * $WIDTH$f;
	float xf = min($LESS_WIDTH$f, floor(xx));
	float xf1 = xf + 1.0;
	int x = int(xf);
	float dx = xx - xf;
	float yy = vTextureCoord.y * $HEIGHT$f;
	float yf = min($LESS_HEIGHT$f, floor(yy));
	int y = int(yf);
	int y5 = y * $HEIGHT_1$i;
	float h0 = cosine_interpolate(getData(x + y5), getData(x + 1 + y5), dx);
	float h1 = cosine_interpolate(getData(x + y5 + $HEIGHT_1$i), getData(x + 1 + y5 + $HEIGHT_1$i), dx);
	float h = cosine_interpolate(h0, h1, yy - yf);
//	gl_FragColor = texture2D(uSampler, vTextureCoord);
//	gl_FragColor = vec4(h, h, h, 1.0);
	gl_FragColor = vec4(h, h, h, 1.0);
}
