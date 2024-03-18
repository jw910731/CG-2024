export class GLAttribute {
	gl: WebGL2RenderingContext;
	location: number;
	buffer: WebGLBuffer;
	size: number = 0;

	constructor(gl: WebGL2RenderingContext, location: number, buffer: WebGLBuffer) {
		this.location = location;
		this.buffer = buffer;
		this.gl = gl;
	}
	prepareData(data: number[][], perVertexSize: number) {
		if (data.length <= 0) return;
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.flat()), gl.STATIC_DRAW);
		this.size = perVertexSize;
	}
	enable() {
		const gl = this.gl;
		if (this.size > 0) {
			gl.enableVertexAttribArray(this.location);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.vertexAttribPointer(this.location, this.size, gl.FLOAT, false, 0, 0);
		}
	}
}
