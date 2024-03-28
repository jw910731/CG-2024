import { mat3, mat4 } from "gl-matrix";
import type { GLAttribute } from "./GL";

export interface RenderContext {
	shaderProgram: WebGLProgram;
	vertexAttr: GLAttribute;
	colorAttr: GLAttribute;
	matrixUni: WebGLUniformLocation;
	triangles: Triangle[];
	angleX: number;
	angleY: number;
	background: number[];
	mvpGen: (x: number, y: number, z: number) => mat4;
	vpwidth: number;
	vpheight: number;
	vpx: number;
	vpy: number;
}

export class Triangle {
	private color: Color;
	private position: number[];
	constructor(color: Color, position: number[]) {
		this.color = color;
		this.position = position;
	}
	draw(gl: WebGL2RenderingContext, context: RenderContext) {
		const bindAttr = (attr: GLAttribute, data: number[]) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
			gl.vertexAttribPointer(attr.location, attr.length, attr.type, false, 0, 0);
			gl.enableVertexAttribArray(attr.location);
		};
		bindAttr(context.vertexAttr, this.position);
		bindAttr(context.colorAttr, Array(3).fill(this.color.color).flat());
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
