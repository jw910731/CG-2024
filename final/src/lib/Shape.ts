import { Vec3 } from "neon-matrix";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import type { RenderContext } from "./RenderContext";
import icomesh from "icomesh";
import { OBJLoader } from "@loaders.gl/obj";
import { Float32, type Mesh } from "@loaders.gl/schema";
import { load } from "@loaders.gl/core";

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

async function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve) => {
		const image = new Image();
		image.onload = function () {
			resolve(image);
		};
		image.src = url;
	});
}

export interface Drawable {
	draw(): void;
}

export abstract class BaseShape implements Drawable {
	protected context: RenderContext;
	constructor(context: RenderContext) {
		this.context = context;
	}
	draw(): void {
		const { colorAttr, vertexAttr, normalAttr } = this.context;
		colorAttr.prepareData(this.color, 3);
		vertexAttr.prepareData(this.vertices, 3);
		normalAttr.prepareData(this.normals, 3);
	}
	protected abstract get color(): Float32Array;
	public abstract get vertices(): Float32Array;
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
	private readonly _normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, //bottom
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 //back
    ]);
	protected _color: Float32Array;

	constructor(context: RenderContext, color: Color = Color.fromValues(1, 0.4, 0.4)) {
		super(context);
		this._color = new Float32Array(
			Array(36)
				.fill([...color])
				.flat()
		);
	}

	draw() {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this._vertices.length / 3);
	}

	protected get color(): Float32Array {
		return this._color;
	}
	public get vertices(): Float32Array {
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
		const { vertices, triangles } = icomesh(3);
		const chunkVertex = chunkArray([...vertices], 3);
		const calcNormal = (
			p1: TupleOf<number, 3>,
			p2: TupleOf<number, 3>,
			p3: TupleOf<number, 3>
		) => {
			const A = Vec3.fromValues(...p2).subtract(p1);
			const B = Vec3.fromValues(...p3).subtract(p1);
			return [A.y * B.z - A.z * B.y, A.z * B.x - A.x * B.z, A.x * B.y - A.y * B.x];
		};
		this._color = new Float32Array(
			Array(triangles.length)
				.fill([...color])
				.flat()
		);
		this._vertex = new Float32Array([...triangles].map((i) => [...chunkVertex[i]]).flat());
		this._normals = new Float32Array(
			chunkArray(
				[...triangles].map((i) => chunkVertex[i]),
				3
			).flatMap((v) => {
				const normals = calcNormal(...v);
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
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
	}

	protected get color(): Float32Array {
		return this._color;
	}
	public get vertices(): Float32Array {
		return this._vertex;
	}
	protected get normals(): Float32Array {
		return this._normals;
	}
}

export class ObjShape extends BaseShape {
	mesh?: Mesh;
	_color?: Float32Array;
	constructor(context: RenderContext, uri: string, color: Color = Color.GREEN) {
		super(context);
		(async () => {
			await this.prepare(uri, color);
		})();
	}

	protected async prepare(uri: string, color: Color) {
		this.mesh = await load(uri, OBJLoader);
		this._color = new Float32Array(
			Array(this.mesh.header!.vertexCount)
				.fill(color)
				.flatMap((e) => [...e.values()])
		);
	}

	draw() {
		if (!this.mesh || !this._color) return;
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(this.mesh.mode, 0, this.mesh.header!.vertexCount);
	}

	protected get color(): Float32Array {
		return this._color!;
	}

	public get vertices(): Float32Array {
		return <Float32Array>this.mesh!.attributes["POSITION"].value;
	}
	protected get normals(): Float32Array {
		return <Float32Array>this.mesh!.attributes["NORMAL"].value;
	}
}

export class PortalGun extends ObjShape {
	textureBuffer: WebGLTexture;
	constructor(context: RenderContext) {
		super(context, "portal_gun/portal_gun_packed.obj");
		this.textureBuffer = context.gl.createTexture()!;
	}
	protected async prepare(uri: string) {
		const { gl } = this.context;
		this.mesh = await load(uri, OBJLoader);
		// const rawImg = await(await (await fetch("portal_gun/PortalGun_Albedo.png")).blob()).arrayBuffer();
		const img = await loadImage("portal_gun/PortalGun_Albedo.png");
		const rawData = [...this.mesh!.attributes["TEXCOORD_0"].value.values()];
		this._color = new Float32Array(chunkArray(rawData, 2).flatMap(([u, v]) => [u, v, 0]));
		gl.bindTexture(gl.TEXTURE_2D, this.textureBuffer);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			img.width,
			img.height,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			img
		);
	}
	draw(): void {
		if (!this.mesh || !this._color) return;
		super.draw();
		const { gl } = this.context;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textureBuffer);
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(this.mesh.mode, 0, this.mesh.header!.vertexCount);
	}
}

export class Portal extends BaseShape {

	// prettier-ignore
	private readonly vert_data = [
		1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //right
	];
	private readonly _vertices = new Float32Array(this.vert_data);
	// prettier-ignore
	private readonly _normals = new Float32Array([
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //right
    ]);
	protected _color: Float32Array;

	constructor(context: RenderContext) {
		super(context);
		this._color = new Float32Array(chunkArray(this.vert_data, 3).flatMap(([x, y, z]) => [-1, y, z]));
	}

	draw() {
		super.draw();
		const { gl } = this.context;
		Object.values(this.context)
			.filter((e) => e instanceof GLAttribute)
			.map((e) => e.enable());
		gl.drawArrays(gl.TRIANGLES, 0, this._vertices.length / 3);
	}

	protected get color(): Float32Array {
		return this._color;
	}
	public get vertices(): Float32Array {
		return this._vertices;
	}

	protected get normals(): Float32Array {
		return this._normals;
	}
}
