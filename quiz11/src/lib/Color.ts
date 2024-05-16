import { Vec3 } from "neon-matrix";

export class Color extends Vec3 {
	static readonly RED = new Color([1, 0, 0]);
	static readonly GREEN = new Color([0, 1, 0]);
	static readonly BLUE = new Color([0, 0, 1]);
	static readonly WHITE = new Color([1, 1, 1]);

	constructor(color: [number, number, number]) {
		super();
		if (color.length <= 0) {
			color = [0, 0, 0];
			return;
		}
		this[0] = color[0];
		this[1] = color[1];
		this[2] = color[2];
	}
}
