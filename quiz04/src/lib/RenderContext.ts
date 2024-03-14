import { mat3, mat4 } from "gl-matrix";
import type { GLAttribute } from "./GL";

export interface RenderContext {
	shaderProgram: WebGLProgram;
	vertexAttr: GLAttribute, 
	colorUni: WebGLUniformLocation,
	matrixUni: WebGLUniformLocation,
	triangles: Triangle[], 
	xOffset: number,
	secondAngle: number,
	secondScale: number,
	thirdAngle: number, 
}

export class Triangle {
	private color: Color;
	private position: number[];
	constructor(color: Color, position: number[]) {
		this.color = color;
		this.position = position;
	}
	draw(gl: WebGL2RenderingContext, context: RenderContext, matrix: mat3) {
		const bindAttr = (attr: GLAttribute, data: number[] ) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
			gl.vertexAttribPointer(attr.location, attr.length, attr.type, false, 0, 0);
			gl.enableVertexAttribArray(attr.location);
		};
		bindAttr(context.vertexAttr, this.position);
		gl.uniform4fv(context.colorUni, this.color.color);
		gl.uniformMatrix4fv(context.matrixUni, false,  mat3ToMat4(matrix));
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}

export class Color {
	private _color = [0, 0, 0, 1];
	static readonly RED = new Color([1, 0, 0]);
	static readonly GREEN = new Color([0, 1, 0, 1]);
	static readonly BLUE = new Color([0, 0, 1, 1]);
	static readonly WHITE = new Color([1, 1, 1, 1]);

	constructor(color: number[]) {
		this.color = color;
	}
	public set color(color: number[]) {
		if (color.length <= 0) {
			this._color = [0, 0, 0, 1];
			return;
		}
		if (color.length < 3 || color.length > 4)
			throw new RangeError("color is either a 3 or 4 number tuple.");
		this.color[0] = color[0];
		this.color[1] = color[1];
		this.color[2] = color[2];
	}
	public get color() {
		return this._color;
	}
}

function mat3ToMat4(mat: mat3) {
	const ret = mat4.create();
	// Copy over the top 2x2 portion of mat3 to the top left 2x2 portion of mat4
	ret[0] = mat[0];
	ret[1] = mat[1];
	ret[3] = mat[2];

	ret[4] = mat[3];
	ret[5] = mat[4];
	ret[7] = mat[5];
	// homo coord
	ret[11] = 0;
	ret[12] = mat[6];
	ret[13] = mat[7];
	ret[14] = 0;
	ret[15] = mat[8];
	return ret;
}