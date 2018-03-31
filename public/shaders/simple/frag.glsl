varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp float uHeights[16];
precision highp float;

float getData(int id) {
	for (int i = 0; i < 16; i++) {
		if (i == id) {
			return uHeights[i];
		}
	}
}

void main(void) {
	int x = int(min(3.0, floor(vTextureCoord.x * 4.0)));
	int y = int(min(3.0, floor(vTextureCoord.y * 4.0)));
	float h = getData(y * 4 + x);
//	gl_FragColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(h, h, h, 1.0);
}
