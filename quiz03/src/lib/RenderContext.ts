import type { GLAttribute } from "./GL";

export interface RenderContext {
	shaderProgram: WebGLProgram;
	pos: GLAttribute;
	color: GLAttribute;
}

export class Color implements Iterable<number> {
	private _color = [0, 0, 0, 1];
	static readonly RED = new Color([1, 0, 0]);
	static readonly GREEN = new Color([0, 1, 0, 1]);
	static readonly BLUE = new Color([0, 0, 1, 1]);
	static readonly WHITE = new Color([1, 1, 1, 1]);

	constructor(color: number[]) {
		this.color = color;
	}
	[Symbol.iterator](): Iterator<number, number, undefined> {
		let counter = 0;
		return {
			next: () => {
				return {
					done: counter >= 4,
					value: this._color[counter++],
				};
			},
		};
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
