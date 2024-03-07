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
	const posAttr: GLAttribute = {
		location: gl.getAttribLocation(shaderProgram, "a_pos"),
		buffer: gl.createBuffer()!,
	};
	const colorAttr: GLAttribute = {
		location: gl.getAttribLocation(shaderProgram, "a_color"),
		buffer: gl.createBuffer()!,
	};
	return {
		shaderProgram,
		pos: posAttr,
		color: colorAttr,
	};
}

const VERTEX = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
const COLOR = [1, 0, 0, /* */ 1, 1, 1, /* */ 1, 1, 1, /* */ 0, 0, 1];

export function cgRender(gl: WebGL2RenderingContext, context: RenderContext) {
	// Prepare data
	gl.bindBuffer(gl.ARRAY_BUFFER, context.pos.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTEX), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, context.color.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(COLOR), gl.STATIC_DRAW);

	// Clear Buffer
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Prepare Draw
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(context.shaderProgram);

	gl.enableVertexAttribArray(context.pos.location);
	gl.bindBuffer(gl.ARRAY_BUFFER, context.pos.buffer);
	gl.vertexAttribPointer(context.pos.location, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(context.color.location);
	gl.bindBuffer(gl.ARRAY_BUFFER, context.color.buffer);
	gl.vertexAttribPointer(context.color.location, 3, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // !! I DID USE THE TRIANGLE STRIP //
}
