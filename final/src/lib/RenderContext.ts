import { Mat4 } from "neon-matrix";
import type { GLAttribute } from "./GLAttribute";

export class SceneOptions {
	background: [number, number, number] = [0, 0, 0];
}

type KeyOfType<T, V> = keyof {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[P in keyof T as T[P] extends V ? P : never]: any;
};

export interface TransformOp {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	op: KeyOfType<Mat4, (...args: any[]) => unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	param: any[];
}

export class Transform {
	ops: TransformOp[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	addOp(op: KeyOfType<Mat4, (...args: any[]) => unknown>, ...param: unknown[]): void {
		this.ops.push({
			op,
			param,
		});
	}

	push(op: TransformOp) {
		this.ops.push(op);
	}

	pop(): TransformOp | undefined {
		return this.ops.pop();
	}

	clear() {
		this.ops.length = 0;
	}

	getMat(index: number = this.ops.length): Mat4 {
		const ret = Mat4.create();
		this.ops.slice(0, index).forEach(({ op, param }) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(<(...args: any[]) => any>ret[op]).bind(ret)(...param);
		});
		return ret;
	}
}

export interface RenderContext {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	sceneOpt: SceneOptions;
	// vertex shader
	mvpMatUnif: WebGLUniformLocation;
	modelMatUnif: WebGLUniformLocation;
	normalMatUnif: WebGLUniformLocation;
	lightMvpUnif: WebGLUniformLocation;
	colorAttr: GLAttribute;
	vertexAttr: GLAttribute;
	normalAttr: GLAttribute;
	// fragment shader
	lightSrcUnif: WebGLUniformLocation;
	viewPosUnif: WebGLUniformLocation;
	kaUnif: WebGLUniformLocation;
	kdUnif: WebGLUniformLocation;
	ksUnif: WebGLUniformLocation;
	shininessUnif: WebGLUniformLocation;
	textureEnableUnif: WebGLUniformLocation;
	textureUnif: WebGLUniformLocation;
}