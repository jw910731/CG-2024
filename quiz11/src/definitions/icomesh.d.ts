declare module "icomesh" {
	export default function icomesh(
		order: number = 4,
		uvMap: boolean = false
	): { vertices: Float32Array; triangles: Uint16Array | Uint32Array; uv: Float32Array? };
}
