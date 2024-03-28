import { mat4, vec3 } from "gl-matrix";
import { Triangle, type RenderContext, Color } from "./RenderContext";
import { createShader, createProgram } from "./glutils";

export interface GLAttribute {
	location: number;
	buffer: WebGLBuffer;
	length: number;
	type: number;
}

const VERTECIES = [
	[
		[0.0, 1.0, -2.0],
		[-0.5, -1.0, -2.0],
		[0.5, -1.0, -2.0],
	],

	[
		[0.0, 1.0, -0.0],
		[-0.5, -1.0, -0.0],
		[0.5, -1.0, -0.0],
	],

	[
		[0.0, 1.0, 2.0],
		[-0.5, -1.0, 2.0],
		[0.5, -1.0, 2.0],
	],
];
const COLOR = [Color.RED, Color.GREEN, Color.BLUE];

export function cgPrepare(
	gl: WebGLRenderingContext,
	vertexShaderSrc: string,
	fragmentShaderSrc: string
): RenderContext {
	// Prepare Shader
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
	const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.SCISSOR_TEST);
	gl.useProgram(shaderProgram);

	// Prepare Buffer
	const vertexAttr: GLAttribute = {
		location: gl.getAttribLocation(shaderProgram, "a_position"),
		buffer: gl.createBuffer()!,
		length: 3,
		type: gl.FLOAT,
	};
	const colorAttr: GLAttribute = {
		location: gl.getAttribLocation(shaderProgram, "a_color"),
		buffer: gl.createBuffer()!,
		length: 4,
		type: gl.FLOAT,
	};
	const matrixUni = gl.getUniformLocation(shaderProgram, "u_matrix")!;
	const triangles = VERTECIES.map((ps, i) => new Triangle(COLOR[i], ps.flat())).flat();
	return {
		shaderProgram,
		vertexAttr,
		colorAttr,
		matrixUni,
		triangles,
		angleX: 0,
		angleY: 0,
		mvpGen: mat4.create,
		background: [0, 0, 0, 1],
		vpwidth: 0,
		vpheight: 0,
		vpx: 0,
		vpy: 0,
	};
}

export function cgRender(gl: WebGL2RenderingContext, context: RenderContext) {
	// Prepare Draw
	gl.viewport(context.vpx, context.vpy, context.vpwidth, context.vpheight);
	gl.scissor(context.vpx, context.vpy, context.vpwidth, context.vpheight);

	// Clear Buffer
	gl.clearColor(context.background[0], context.background[1], context.background[2], 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const mat = context.mvpGen(-1, 0, 0);
	gl.uniformMatrix4fv(context.matrixUni, false, mat);

	// draw
	context.triangles.forEach((t) => t.draw(gl, context));

	const mat2 = context.mvpGen(1, 0, 0);
	gl.uniformMatrix4fv(context.matrixUni, false, mat2);

	// draw
	context.triangles.forEach((t) => t.draw(gl, context));
}
