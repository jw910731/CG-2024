import { Mat4, Vec3 } from "neon-matrix";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";
import icomesh from "icomesh";
import { OBJLoader } from "@loaders.gl/obj";
import type { Mesh } from "@loaders.gl/schema";

// https://github.com/microsoft/TypeScript/issues/26223#issuecomment-674514787
// here comes the magic
type BuildPowersOf2LengthArrays<N extends number, R extends never[][]> = R[0][N] extends never
	? R
	: BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>;

type ConcatLargestUntilDone<
	N extends number,
	R extends never[][],
	B extends never[],
> = B["length"] extends N
	? B
	: [...R[0], ...B][N] extends never
		? ConcatLargestUntilDone<
				N,
				R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
				B
			>
		: ConcatLargestUntilDone<
				N,
				R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
				[...R[0], ...B]
			>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Replace<R extends any[], T> = { [K in keyof R]: T };

type TupleOf<T, N extends number> = number extends N
	? T[]
	: {
			[K in N]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U
				? U extends never[][]
					? Replace<ConcatLargestUntilDone<K, U, []>, T>
					: never
				: never;
		}[N];

function chunkArray<T, L extends number>(array: T[], chunkSize: L): TupleOf<T, L>[] {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return <TupleOf<T, L>[]>chunks;
}

export abstract class BaseShape {
	protected context: RenderContext;
	constructor(context: RenderContext) {
		this.context = context;
	}
	draw(): void {
		const { colorAttr, vertexAttr, normalAttr } = this.context;
		colorAttr.prepareData(this.color, 4);
		vertexAttr.prepareData(this.vertices, 3);
		normalAttr.prepareData(this.normals, 3);
	}
	protected abstract get color(): Float32Array;
	protected abstract get vertices(): Float32Array;
	protected abstract get normals(): Float32Array;
}

export class Cube extends BaseShape {
	// prettier-ignore
	private readonly _vertices = new Float32Array([
		1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, //front
		1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //right
		1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //up
		-1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //left
		-1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, //bottom
		1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 //back
	]);
	// prettier-ignore
	private readonly _color = new Float32Array([
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //front
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //right
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //up
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //left
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //bottom
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //back
	]);
	// prettier-ignore
	private readonly _normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, //bottom
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 //back
    ]);

	draw() {
		super.draw();
		const { gl, colorAttr } = this.context;
		colorAttr.prepareData(this.color, 3);
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this._vertices.length / 3);
	}

	protected get color(): Float32Array {
		return this._color;
	}
	protected get vertices(): Float32Array {
		return this._vertices;
	}

	protected get normals(): Float32Array {
		return this._normals;
	}
}

export class Sphere extends BaseShape {
	protected _vertex: Float32Array;
	protected _normals: Float32Array;
	protected _color: Float32Array;

	constructor(context: RenderContext, color: Color = Color.RED) {
		super(context);
		const { vertices, triangles } = icomesh();
		const calcNormal = (p1: Vec3, p2: Vec3, p3: Vec3) => {
			const A = p2.clone().subtract(p1);
			const B = p3.clone().subtract(p1);
			return new Vec3(A.y * B.z - A.z * B.y, A.z * B.x - A.x * B.z, A.x * B.y - A.y * B.x);
		};
		this._color = new Float32Array(Array(vertices.length).fill(color));
		this._vertex = new Float32Array(triangles.map((idx) => vertices[idx]));
		this._normals = new Float32Array(
			chunkArray([...triangles], 9).flatMap((vs) => {
				const vecs = chunkArray(vs, 3).map((e) => Vec3.fromValues(...e));
				const normals = calcNormal(vecs[0], vecs[1], vecs[2]);
				return [...normals, ...normals, ...normals];
			})
		);
	}

	draw() {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);
	}

	protected get color(): Float32Array {
		return this._color;
	}
	protected get vertices(): Float32Array {
		return this._vertex;
	}
	protected get normals(): Float32Array {
		return this._normals;
	}
}

export class ObjShape extends BaseShape {
	mesh: Mesh;
	_color: Float32Array;
	colorBuf: WebGLBuffer;
	constructor(context: RenderContext, file: string) {
		super(context);
		this.mesh = OBJLoader.parseTextSync(file);
		this._color = new Float32Array(
			Array(this.mesh.header!.vertexCount)
				.fill(Color.GREEN)
				.flatMap((e) => [...e.values()])
		);
		this.colorBuf = context.gl.createBuffer()!;
	}

	draw() {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(this.mesh.mode, 0, this.mesh.header!.vertexCount);
	}

	protected get color(): Float32Array {
		return this._color;
	}

	protected get vertices(): Float32Array {
		return <Float32Array>this.mesh.attributes["POSITION"].value;
	}
	protected get normals(): Float32Array {
		return <Float32Array>this.mesh.attributes["NORMAL"].value;
	}
}
