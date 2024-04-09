import { Mat3, Vec2 } from "neon-matrix";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";
import type { Vec2Like } from "neon-matrix/dist/src/Vec2";

export abstract class BaseShape {
	protected context: RenderContext;
	private modelMat: Mat3 = new Mat3();
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
	keyDown(key: KeyboardEvent) {
		key;
	}
	public get mat(): Mat3 {
		return this.modelMat;
	}
	protected abstract get color(): Color[];
	protected abstract get verticies(): number[][];
}

export class Rectangle extends BaseShape {
	private readonly currentColor: Color;
	constructor(context: RenderContext, color: Color) {
		super(context);
		this.currentColor = color;
	}

	draw(): void {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	protected get color(): Color[] {
		return Array(4).fill(this.currentColor);
	}
	protected get verticies(): number[][] {
		return [
			[1, 1],
			[-1, 1],
			[-1, -1],
			[1, -1],
		].map((v) => <[number, number]>this.mat.multiplyVec(<Vec2Like>v));
	}
}

export class Circle extends BaseShape {
	private readonly currentColor: Color;
	constructor(context: RenderContext, color: Color) {
		super(context);
		this.currentColor = color;
	}

	draw(): void {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.granularity * 2);
		this.roundGranularity = -1;
	}

	private roundGranularity = -1;
	private get granularity(): number {
		if (this.roundGranularity == -1) {
			const samples = 10;
			const size =
				Array(samples)
					.fill(0)
					.map(() => Math.random() * Math.PI * 0.5)
					.map((deg) => {
						return new Vec2(
							this.mat.multiplyVec(Vec2.fromValues(0, 1).rotate([0, 0], deg))
						).magnitude;
					})
					.reduce((acc, e) => acc + e) / samples;
			this.roundGranularity = Math.round(36 / (Math.sqrt(size) / 2));
		}
		return this.roundGranularity;
	}

	protected get color(): Color[] {
		return Array(this.granularity * 2).fill(this.currentColor);
	}

	protected get verticies(): number[][] {
		return [...Array(this.granularity).keys()]
			.map((e) => {
				const [v1, v2] = [
					Math.PI * (e / (this.granularity / 2)),
					Math.PI * ((e + 1) / (this.granularity / 2)),
				];
				return [
					[Math.cos(v1), Math.sin(v1)],
					[Math.cos(v2), Math.sin(v2)],
				];
			})
			.flat()
			.map((v) => <[number, number]>this.mat.multiplyVec(<Vec2Like>v));
	}
}

export class DockerShape extends BaseShape {
	private readonly currentColor: Color;
	constructor(context: RenderContext, color: Color) {
		super(context);
		this.currentColor = color;
	}

	private bezier(t: number): [number, number] {
		return [
			((1 - t) * ((1 - t) * ((1 - t) * 12 + t * 10) + t * ((1 - t) * 10 + t * -3)) +
				t * ((1 - t) * ((1 - t) * 10 + t * -3) + t * ((1 - t) * -3 + t * 0)) -
				6) /
				12,
			((1 - t) * ((1 - t) * ((1 - t) * 8 + t * 4) + t * ((1 - t) * 4 + t * 2)) +
				t * ((1 - t) * ((1 - t) * 4 + t * 2) + t * ((1 - t) * 2 + t * 8)) -
				6) /
				12,
		];
	}

	private maxBezierDerivative(t: number): number {
		return Math.max(
			6 * (-(t - 1) * 12 + (3 * t - 2) * 10 - 3 * t * -3 + t * 0 + -3),
			-6 * ((t - 1) * 8 + (2 - 3 * t) * 4 + 3 * t * 2 - t * 8 - 2)
		);
	}

	draw(): void {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.curveVert.length);
		this.vertCache = [];
	}

	private vertCache: [number, number][] = [];
	private get curveVert(): [number, number][] {
		if (this.vertCache.length == 0) {
			let stride = 0;
			for (let t = 0; t < 1; t += stride) {
				stride = Math.max(0.01, 1 / this.maxBezierDerivative(t));
				this.vertCache.push(this.bezier(t));
			}
		}
		return this.vertCache;
	}

	protected get color(): Color[] {
		return Array(this.curveVert.flat().length).fill(this.currentColor);
	}

	protected get verticies(): number[][] {
		return this.vertCache.map((v) => <[number, number]>this.mat.multiplyVec(<Vec2Like>v));
	}
}
