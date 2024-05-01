import { Mat4, Vec3 } from "neon-matrix";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";
import icomesh from "icomesh";

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
		const { colorAttr, vertexAttr, normalAttr } = this.context;
		colorAttr.prepareData(this.color, 4);
		if (this.vertexCache.length <= 0 || this._refreshVertex) {
			this._refreshVertex = false;
			this.vertexCache = this.verticies.map((v) => this.mat.transform(new Vec3(v)));
		}
		vertexAttr.prepareData(this.vertexCache, 3);
		normalAttr.prepareData(this.normals, 3);
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
	protected abstract get normals(): Vec3[];
	get joints(): Vec3[] {
		if (this.vertexCache.length <= 0 || this._refreshVertex) {
			this._refreshVertex = false;
			this.vertexCache = this.verticies.map((v) => this.mat.transform(new Vec3(v)));
		}
		return [this.vertexCache[0], this.vertexCache[this.vertexCache.length - 1]];
	}
}

function chunkArray<T>(array: Array<T>, chunkSize: number): T[][] {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

export class Cube extends BaseShape {
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
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //front
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //right
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //up
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //left
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //bottom
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //back
	];
	// prettier-ignore
	private readonly _normals = [
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, //bottom
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 //back
    ];

	draw() {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this.verticies.length);
	}

	protected get color(): Color[] {
		const chunkedArray = chunkArray(this.colors, 3).map((e) => new Color([e[0], e[1], e[2]]));
		return chunkedArray;
	}
	protected get verticies(): Vec3[] {
		const chunkedArray = chunkArray(this._vertices, 3).map((e) => new Vec3(...e));
		return chunkedArray;
	}

	protected get normals(): Vec3[] {
		const chunkedArray = chunkArray(this._normals, 3).map((e) => new Vec3(...e));
		return chunkedArray;
	}
}

export class Sphere extends BaseShape {
	protected _vertex: Vec3[];
	protected _normals: Vec3[];
	protected refColor: Color;

	constructor(context: RenderContext, color: Color = Color.RED) {
		super(context);
		this.refColor = color;
		this._vertex = [];
		this._normals = [];
		const { vertices, triangles } = icomesh();
		const chunkVertex = chunkArray([...vertices.values()], 3);
		const calcNormal = (p1: Vec3, p2: Vec3, p3: Vec3) => {
			const A = p2.clone().subtract(p1);
			const B = p3.clone().subtract(p1);
			return new Vec3(A.y * B.z - A.z * B.y, A.z * B.x - A.x * B.z, A.x * B.y - A.y * B.x);
		};

		chunkArray([...triangles.values()], 3).forEach((ps) => {
			ps.forEach((p) => {
				this._vertex.push(new Vec3(...chunkVertex[p]));
			});
		});
		chunkArray(this._vertex, 3).forEach((vs) => {
			const normals = calcNormal(vs[0], vs[1], vs[2]);
			for (let i = 0; i < 3; i++) {
				this._normals.push(normals);
			}
		});
	}

	draw() {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this.verticies.length);
	}

	protected get color(): Color[] {
		return Array(this._vertex.length).fill(this.refColor);
	}
	protected get verticies(): Vec3[] {
		return this._vertex;
	}

	protected get normals(): Vec3[] {
		return this._normals;
	}
}
