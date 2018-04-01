varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp float uHeights[25];
precision highp float;

float getData(int id) {
	for (int i = 0; i < 25; i++) {
		if (i == id) {
			return uHeights[i];
		}
	}
}

void main(void) {
	float xx = vTextureCoord.x * 4.0;
	float xf = min(3.0, floor(xx));
	int x = int(xf);
	float dx = xx - xf;
	float yy = vTextureCoord.y * 4.0;
	float yf = min(3.0, floor(yy));
	int y = int(yf);
	int y5 = y * 5;
	float fx00 = getData(x + y5);
	float fx10 = getData(x + 1 + y5);
	float h0 = fx00 + dx * (fx10 - fx00);
	float fx01 = getData(x + y5 + 5);
	float fx11 = getData(x + 1 + y5 + 5);
	float h1 = fx01 + dx * (fx11 - fx01);
	float h = h0 + (yy - yf) * (h1 - h0);
//	gl_FragColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(h, h, h, 1.0);
}
