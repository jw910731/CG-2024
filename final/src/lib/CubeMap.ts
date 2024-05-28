import vertexShader from "$assets/cubemap_vert.hlsl?raw";
import fragmentShader from "$assets/cubemap_frag.hlsl?raw";
import { createProgram } from "./glutils";
import type { Mat4 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";

export class CubeMap {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	textureRoot: string;

	// assets
	vert = [-1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1];
	texture?: WebGLTexture;

	// vshad resource
	private vertexAttr: GLAttribute;
	// fshad resource
	private envCubeUnif: WebGLUniformLocation;
	private vpInvMatUnif: WebGLUniformLocation;
	constructor(gl: WebGL2RenderingContext, textureRoot: string) {
		this.gl = gl;
		this.program = createProgram(gl, {
			vertexShaderSrc: vertexShader,
			fragmentShaderSrc: fragmentShader,
		});
		gl.useProgram(this.program);
		this.vertexAttr = new GLAttribute(gl, gl.getAttribLocation(this.program, "a_pos"));
		this.envCubeUnif = gl.getUniformLocation(this.program, "u_envCubeMap")!;
		this.vpInvMatUnif = gl.getUniformLocation(
			this.program,
			"u_viewDirectionProjectionInverse"
		)!;
		this.textureRoot = textureRoot;
		(async () => {
			await this.prepare();
		})();
	}

	private async prepare() {
		const { gl } = this;
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

		const faceInfos = [
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
				name: "+x.jpg",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
				name: "-x.jpg",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
				name: "+y.jpg",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
				name: "-y.jpg",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
				name: "+z.jpg",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
				name: "-z.jpg",
			},
		];
		for (const faceInfo of faceInfos) {
			const { target, name: fName } = faceInfo;

			const image = await createImageBitmap(
				await (await fetch(this.textureRoot + "/" + fName)).blob()
			);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		}
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		this.texture = texture!;
	}

	draw(vpMat: Mat4): void {
		if (!this.texture) return;
		const { gl } = this;
		vpMat[12] = 0;
		vpMat[13] = 0;
		vpMat[14] = 0;
		gl.useProgram(this.program);
		gl.depthFunc(gl.LEQUAL);
		gl.uniformMatrix4fv(this.vpInvMatUnif, false, vpMat.invert());
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		gl.uniform1i(this.envCubeUnif, 0);
		this.vertexAttr.prepareData(new Float32Array(this.vert), 3);
		this.vertexAttr.enable();
		gl.drawArrays(gl.TRIANGLES, 0, this.vert.length / 3);
	}
}
