import { mat3, vec2 } from "gl-matrix";
import { Triangle, type RenderContext, Color } from "./RenderContext";
import { createShader, createProgram } from "./glutils";

export interface GLAttribute {
	location: number;
	buffer: WebGLBuffer;
	length: number;
	type: number;
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
	const vertexAttr: GLAttribute = {
		location: gl.getAttribLocation(shaderProgram, "a_position"),
		buffer: gl.createBuffer()!,
		length: 3,
		type: gl.FLOAT
	}
	const colorUni = gl.getUniformLocation(shaderProgram, "u_color")!;
	const matrixUni = gl.getUniformLocation(shaderProgram, "u_matrix")!;
	//NOTE: You are NOT allowed to change the vertex information here
	const triangleVerticesA = [0.0, 0.2, 0.0, -0.1, -0.3, 0.0, 0.1, -0.3, 0.0]; //green rotating triangle vertices
	const triangleVerticesB = [0.0, 0.0, 0.0, -0.1, -0.5, 0.0, 0.1, -0.5, 0.0];

	const triangles = [
		new Triangle(Color.GREEN, triangleVerticesA), 
		new Triangle(Color.GREEN, triangleVerticesB), 
		new Triangle(Color.GREEN, triangleVerticesB), 
	];
	return {
		shaderProgram,
		vertexAttr,
		colorUni,
		matrixUni,
		triangles, 
		xOffset: 0,
		secondAngle: 0,
		secondScale: 0,
		thirdAngle: 0,
	};
}

export function cgRender(gl: WebGL2RenderingContext, context: RenderContext) {
	// Clear Buffer
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Prepare Draw
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(context.shaderProgram);

	const globalMatrix = mat3.create();
	mat3.translate(globalMatrix, globalMatrix, vec2.fromValues(context.xOffset, 0));
	context.triangles[0].draw(gl, context, globalMatrix);
	mat3.translate(globalMatrix, globalMatrix,  vec2.fromValues(0, 0.2));
	mat3.rotate(globalMatrix, globalMatrix, Math.PI * (context.secondAngle / 180));
	mat3.scale(globalMatrix, globalMatrix, vec2.fromValues(1, 1 + context.secondScale));
	context.triangles[1].draw(gl, context, globalMatrix);
	mat3.translate(globalMatrix, globalMatrix, vec2.fromValues(0.1, -0.5));
	mat3.scale(globalMatrix, globalMatrix, vec2.fromValues(1, 1/(1 + context.secondScale)));
	mat3.rotate(globalMatrix, globalMatrix, Math.PI * (context.thirdAngle / 180));
	context.triangles[2].draw(gl, context, globalMatrix);
}
