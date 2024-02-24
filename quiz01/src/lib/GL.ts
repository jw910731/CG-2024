function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	const err = gl.getShaderInfoLog(shader);
	gl.deleteShader(shader);
	throw err;
}

function createProgram(
	gl: WebGLRenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader
) {
	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program;
	}

	const err = gl.getProgramInfoLog(program);
	gl.deleteProgram(program);
	throw err;
}

export interface RenderContext {
	shaderProgram: WebGLProgram;
	aPosLocaction: number;
	posBuffer: WebGLBuffer;
}

export function cgPrepare(
	gl: WebGLRenderingContext,
	vertexShaderSrc: string,
	fragmentShaderSrc: string
): RenderContext {
	// Prepare Shader
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
	const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

	// Prepare Buffer
	const aPosLocaction = gl.getAttribLocation(shaderProgram, "a_position");
	const posBuffer = gl.createBuffer()!;
	return { shaderProgram, aPosLocaction, posBuffer };
}

export function cgRender(gl: WebGLRenderingContext, context: RenderContext) {
	gl.bindBuffer(gl.ARRAY_BUFFER, context.posBuffer);

	// Setup Data
	const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Clear Buffer
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Draw
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(context.shaderProgram);
	gl.enableVertexAttribArray(context.aPosLocaction);
	gl.bindBuffer(gl.ARRAY_BUFFER, context.posBuffer);
	gl.vertexAttribPointer(context.aPosLocaction, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}
