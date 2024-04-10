import { Mat3, Vec2 } from "neon-matrix";
import type { Vec2Like } from "neon-matrix/dist/src/Vec2";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";

export abstract class BaseShape {
	protected context: RenderContext;
	private modelMat: Mat3 = new Mat3();
	private _refreshVertex: boolean = true;
	constructor(context: RenderContext) {
		this.context = context;
	}
	// prepare basic data
	private vertexCache: [number, number][] = [];
	private prevMat = this.mat.copy();
	draw(): void {
		if (!Mat3.equals(this.prevMat, this.mat)) {
			this._refreshVertex = true;
			this.prevMat = this.mat.copy();
		}
		const { colorAttr, vertexAttr } = this.context;
		colorAttr.prepareData(
			this.color.map((c) => c.color),
			4
		);
		if (this.vertexCache.length <= 0 || this._refreshVertex) {
			this._refreshVertex = false;
			this.vertexCache = this.verticies.map(
				(v) => <[number, number]>this.mat.multiplyVec(<Vec2Like>v)
			);
		}
		vertexAttr.prepareData(this.vertexCache, 2);
	}
	keyDown(key: KeyboardEvent) {
		key;
	}
	public get mat(): Mat3 {
		return this.modelMat;
	}

	public get invM(): Mat3 {
		return this.mat.copy().invert();
	}

	protected get refreshVertex(): boolean {
		return this._refreshVertex;
	}
	protected abstract get color(): Color[];
	protected abstract get verticies(): [number, number][];
	get joints(): [number, number][] {
		if (this.vertexCache.length <= 0 || this._refreshVertex) {
			this._refreshVertex = false;
			this.vertexCache = this.verticies.map((v) => <[number, number]>this.mat.multiplyVec(v));
		}
		return [this.vertexCache[0], this.vertexCache[this.vertexCache.length - 1]];
	}
}

export class Rectangle extends BaseShape {
	currentColor: Color;
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

	get joints(): [number, number][] {
		return this.verticies;
	}

	protected get color(): Color[] {
		return Array(4).fill(this.currentColor);
	}
	protected get verticies(): [number, number][] {
		return [
			[1, 1],
			[-1, 1],
			[-1, -1],
			[1, -1],
		];
	}
}

export class Circle extends BaseShape {
	currentColor: Color;
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
	}

	private roundGranularity = -1;
	private get granularity(): number {
		if (this.refreshVertex) {
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

	protected get verticies(): [number, number][] {
		return [...Array(this.granularity).keys()]
			.map((e) => {
				const [v1, v2] = [
					Math.PI * (e / (this.granularity / 2)),
					Math.PI * ((e + 1) / (this.granularity / 2)),
				];
				return <[number, number][]>[
					[Math.cos(v1), Math.sin(v1)],
					[Math.cos(v2), Math.sin(v2)],
				];
			})
			.flat();
	}
}

export class DockerShape extends BaseShape {
	currentColor: Color;
	constructor(context: RenderContext, color: Color) {
		super(context);
		this.currentColor = color;
	}

	private bezier(t: number): [number, number] {
		return [
			((1 - t) * ((1 - t) * ((1 - t) * 12 + t * 10) + t * ((1 - t) * 10 + t * -3)) +
				t * ((1 - t) * ((1 - t) * 10 + t * -3) + t * ((1 - t) * -3 + t * 0)) -
				5.6) /
				6.45 -
				0.0273,
			((1 - t) * ((1 - t) * ((1 - t) * 8 + t * 4) + t * ((1 - t) * 4 + t * 2)) +
				t * ((1 - t) * ((1 - t) * 4 + t * 2) + t * ((1 - t) * 2 + t * 8)) -
				6) /
				6.45 -
				0.01682,
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
	}

	private vertCache: [number, number][] = [];
	private get curveVert(): [number, number][] {
		if (this.vertCache.length == 0) {
			let stride = 0;
			for (let t = 0; t <= 1; t += stride) {
				stride = Math.max(0.01, 1 / this.maxBezierDerivative(t));
				this.vertCache.push(this.bezier(t));
			}
		}
		return this.vertCache;
	}

	protected get color(): Color[] {
		return Array(this.curveVert.flat().length).fill(this.currentColor);
	}

	protected get verticies(): [number, number][] {
		return this.curveVert;
	}
}

export class Triangle extends BaseShape {
	currentColor: Color;
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
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
	}

	protected get color(): Color[] {
		return Array(3).fill(this.currentColor);
	}

	get joints() {
		return this.verticies;
	}

	protected get verticies(): [number, number][] {
		return [
			[1, 0],
			[-0.5, Math.sqrt(3) / 2],
			[-0.5, -Math.sqrt(3) / 2],
		];
	}
}
