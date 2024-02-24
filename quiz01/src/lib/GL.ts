import { createShader, createProgram } from "./glutils";
import { mat2, mat4 } from "gl-matrix";

export interface GLAttribute {
	location: number;
	buffer: WebGLBuffer;
}

export interface RenderContext {
	shaderProgram: WebGLProgram;
	pos: GLAttribute;
	mat: WebGLUniformLocation;
	accMat: mat2;
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
	const posLoc = gl.getAttribLocation(shaderProgram, "a_position");
	const posBuffer = gl.createBuffer()!;
	const matLoc = gl.getUniformLocation(shaderProgram, "u_mat")!;
	return {
		shaderProgram,
		pos: { location: posLoc, buffer: posBuffer },
		mat: matLoc,
		accMat: mat2.identity(mat2.create())
	};
}

export function cgRender(gl: WebGLRenderingContext, context: RenderContext) {
	gl.bindBuffer(gl.ARRAY_BUFFER, context.pos.buffer);

	// Setup Data
	const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Clear Buffer
	gl.clearColor(0, 1.0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Draw
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(context.shaderProgram);

	gl.enableVertexAttribArray(context.pos.location);
	gl.bindBuffer(gl.ARRAY_BUFFER, context.pos.buffer);
	gl.vertexAttribPointer(context.pos.location, 2, gl.FLOAT, false, 0, 0);

	gl.uniformMatrix4fv(context.mat, false, mat2dToMat4(context.accMat));

	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function mat2dToMat4(mat2: mat2) {
	const ret = mat4.create();
	mat4.identity(ret);

	// Copy over the top 2x2 portion of mat2d to the top left 2x2 portion of mat4
	ret[0] = mat2[0];
	ret[1] = mat2[1];
	ret[4] = mat2[2];
	ret[5] = mat2[3];
	return ret;
}
