import type { Dot } from "./Dot";
import { createShader, createProgram } from "./glutils";

export interface GLAttribute {
	location: number;
	buffer: WebGLBuffer;
}

export interface RenderContext {
	shaderProgram: WebGLProgram;
	pos: WebGLUniformLocation;
	color: WebGLUniformLocation;
	dots: Dot[];
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
	const posLoc = gl.getUniformLocation(shaderProgram, "u_pos")!;
	const colorLoc = gl.getUniformLocation(shaderProgram, "u_color")!;
	return {
		shaderProgram,
		pos: posLoc,
		color: colorLoc,
		dots: [],
	};
}

export function cgRender(gl: WebGLRenderingContext, context: RenderContext) {
	// Clear Buffer
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Prepare Draw
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(context.shaderProgram);

	context.dots.forEach((dot) => {
		// Prepare Uniform
		gl.uniform4f(
			context.pos,
			dot.position[0],
			dot.position[1],
			dot.position[2],
			dot.position[3]
		);
		gl.uniform4f(
			context.color,
			dot.color.color[0],
			dot.color.color[1],
			dot.color.color[2],
			dot.color.color[3]
		);

		gl.drawArrays(gl.POINTS, 0, 1);
	});
}
