import { Vec4 } from "neon-matrix";

export class Color extends Vec4 {
	static readonly RED = new Color([1, 0, 0, 1]);
	static readonly GREEN = new Color([0, 1, 0, 1]);
	static readonly BLUE = new Color([0, 0, 1, 1]);
	static readonly WHITE = new Color([1, 1, 1, 1]);

	constructor(color: [number, number, number]);
	constructor(color: [number, number, number, number]);
	constructor(color: Array<number>) {
		super();
		this.color = color;
	}

	public set color(color: number[]) {
		if (color.length <= 0) {
			color = [0, 0, 0, 1];
			return;
		}
		if (color.length < 3 || color.length > 4)
			throw new RangeError("color is either a 3 or 4 number tuple.");
		this[0] = color[0];
		this[1] = color[1];
		this[2] = color[2];
		if (color.length > 3) this[3] = color[3];
		else this[3] = 1;
	}
	public get color() {
		return <[number, number, number, number]>[...this.values()];
	}
}
