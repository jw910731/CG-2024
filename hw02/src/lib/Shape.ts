import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";

export abstract class BaseShape {
	protected color: Color[] = [];
	protected currentColor: Color = Color.RED;
	protected context: RenderContext;
	constructor(context: RenderContext) {
		this.context = context;
	}
	// prepare basic data
	draw(): void {
		const { colorAttr, vertexAttr } = this.context;
		colorAttr.prepareData(
			this.color.map((c) => c.color),
			4
		);
		vertexAttr.prepareData(this.verticies, 2);
	}
	abstract keyDown(key: KeyboardEvent): void;
	protected abstract get verticies(): number[][];
}

export class Circle extends BaseShape {
	private static readonly SCALE = 1;
	private static readonly VERTEX_REFERENCE = [...Array(36).keys()].map((e) => {
		const [v1, v2] = [Math.PI * (e / 18), Math.PI * ((e + 1) / 18)];
		return [
			[Math.cos(v1), Math.sin(v1)],
			[Math.cos(v2), Math.sin(v2)],
		].map(([rx, ry]) => [rx * this.SCALE, ry * this.SCALE]);
	});

	constructor(context: RenderContext) {
		super(context);
		this.color = Circle.VERTEX_REFERENCE.flat().map(() => Color.GREEN);
	}

	draw(): void {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLE_FAN, 0, Circle.VERTEX_REFERENCE.length * 2);
	}
	keyDown(key: KeyboardEvent): void {
		key;
	}
	protected get verticies(): number[][] {
		return [Circle.VERTEX_REFERENCE.flat(2)];
	}
}
