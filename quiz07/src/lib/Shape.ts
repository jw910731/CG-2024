import { Mat4, Vec3 } from "neon-matrix";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";

export abstract class BaseShape {
	protected context: RenderContext;
	private modelMat: Mat4 = Mat4.create();
	private _refreshVertex: boolean = true;
	constructor(context: RenderContext) {
		this.context = context;
	}
	// prepare basic data
	private vertexCache: Vec3[] = [];
	private prevMat = this.mat.clone();
	draw(): void {
		if (!this.prevMat.equals(this.mat)) {
			this._refreshVertex = true;
			this.prevMat = this.mat.clone();
		}
		const { colorAttr, vertexAttr } = this.context;
		colorAttr.prepareData(this.color, 4);
		if (this.vertexCache.length <= 0 || this._refreshVertex) {
			this._refreshVertex = false;
			this.vertexCache = this.verticies.map((v) => this.mat.transform(new Vec3(v)));
		}
		vertexAttr.prepareData(this.vertexCache, 3);
	}
	public get mat(): Mat4 {
		return this.modelMat;
	}

	public get invM(): Mat4 {
		return this.mat.clone().invert();
	}

	protected get refreshVertex(): boolean {
		return this._refreshVertex;
	}
	protected abstract get color(): Color[];
	protected abstract get verticies(): Vec3[];
	get joints(): Vec3[] {
		if (this.vertexCache.length <= 0 || this._refreshVertex) {
			this._refreshVertex = false;
			this.vertexCache = this.verticies.map((v) => this.mat.transform(new Vec3(v)));
		}
		return [this.vertexCache[0], this.vertexCache[this.vertexCache.length - 1]];
	}
}

export class TestPolygon extends BaseShape {
	// prettier-ignore
	private readonly _vertices = [
		1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, //front
		1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //right
		1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //up
		-1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //left
		-1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, //bottom
		1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 //back
	];
	// prettier-ignore
	private readonly colors = [
		0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, //front
		0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, //right
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //up
		1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, //left
		1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, //bottom
		0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, //back
	];
	// prettier-ignore
	private readonly normals = [
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, //bottom
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 //back
    ];

	draw() {
		super.draw();
		const { gl, normalAttr } = this.context;
		normalAttr.prepareData(
			this.chunkArray(this.normals, 3).map((e) => new Vec3(...e)),
			3
		);
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this.verticies.length);
	}

	private chunkArray<T>(array: Array<T>, chunkSize: number): T[][] {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		return chunks;
	}

	protected get color(): Color[] {
		const chunkedArray = this.chunkArray(this.colors, 3).map(
			(e) => new Color([e[0], e[1], e[2]])
		);
		return chunkedArray;
	}
	protected get verticies(): Vec3[] {
		const chunkedArray = this.chunkArray(this._vertices, 3).map((e) => new Vec3(...e));
		return chunkedArray;
	}
}
