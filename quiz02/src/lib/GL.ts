import type { RenderContext } from "./RenderContext";
import { createShader, createProgram } from "./glutils";

export interface GLAttribute {
	location: number;
	buffer: WebGLBuffer;
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

	context.dots.forEach(dot => dot.draw(gl, context));
}
