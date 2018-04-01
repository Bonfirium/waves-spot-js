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

void main(void) {
	float xx = vTextureCoord.x * $WIDTH$f;
	float xf = min($LESS_WIDTH$f, floor(xx));
	int x = int(xf);
	float dx = xx - xf;
	float yy = vTextureCoord.y * $HEIGHT$f;
	float yf = min($LESS_HEIGHT$f, floor(yy));
	int y = int(yf);
	int y5 = y * $HEIGHT_1$i;
	float fx00 = getData(x + y5);
	float fx10 = getData(x + 1 + y5);
	float h0 = fx00 + dx * (fx10 - fx00);
	float fx01 = getData(x + y5 + $HEIGHT_1$i);
	float fx11 = getData(x + 1 + y5 + $HEIGHT_1$i);
	float h1 = fx01 + dx * (fx11 - fx01);
	float h = h0 + (yy - yf) * (h1 - h0);
//	gl_FragColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(h, h, h, 1.0);
}
