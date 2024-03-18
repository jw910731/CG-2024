import { GLAttribute } from "./GLAttribute";

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

export interface DrawContext {
	gl: WebGL2RenderingContext;
	colorAttr: GLAttribute;
	vertexAttr: GLAttribute;
	sizeAttr: GLAttribute;
}

export abstract class BaseShapeManager {
	protected sizes: number[] = [];
	protected color: Color[] = [];
	protected currentColor: Color = Color.RED;
	protected context: DrawContext;
	constructor(context: DrawContext) {
		this.context = context;
	}
	// prepare basic data
	draw(): void {
		const { vertexAttr, colorAttr, sizeAttr } = this.context;
		colorAttr.prepareData(
			this.color.map((c) => c.color),
			4
		);
		vertexAttr.prepareData(this.verticies, 2);
		sizeAttr.prepareData(
			this.sizes.map((s) => [s]),
			1
		);
	}
	keyDown(key: KeyboardEvent) {
		if (key.key.toUpperCase() == "R") {
			this.currentColor = Color.RED;
		} else if (key.key.toUpperCase() == "G") {
			this.currentColor = Color.GREEN;
		} else if (key.key.toUpperCase() == "B") {
			this.currentColor = Color.BLUE;
		}
	}
	abstract addPoint(point: [number, number]): void;
	protected abstract get verticies(): number[][];
}

export class SquareManager extends BaseShapeManager {
	public static readonly POINT_SIZE = 5;
	public static readonly SQUARE_SIZE = 25;

	protected positions: [number, number][] = [];

	protected newSize = SquareManager.POINT_SIZE;

	constructor(context: DrawContext, size: number) {
		super(context);
		this.newSize = size;
	}

	draw(): void {
		if (this.positions.length <= 0) return;
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.POINTS, 0, this.positions.length);
	}
	addPoint(point: [number, number]): void {
		if (this.positions.length >= 3) {
			this.positions.shift();
			this.color.shift();
			this.sizes.shift();
		}
		this.positions.push(point);
		this.color.push(this.currentColor);
		this.sizes.push(this.newSize);
	}
	protected get verticies(): number[][] {
		return this.positions;
	}
}

export class LineManager extends BaseShapeManager {
	protected lines: [number, number, "V" | "H"][] = [];
	protected newOrientation: "V" | "H" = "V";
	private static readonly WIDTH = 1;
	draw(): void {
		if (this.lines.length <= 0) return;
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.lineWidth(LineManager.WIDTH);
		gl.drawArrays(gl.LINES, 0, this.lines.length * 2);
	}
	addPoint(point: [number, number]): void {
		if (this.lines.length >= 3) {
			this.lines.shift();
			for (let i = 0; i < 2; ++i) {
				this.color.shift();
				this.sizes.shift(); // padding
			}
		}
		this.lines.push([...point, this.newOrientation]);
		for (let i = 0; i < 2; ++i) {
			this.color.push(this.currentColor);
			this.sizes.push(0); // padding
		}
	}
	keyDown(key: KeyboardEvent): void {
		super.keyDown(key);
		if (key.key.toUpperCase() == "V") {
			this.newOrientation = "V";
		} else if (key.key.toUpperCase() == "H") {
			this.newOrientation = "H";
		}
	}
	protected get verticies(): number[][] {
		return this.lines.map(([x, y, type]) => {
			if (type == "V") {
				return [x, 1, x, -1];
			} else {
				return [1, y, -1, y];
			}
		});
	}
}

export class CircleManager extends BaseShapeManager {
	protected positions: [number, number][] = [];
	private static readonly SCALE = 0.05;
	private static readonly VERTEX_REFERENCE = [...Array(359).keys()].map((e) => {
		const [v1, v2] = [Math.PI * (e / 180), Math.PI * ((e + 1) / 180)];
		return [
			[0, 0],
			[Math.cos(v1), Math.sin(v1)],
			[Math.cos(v2), Math.sin(v2)],
		].map(([rx, ry]) => [rx * this.SCALE, ry * this.SCALE]);
	});
	draw(): void {
		if (this.positions.length <= 0) return;
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(
			gl.TRIANGLES,
			0,
			this.positions.length * CircleManager.VERTEX_REFERENCE.length * 3
		);
	}
	addPoint(point: [number, number]): void {
		if (this.positions.length >= 3) {
			this.positions.shift();
			for (let i = 0; i < CircleManager.VERTEX_REFERENCE.length * 3; ++i) {
				this.color.shift();
				this.sizes.shift(); // padding
			}
		}
		this.positions.push(point);
		for (let i = 0; i < CircleManager.VERTEX_REFERENCE.length * 3; ++i) {
			this.color.push(this.currentColor);
			this.sizes.push(0);
		}
	}
	protected get verticies(): number[][] {
		return this.positions.map(([x, y]) =>
			CircleManager.VERTEX_REFERENCE.map((triangle) =>
				triangle.map(([rx, ry]) => [rx + x, ry + y])
			).flat(2)
		);
	}
}

export class TriangleManager extends BaseShapeManager {
	protected positions: [number, number][] = [];
	private static readonly SCALE = 0.05;
	private static readonly VERTEX_REFERENCE = [
		[1, 0],
		[-0.5, Math.sqrt(3) / 2],
		[-0.5, -Math.sqrt(3) / 2],
	].map(([rx, ry]) => [rx * this.SCALE, ry * this.SCALE]);
	draw(): void {
		if (this.positions.length <= 0) return;
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(
			gl.TRIANGLES,
			0,
			this.positions.length * TriangleManager.VERTEX_REFERENCE.length
		);
	}
	addPoint(point: [number, number]): void {
		if (this.positions.length >= 3) {
			this.positions.shift();
			for (let i = 0; i < TriangleManager.VERTEX_REFERENCE.length; ++i) {
				this.color.shift();
				this.sizes.shift(); // padding
			}
		}
		this.positions.push(point);
		for (let i = 0; i < TriangleManager.VERTEX_REFERENCE.length; ++i) {
			this.color.push(this.currentColor);
			this.sizes.push(0);
		}
	}
	protected get verticies(): number[][] {
		return this.positions.map(([x, y]) =>
			TriangleManager.VERTEX_REFERENCE.map(([rx, ry]) => [rx + x, ry + y]).flat()
		);
	}
}
