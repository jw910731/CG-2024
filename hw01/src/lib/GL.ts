import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";
import { CircleManager, LineManager, SquareManager, TriangleManager } from "./ShapeManager";
import { createShader, createProgram } from "./glutils";

export function cgPrepare(
	gl: WebGL2RenderingContext,
	vertexShaderSrc: string,
	fragmentShaderSrc: string
): RenderContext {
	// Prepare Shader
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
	const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

	const vertexAttr: GLAttribute = new GLAttribute(
		gl,
		gl.getAttribLocation(shaderProgram, "a_pos"),
		gl.createBuffer()!
	);
	const colorAttr: GLAttribute = new GLAttribute(
		gl,
		gl.getAttribLocation(shaderProgram, "a_color"),
		gl.createBuffer()!
	);
	const sizeAttr: GLAttribute = new GLAttribute(
		gl,
		gl.getAttribLocation(shaderProgram, "a_size"),
		gl.createBuffer()!
	);

	const line = new LineManager({
		gl,
		vertexAttr,
		colorAttr,
		sizeAttr,
	});
	const triangle = new TriangleManager({
		gl,
		vertexAttr,
		colorAttr,
		sizeAttr,
	});
	const circle = new CircleManager({
		gl,
		vertexAttr,
		colorAttr,
		sizeAttr,
	});
	const square = new SquareManager({
		gl,
		vertexAttr,
		colorAttr,
		sizeAttr,
	}, SquareManager.SQUARE_SIZE);
	const point = new SquareManager({
		gl,
		vertexAttr,
		colorAttr,
		sizeAttr,
	}, SquareManager.POINT_SIZE);
	return {
		shaderProgram,
		managers: {
			line,
			square,
			triangle,
			circle,
			point,
		},
		currentManager: square,
	};
}

export function cgRender(gl: WebGL2RenderingContext, context: RenderContext) {
	// Clear Buffer
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Prepare Draw
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(context.shaderProgram);

	Object.values(context.managers).forEach((m) => m.draw());
}
