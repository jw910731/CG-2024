export interface ProgramParams {
	vertexShaderSrc: string,
	fragmentShaderSrc: string
}

export function createProgram(gl: WebGL2RenderingContext, {vertexShaderSrc, fragmentShaderSrc }: ProgramParams) {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
	return _createProgram(gl, vertexShader, fragmentShader);
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
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

function _createProgram(
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
