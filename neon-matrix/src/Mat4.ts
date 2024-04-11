import { EPSILON } from "./common";
import { Vec3, Vec3Like } from "./Vec3";

/**
 * A 4x4 Matrix given as a {@link Mat4}, a 16-element Float32Array, or an array
 * of 16 numbers.
 */
export type Mat4Like =
	| [
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
	  ]
	| Float32Array;

const IDENTITY_4X4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/**
 * A 4x4 Matrix
 */
export class Mat4 extends Float32Array {
	/**
	 * The number of bytes in a {@link Mat4}.
	 */
	static readonly BYTE_LENGTH = 16 * Float32Array.BYTES_PER_ELEMENT;

	/**
	 * Create a {@link Mat4}.
	 */
	constructor(...values: [Readonly<Mat4Like> | ArrayBufferLike, number?] | number[]) {
		switch (values.length) {
			case 16:
				super(values);
				break;
			case 2:
				super(values[0] as ArrayBufferLike, values[1], 16);
				break;
			case 1:
				if (typeof values[0] === "number") {
					super(Array(16).fill(values[0]));
				} else {
					super(values[0] as ArrayBufferLike, 0, 16);
				}
				break;
			default:
				super(IDENTITY_4X4);
				break;
		}
	}

	//============
	// Attributes
	//============

	/**
	 * A string representation of `this`
	 * Equivalent to `Mat4.str(this);`
	 */
	get str(): string {
		return Mat4.str(this);
	}

	get x(): number {
		return this[0];
	}
	get y(): number {
		return this[1];
	}
	get z(): number {
		return this[2];
	}
	get w(): number {
		return this[3];
	}

	//================
	// Static methods
	//================

	/**
	 * Creates a new, identity {@link Mat4}
	 * @category Static
	 *
	 * @returns A new {@link Mat4}
	 */
	static create(): Mat4 {
		return new Mat4();
	}
	/**
	 * Copy the values from one {@link Mat4} to another
	 *
	 * @returns `out`
	 */
	clone(): Mat4 {
		const out = new Mat4();
		out[0] = this[0];
		out[1] = this[1];
		out[2] = this[2];
		out[3] = this[3];
		out[4] = this[4];
		out[5] = this[5];
		out[6] = this[6];
		out[7] = this[7];
		out[8] = this[8];
		out[9] = this[9];
		out[10] = this[10];
		out[11] = this[11];
		out[12] = this[12];
		out[13] = this[13];
		out[14] = this[14];
		out[15] = this[15];
		return out;
	}

	/**
	 * Create a new mat4 with the given values
	 * @category Static
	 *
	 * @param values - Matrix components
	 * @returns A new {@link Mat4}
	 */
	static fromValues(...values: number[]): Mat4 {
		return new Mat4(...values);
	}

	/**
	 * Set the components of a mat4 to the given values
	 *
	 * @returns `out`
	 */
	setTo(...values: number[]): Mat4 {
		this[0] = values[0];
		this[1] = values[1];
		this[2] = values[2];
		this[3] = values[3];
		this[4] = values[4];
		this[5] = values[5];
		this[6] = values[6];
		this[7] = values[7];
		this[8] = values[8];
		this[9] = values[9];
		this[10] = values[10];
		this[11] = values[11];
		this[12] = values[12];
		this[13] = values[13];
		this[14] = values[14];
		this[15] = values[15];
		return this;
	}

	/**
	 * Set a {@link Mat4} to the identity matrix
	 * @category Static
	 *
	 * @param out - The receiving Matrix
	 * @returns `out`
	 */
	static identity(): Mat4 {
		return new Mat4();
	}

	/**
	 * Transpose the values of a {@link Mat4}
	 * @category Static
	 *
	 * @param out - the receiving matrix
	 * @param a - the source matrix
	 * @returns `out`
	 */
	transpose(): Mat4 {
		// If we are transposing ourselves we can skip a few steps but have to cache some values
		const a01 = this[1],
			a02 = this[2],
			a03 = this[3];
		const a12 = this[6],
			a13 = this[7];
		const a23 = this[11];

		this[1] = this[4];
		this[2] = this[8];
		this[3] = this[12];
		this[4] = a01;
		this[6] = this[9];
		this[7] = this[13];
		this[8] = a02;
		this[9] = a12;
		this[11] = this[14];
		this[12] = a03;
		this[13] = a13;
		this[14] = a23;

		return this;
	}

	/**
	 * Inverts a {@link Mat4}
	 *
	 * @returns `out`
	 */
	invert(): Mat4 {
		const a00 = this[0],
			a01 = this[1],
			a02 = this[2],
			a03 = this[3];
		const a10 = this[4],
			a11 = this[5],
			a12 = this[6],
			a13 = this[7];
		const a20 = this[8],
			a21 = this[9],
			a22 = this[10],
			a23 = this[11];
		const a30 = this[12],
			a31 = this[13],
			a32 = this[14],
			a33 = this[15];

		const b00 = a00 * a11 - a01 * a10;
		const b01 = a00 * a12 - a02 * a10;
		const b02 = a00 * a13 - a03 * a10;
		const b03 = a01 * a12 - a02 * a11;
		const b04 = a01 * a13 - a03 * a11;
		const b05 = a02 * a13 - a03 * a12;
		const b06 = a20 * a31 - a21 * a30;
		const b07 = a20 * a32 - a22 * a30;
		const b08 = a20 * a33 - a23 * a30;
		const b09 = a21 * a32 - a22 * a31;
		const b10 = a21 * a33 - a23 * a31;
		const b11 = a22 * a33 - a23 * a32;

		// Calculate the determinant
		let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!det) {
			return null;
		}
		det = 1.0 / det;

		this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		this[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		this[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
		this[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		this[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
		this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
		this[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
		this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
		this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
		this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
		this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
		this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

		return this;
	}

	/**
	 * Calculates the adjugate of a {@link Mat4}
	 *
	 * @returns `out`
	 */
	adjoint(): Mat4 {
		const a00 = this[0],
			a01 = this[1],
			a02 = this[2],
			a03 = this[3];
		const a10 = this[4],
			a11 = this[5],
			a12 = this[6],
			a13 = this[7];
		const a20 = this[8],
			a21 = this[9],
			a22 = this[10],
			a23 = this[11];
		const a30 = this[12],
			a31 = this[13],
			a32 = this[14],
			a33 = this[15];

		const b00 = a00 * a11 - a01 * a10;
		const b01 = a00 * a12 - a02 * a10;
		const b02 = a00 * a13 - a03 * a10;
		const b03 = a01 * a12 - a02 * a11;
		const b04 = a01 * a13 - a03 * a11;
		const b05 = a02 * a13 - a03 * a12;
		const b06 = a20 * a31 - a21 * a30;
		const b07 = a20 * a32 - a22 * a30;
		const b08 = a20 * a33 - a23 * a30;
		const b09 = a21 * a32 - a22 * a31;
		const b10 = a21 * a33 - a23 * a31;
		const b11 = a22 * a33 - a23 * a32;

		this[0] = a11 * b11 - a12 * b10 + a13 * b09;
		this[1] = a02 * b10 - a01 * b11 - a03 * b09;
		this[2] = a31 * b05 - a32 * b04 + a33 * b03;
		this[3] = a22 * b04 - a21 * b05 - a23 * b03;
		this[4] = a12 * b08 - a10 * b11 - a13 * b07;
		this[5] = a00 * b11 - a02 * b08 + a03 * b07;
		this[6] = a32 * b02 - a30 * b05 - a33 * b01;
		this[7] = a20 * b05 - a22 * b02 + a23 * b01;
		this[8] = a10 * b10 - a11 * b08 + a13 * b06;
		this[9] = a01 * b08 - a00 * b10 - a03 * b06;
		this[10] = a30 * b04 - a31 * b02 + a33 * b00;
		this[11] = a21 * b02 - a20 * b04 - a23 * b00;
		this[12] = a11 * b07 - a10 * b09 - a12 * b06;
		this[13] = a00 * b09 - a01 * b07 + a02 * b06;
		this[14] = a31 * b01 - a30 * b03 - a32 * b00;
		this[15] = a20 * b03 - a21 * b01 + a22 * b00;
		return this;
	}

	/**
	 * Calculates the determinant of a {@link Mat4}
	 *
	 * @returns determinant of a
	 */
	determinant(): number {
		const a00 = this[0],
			a01 = this[1],
			a02 = this[2],
			a03 = this[3];
		const a10 = this[4],
			a11 = this[5],
			a12 = this[6],
			a13 = this[7];
		const a20 = this[8],
			a21 = this[9],
			a22 = this[10],
			a23 = this[11];
		const a30 = this[12],
			a31 = this[13],
			a32 = this[14],
			a33 = this[15];

		const b0 = a00 * a11 - a01 * a10;
		const b1 = a00 * a12 - a02 * a10;
		const b2 = a01 * a12 - a02 * a11;
		const b3 = a20 * a31 - a21 * a30;
		const b4 = a20 * a32 - a22 * a30;
		const b5 = a21 * a32 - a22 * a31;
		const b6 = a00 * b5 - a01 * b4 + a02 * b3;
		const b7 = a10 * b5 - a11 * b4 + a12 * b3;
		const b8 = a20 * b2 - a21 * b1 + a22 * b0;
		const b9 = a30 * b2 - a31 * b1 + a32 * b0;

		// Calculate the determinant
		return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
	}

	/**
	 * Multiplies two {@link Mat4}
	 *
	 * @param b - The second operand
	 * @returns `out`
	 */
	multiply(b: Readonly<Mat4Like>): Mat4 {
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a03 = this[3];
		const a10 = this[4];
		const a11 = this[5];
		const a12 = this[6];
		const a13 = this[7];
		const a20 = this[8];
		const a21 = this[9];
		const a22 = this[10];
		const a23 = this[11];
		const a30 = this[12];
		const a31 = this[13];
		const a32 = this[14];
		const a33 = this[15];

		// Cache only the current line of the second matrix
		let b0 = b[0];
		let b1 = b[1];
		let b2 = b[2];
		let b3 = b[3];
		this[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		this[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		this[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		this[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		b0 = b[4];
		b1 = b[5];
		b2 = b[6];
		b3 = b[7];
		this[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		this[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		this[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		this[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		b0 = b[8];
		b1 = b[9];
		b2 = b[10];
		b3 = b[11];
		this[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		this[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		this[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		this[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		b0 = b[12];
		b1 = b[13];
		b2 = b[14];
		b3 = b[15];
		this[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		this[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		this[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		this[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		return this;
	}
	/**
	 * Translate a {@link Mat4} by the given vector
	 *
	 * @param v - vector to translate by
	 * @returns `out`
	 */
	translate(v: Readonly<Vec3Like>): Mat4 {
		const x = v[0];
		const y = v[1];
		const z = v[2];

		this[12] = this[0] * x + this[4] * y + this[8] * z + this[12];
		this[13] = this[1] * x + this[5] * y + this[9] * z + this[13];
		this[14] = this[2] * x + this[6] * y + this[10] * z + this[14];
		this[15] = this[3] * x + this[7] * y + this[11] * z + this[15];

		return this;
	}

	/**
	 * Scales the {@link Mat4} by the dimensions in the given {@link Vec3} not using vectorization
	 *
	 * @param v - the {@link Vec3} to scale the matrix by
	 * @returns `out`
	 **/
	scale(v: Readonly<Vec3Like>): Mat4Like {
		const x = v[0];
		const y = v[1];
		const z = v[2];

		this[0] = this[0] * x;
		this[1] = this[1] * x;
		this[2] = this[2] * x;
		this[3] = this[3] * x;
		this[4] = this[4] * y;
		this[5] = this[5] * y;
		this[6] = this[6] * y;
		this[7] = this[7] * y;
		this[8] = this[8] * z;
		this[9] = this[9] * z;
		this[10] = this[10] * z;
		this[11] = this[11] * z;
		return this;
	}

	/**
	 * Rotates a {@link Mat4} by the given angle around the given axis
	 *
	 * @param a - the matrix to rotate
	 * @param rad - the angle to rotate the matrix by
	 * @param axis - the axis to rotate around
	 * @returns `out`
	 */
	rotate(rad: number, axis: Readonly<Vec3Like>): Mat4 {
		let x = axis[0];
		let y = axis[1];
		let z = axis[2];
		let len = Math.sqrt(x * x + y * y + z * z);

		if (len < EPSILON) {
			return null;
		}

		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;

		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const t = 1 - c;

		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a03 = this[3];
		const a10 = this[4];
		const a11 = this[5];
		const a12 = this[6];
		const a13 = this[7];
		const a20 = this[8];
		const a21 = this[9];
		const a22 = this[10];
		const a23 = this[11];

		// Construct the elements of the rotation matrix
		const b00 = x * x * t + c;
		const b01 = y * x * t + z * s;
		const b02 = z * x * t - y * s;
		const b10 = x * y * t - z * s;
		const b11 = y * y * t + c;
		const b12 = z * y * t + x * s;
		const b20 = x * z * t + y * s;
		const b21 = y * z * t - x * s;
		const b22 = z * z * t + c;

		// Perform rotation-specific matrix multiplication
		this[0] = a00 * b00 + a10 * b01 + a20 * b02;
		this[1] = a01 * b00 + a11 * b01 + a21 * b02;
		this[2] = a02 * b00 + a12 * b01 + a22 * b02;
		this[3] = a03 * b00 + a13 * b01 + a23 * b02;
		this[4] = a00 * b10 + a10 * b11 + a20 * b12;
		this[5] = a01 * b10 + a11 * b11 + a21 * b12;
		this[6] = a02 * b10 + a12 * b11 + a22 * b12;
		this[7] = a03 * b10 + a13 * b11 + a23 * b12;
		this[8] = a00 * b20 + a10 * b21 + a20 * b22;
		this[9] = a01 * b20 + a11 * b21 + a21 * b22;
		this[10] = a02 * b20 + a12 * b21 + a22 * b22;
		this[11] = a03 * b20 + a13 * b21 + a23 * b22;

		return this;
	}

	/**
	 * Rotates a matrix by the given angle around the X axis
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @returns `out`
	 */
	rotateX(rad: number): Mat4 {
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a10 = this[4];
		const a11 = this[5];
		const a12 = this[6];
		const a13 = this[7];
		const a20 = this[8];
		const a21 = this[9];
		const a22 = this[10];
		const a23 = this[11];

		// Perform axis-specific matrix multiplication
		this[4] = a10 * c + a20 * s;
		this[5] = a11 * c + a21 * s;
		this[6] = a12 * c + a22 * s;
		this[7] = a13 * c + a23 * s;
		this[8] = a20 * c - a10 * s;
		this[9] = a21 * c - a11 * s;
		this[10] = a22 * c - a12 * s;
		this[11] = a23 * c - a13 * s;
		return this;
	}

	/**
	 * Rotates a matrix by the given angle around the Y axis
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @returns `out`
	 */
	rotateY(rad: number): Mat4 {
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a03 = this[3];
		const a20 = this[8];
		const a21 = this[9];
		const a22 = this[10];
		const a23 = this[11];

		// Perform axis-specific matrix multiplication
		this[0] = a00 * c - a20 * s;
		this[1] = a01 * c - a21 * s;
		this[2] = a02 * c - a22 * s;
		this[3] = a03 * c - a23 * s;
		this[8] = a00 * s + a20 * c;
		this[9] = a01 * s + a21 * c;
		this[10] = a02 * s + a22 * c;
		this[11] = a03 * s + a23 * c;
		return this;
	}

	/**
	 * Rotates a matrix by the given angle around the Z axis
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @returns `out`
	 */
	rotateZ(rad: number): Mat4 {
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a03 = this[3];
		const a10 = this[4];
		const a11 = this[5];
		const a12 = this[6];
		const a13 = this[7];

		// Perform axis-specific matrix multiplication
		this[0] = a00 * c + a10 * s;
		this[1] = a01 * c + a11 * s;
		this[2] = a02 * c + a12 * s;
		this[3] = a03 * c + a13 * s;
		this[4] = a10 * c - a00 * s;
		this[5] = a11 * c - a01 * s;
		this[6] = a12 * c - a02 * s;
		this[7] = a13 * c - a03 * s;
		return this;
	}

	/**
	 * Creates a {@link Mat4} from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, dest, vec);
	 *
	 * @param v - Translation vector
	 * @returns `out`
	 */
	fromTranslation(v: Readonly<Vec3Like>): Mat4 {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = 1;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[10] = 1;
		this[11] = 0;
		this[12] = v[0];
		this[13] = v[1];
		this[14] = v[2];
		this[15] = 1;
		return this;
	}

	/**
	 * Creates a {@link Mat4} from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.scale(dest, dest, vec);
	 *
	 * @param v - Scaling vector
	 * @returns `out`
	 */
	fromScaling(v: Readonly<Vec3Like>): Mat4 {
		this[0] = v[0];
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = v[1];
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[10] = v[2];
		this[11] = 0;
		this[12] = 0;
		this[13] = 0;
		this[14] = 0;
		this[15] = 1;
		return this;
	}

	/**
	 * Creates a {@link Mat4} from a given angle around a given axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotate(dest, dest, rad, axis);
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @param axis - the axis to rotate around
	 * @returns `out`
	 */
	fromRotation(rad: number, axis: Readonly<Vec3Like>): Mat4 {
		let x = axis[0];
		let y = axis[1];
		let z = axis[2];
		let len = Math.sqrt(x * x + y * y + z * z);

		if (len < EPSILON) {
			return this;
		}

		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;

		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const t = 1 - c;

		// Perform rotation-specific matrix multiplication
		this[0] = x * x * t + c;
		this[1] = y * x * t + z * s;
		this[2] = z * x * t - y * s;
		this[3] = 0;
		this[4] = x * y * t - z * s;
		this[5] = y * y * t + c;
		this[6] = z * y * t + x * s;
		this[7] = 0;
		this[8] = x * z * t + y * s;
		this[9] = y * z * t - x * s;
		this[10] = z * z * t + c;
		this[11] = 0;
		this[12] = 0;
		this[13] = 0;
		this[14] = 0;
		this[15] = 1;
		return this;
	}

	/**
	 * Creates a matrix from the given angle around the X axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateX(dest, dest, rad);
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @returns `out`
	 */
	fromXRotation(rad: number): Mat4 {
		const s = Math.sin(rad);
		const c = Math.cos(rad);

		// Perform axis-specific matrix multiplication
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = c;
		this[6] = s;
		this[7] = 0;
		this[8] = 0;
		this[9] = -s;
		this[10] = c;
		this[11] = 0;
		this[12] = 0;
		this[13] = 0;
		this[14] = 0;
		this[15] = 1;
		return this;
	}

	/**
	 * Creates a matrix from the given angle around the Y axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateY(dest, dest, rad);
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @returns `out`
	 */
	fromYRotation(rad: number): Mat4 {
		const s = Math.sin(rad);
		const c = Math.cos(rad);

		// Perform axis-specific matrix multiplication
		this[0] = c;
		this[1] = 0;
		this[2] = -s;
		this[3] = 0;
		this[4] = 0;
		this[5] = 1;
		this[6] = 0;
		this[7] = 0;
		this[8] = s;
		this[9] = 0;
		this[10] = c;
		this[11] = 0;
		this[12] = 0;
		this[13] = 0;
		this[14] = 0;
		this[15] = 1;
		return this;
	}

	/**
	 * Creates a matrix from the given angle around the Z axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateZ(dest, dest, rad);
	 *
	 * @param rad - the angle to rotate the matrix by
	 * @returns `out`
	 */
	fromZRotation(rad: number): Mat4 {
		const s = Math.sin(rad);
		const c = Math.cos(rad);

		// Perform axis-specific matrix multiplication
		this[0] = c;
		this[1] = s;
		this[2] = 0;
		this[3] = 0;
		this[4] = -s;
		this[5] = c;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[10] = 1;
		this[11] = 0;
		this[12] = 0;
		this[13] = 0;
		this[14] = 0;
		this[15] = 1;
		return this;
	}

	/**
	 * Returns the translation vector component of a transformation
	 * matrix. If a matrix is built with fromRotationTranslation,
	 * the returned vector will be the same as the translation vector
	 * originally supplied.
	 * @category Static
	 *
	 * @param  {vec3} out Vector to receive translation component
	 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
	 * @return {vec3} out
	 */
	getTranslation(mat: Readonly<Mat4Like>): Vec3 {
		const out = new Vec3();
		out[0] = mat[12];
		out[1] = mat[13];
		out[2] = mat[14];

		return out;
	}

	/**
	 * Returns the scaling factor component of a transformation
	 * matrix. If a matrix is built with fromRotationTranslationScale
	 * with a normalized Quaternion paramter, the returned vector will be
	 * the same as the scaling vector
	 * originally supplied.
	 *
	 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
	 * @return {vec3} out
	 */
	static getScaling(mat: Readonly<Mat4Like>): Vec3 {
		const m11 = mat[0];
		const m12 = mat[1];
		const m13 = mat[2];
		const m21 = mat[4];
		const m22 = mat[5];
		const m23 = mat[6];
		const m31 = mat[8];
		const m32 = mat[9];
		const m33 = mat[10];
		const out = new Vec3();

		out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
		out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
		out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);

		return out;
	}

	/**
	 * Generates a frustum matrix with the given bounds
	 *
	 * @param left - Left bound of the frustum
	 * @param right - Right bound of the frustum
	 * @param bottom - Bottom bound of the frustum
	 * @param top - Top bound of the frustum
	 * @param near - Near bound of the frustum
	 * @param far - Far bound of the frustum
	 * @returns `out`
	 */
	frustum(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): Mat4 {
		const rl = 1 / (right - left);
		const tb = 1 / (top - bottom);
		const nf = 1 / (near - far);
		this[0] = near * 2 * rl;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = near * 2 * tb;
		this[6] = 0;
		this[7] = 0;
		this[8] = (right + left) * rl;
		this[9] = (top + bottom) * tb;
		this[10] = (far + near) * nf;
		this[11] = -1;
		this[12] = 0;
		this[13] = 0;
		this[14] = far * near * 2 * nf;
		this[15] = 0;
		return this;
	}

	/**
	 * Generates a perspective projection matrix with the given bounds.
	 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
	 * which matches WebGL/OpenGL's clip volume.
	 * Passing null/undefined/no value for far will generate infinite projection matrix.
	 *
	 * @param fovy - Vertical field of view in radians
	 * @param aspect - Aspect ratio. typically viewport width/height
	 * @param near - Near bound of the frustum
	 * @param far - Far bound of the frustum, can be null or Infinity
	 * @returns `out`
	 */
	perspectiveNO(fovy: number, aspect: number, near?: number, far?: number): Mat4 {
		const f = 1.0 / Math.tan(fovy / 2);
		this[0] = f / aspect;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = f;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[11] = -1;
		this[12] = 0;
		this[13] = 0;
		this[15] = 0;
		if (far != null && far !== Infinity) {
			const nf = 1 / (near - far);
			this[10] = (far + near) * nf;
			this[14] = 2 * far * near * nf;
		} else {
			this[10] = -1;
			this[14] = -2 * near;
		}
		return this;
	}

	/**
	 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
	 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
	 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
	 * Passing null/undefined/no value for far will generate infinite projection matrix.
	 *
	 * @param fovy - Vertical field of view in radians
	 * @param aspect - Aspect ratio. typically viewport width/height
	 * @param near - Near bound of the frustum
	 * @param far - Far bound of the frustum, can be null or Infinity
	 * @returns `out`
	 */
	perspectiveZO(fovy: number, aspect: number, near?: number, far?: number): Mat4 {
		const f = 1.0 / Math.tan(fovy / 2);
		this[0] = f / aspect;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = f;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[11] = -1;
		this[12] = 0;
		this[13] = 0;
		this[15] = 0;
		if (far != null && far !== Infinity) {
			const nf = 1 / (near - far);
			this[10] = far * nf;
			this[14] = far * near * nf;
		} else {
			this[10] = -1;
			this[14] = -near;
		}
		return this;
	}

	/**
	 * Generates a perspective projection matrix with the given field of view.
	 * This is primarily useful for generating projection matrices to be used
	 * with the still experiemental WebVR API.
	 *
	 * @param fov - Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
	 * @param near - Near bound of the frustum
	 * @param far - Far bound of the frustum
	 * @returns `out`
	 * @deprecated
	 */
	perspectiveFromFOV(
		fov: { upDegrees: number; downDegrees: number; leftDegrees: number; rightDegrees: number },
		near: number,
		far: number
	): Mat4 {
		const upTan = Math.tan((fov.upDegrees * Math.PI) / 180.0);
		const downTan = Math.tan((fov.downDegrees * Math.PI) / 180.0);
		const leftTan = Math.tan((fov.leftDegrees * Math.PI) / 180.0);
		const rightTan = Math.tan((fov.rightDegrees * Math.PI) / 180.0);
		const xScale = 2.0 / (leftTan + rightTan);
		const yScale = 2.0 / (upTan + downTan);

		this[0] = xScale;
		this[1] = 0.0;
		this[2] = 0.0;
		this[3] = 0.0;
		this[4] = 0.0;
		this[5] = yScale;
		this[6] = 0.0;
		this[7] = 0.0;
		this[8] = -((leftTan - rightTan) * xScale * 0.5);
		this[9] = (upTan - downTan) * yScale * 0.5;
		this[10] = far / (near - far);
		this[11] = -1.0;
		this[12] = 0.0;
		this[13] = 0.0;
		this[14] = (far * near) / (near - far);
		this[15] = 0.0;
		return this;
	}

	/**
	 * Generates a orthogonal projection matrix with the given bounds.
	 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
	 * which matches WebGL/OpenGL's clip volume.
	 *
	 * @param left - Left bound of the frustum
	 * @param right - Right bound of the frustum
	 * @param bottom - Bottom bound of the frustum
	 * @param top - Top bound of the frustum
	 * @param near - Near bound of the frustum
	 * @param far - Far bound of the frustum
	 * @returns `out`
	 */
	orthoNO(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): Mat4 {
		const lr = 1 / (left - right);
		const bt = 1 / (bottom - top);
		const nf = 1 / (near - far);
		this[0] = -2 * lr;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = -2 * bt;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[10] = 2 * nf;
		this[11] = 0;
		this[12] = (left + right) * lr;
		this[13] = (top + bottom) * bt;
		this[14] = (far + near) * nf;
		this[15] = 1;
		return this;
	}

	/**
	 * Generates a orthogonal projection matrix with the given bounds.
	 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
	 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
	 *
	 * @param left - Left bound of the frustum
	 * @param right - Right bound of the frustum
	 * @param bottom - Bottom bound of the frustum
	 * @param top - Top bound of the frustum
	 * @param near - Near bound of the frustum
	 * @param far - Far bound of the frustum
	 * @returns `out`
	 */
	orthoZO(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): Mat4 {
		const lr = 1 / (left - right);
		const bt = 1 / (bottom - top);
		const nf = 1 / (near - far);
		this[0] = -2 * lr;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = -2 * bt;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[10] = nf;
		this[11] = 0;
		this[12] = (left + right) * lr;
		this[13] = (top + bottom) * bt;
		this[14] = near * nf;
		this[15] = 1;
		return this;
	}

	/**
	 * Generates a look-at matrix with the given eye position, focal point, and up axis.
	 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
	 *
	 * @param eye - Position of the viewer
	 * @param center - Point the viewer is looking at
	 * @param up - vec3 pointing up
	 * @returns `out`
	 */
	lookAt(eye: Readonly<Vec3Like>, center: Readonly<Vec3Like>, up: Readonly<Vec3Like>): Mat4 {
		const eyex = eye[0];
		const eyey = eye[1];
		const eyez = eye[2];
		const upx = up[0];
		const upy = up[1];
		const upz = up[2];
		const centerx = center[0];
		const centery = center[1];
		const centerz = center[2];

		if (
			Math.abs(eyex - centerx) < EPSILON &&
			Math.abs(eyey - centery) < EPSILON &&
			Math.abs(eyez - centerz) < EPSILON
		) {
			return Mat4.identity();
		}

		let z0 = eyex - centerx;
		let z1 = eyey - centery;
		let z2 = eyez - centerz;

		let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		z0 *= len;
		z1 *= len;
		z2 *= len;

		let x0 = upy * z2 - upz * z1;
		let x1 = upz * z0 - upx * z2;
		let x2 = upx * z1 - upy * z0;
		len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
		if (!len) {
			x0 = 0;
			x1 = 0;
			x2 = 0;
		} else {
			len = 1 / len;
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}

		let y0 = z1 * x2 - z2 * x1;
		let y1 = z2 * x0 - z0 * x2;
		let y2 = z0 * x1 - z1 * x0;

		len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
		if (!len) {
			y0 = 0;
			y1 = 0;
			y2 = 0;
		} else {
			len = 1 / len;
			y0 *= len;
			y1 *= len;
			y2 *= len;
		}

		this[0] = x0;
		this[1] = y0;
		this[2] = z0;
		this[3] = 0;
		this[4] = x1;
		this[5] = y1;
		this[6] = z1;
		this[7] = 0;
		this[8] = x2;
		this[9] = y2;
		this[10] = z2;
		this[11] = 0;
		this[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
		this[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
		this[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
		this[15] = 1;

		return this;
	}

	/**
	 * Generates a matrix that makes something look at something else.
	 *
	 * @param eye - Position of the viewer
	 * @param target - Point the viewer is looking at
	 * @param up - vec3 pointing up
	 * @returns `out`
	 */
	targetTo(eye: Readonly<Vec3Like>, target: Readonly<Vec3Like>, up: Readonly<Vec3Like>): Mat4 {
		const eyex = eye[0];
		const eyey = eye[1];
		const eyez = eye[2];
		const upx = up[0];
		const upy = up[1];
		const upz = up[2];

		let z0 = eyex - target[0];
		let z1 = eyey - target[1];
		let z2 = eyez - target[2];

		let len = z0 * z0 + z1 * z1 + z2 * z2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			z0 *= len;
			z1 *= len;
			z2 *= len;
		}

		let x0 = upy * z2 - upz * z1;
		let x1 = upz * z0 - upx * z2;
		let x2 = upx * z1 - upy * z0;

		len = x0 * x0 + x1 * x1 + x2 * x2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}

		this[0] = x0;
		this[1] = x1;
		this[2] = x2;
		this[3] = 0;
		this[4] = z1 * x2 - z2 * x1;
		this[5] = z2 * x0 - z0 * x2;
		this[6] = z0 * x1 - z1 * x0;
		this[7] = 0;
		this[8] = z0;
		this[9] = z1;
		this[10] = z2;
		this[11] = 0;
		this[12] = eyex;
		this[13] = eyey;
		this[14] = eyez;
		this[15] = 1;
		return this;
	}

	/**
	 * Returns Frobenius norm of a {@link Mat4}
	 *
	 * @returns Frobenius norm
	 */
	frob(): number {
		return Math.sqrt(
			this[0] * this[0] +
				this[1] * this[1] +
				this[2] * this[2] +
				this[3] * this[3] +
				this[4] * this[4] +
				this[5] * this[5] +
				this[6] * this[6] +
				this[7] * this[7] +
				this[8] * this[8] +
				this[9] * this[9] +
				this[10] * this[10] +
				this[11] * this[11] +
				this[12] * this[12] +
				this[13] * this[13] +
				this[14] * this[14] +
				this[15] * this[15]
		);
	}

	/**
	 * Adds two {@link Mat4}
	 *
	 * @param b - the second operand
	 * @returns `out`
	 */
	add(b: Readonly<Mat4Like>): Mat4 {
		this[0] = this[0] + b[0];
		this[1] = this[1] + b[1];
		this[2] = this[2] + b[2];
		this[3] = this[3] + b[3];
		this[4] = this[4] + b[4];
		this[5] = this[5] + b[5];
		this[6] = this[6] + b[6];
		this[7] = this[7] + b[7];
		this[8] = this[8] + b[8];
		this[9] = this[9] + b[9];
		this[10] = this[10] + b[10];
		this[11] = this[11] + b[11];
		this[12] = this[12] + b[12];
		this[13] = this[13] + b[13];
		this[14] = this[14] + b[14];
		this[15] = this[15] + b[15];
		return this;
	}

	/**
	 * Subtracts matrix b from matrix this
	 *
	 * @param b - the second operand
	 * @returns `out`
	 */
	subtract(b: Readonly<Mat4Like>): Mat4 {
		this[0] = this[0] - b[0];
		this[1] = this[1] - b[1];
		this[2] = this[2] - b[2];
		this[3] = this[3] - b[3];
		this[4] = this[4] - b[4];
		this[5] = this[5] - b[5];
		this[6] = this[6] - b[6];
		this[7] = this[7] - b[7];
		this[8] = this[8] - b[8];
		this[9] = this[9] - b[9];
		this[10] = this[10] - b[10];
		this[11] = this[11] - b[11];
		this[12] = this[12] - b[12];
		this[13] = this[13] - b[13];
		this[14] = this[14] - b[14];
		this[15] = this[15] - b[15];
		return this;
	}
	/**
	 * Multiply each element of the matrix by a scalar.
	 *
	 * @param b - amount to scale the matrix's elements by
	 * @returns `out`
	 */
	multiplyScalar(b: number): Mat4 {
		this[0] = this[0] * b;
		this[1] = this[1] * b;
		this[2] = this[2] * b;
		this[3] = this[3] * b;
		this[4] = this[4] * b;
		this[5] = this[5] * b;
		this[6] = this[6] * b;
		this[7] = this[7] * b;
		this[8] = this[8] * b;
		this[9] = this[9] * b;
		this[10] = this[10] * b;
		this[11] = this[11] * b;
		this[12] = this[12] * b;
		this[13] = this[13] * b;
		this[14] = this[14] * b;
		this[15] = this[15] * b;
		return this;
	}

	/**
	 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
	 *
	 * @param b - the second operand
	 * @param scale - the amount to scale b's elements by before adding
	 * @returns `out`
	 */
	multiplyScalarAndAdd(b: Readonly<Mat4Like>, scale: number): Mat4 {
		this[0] = this[0] + b[0] * scale;
		this[1] = this[1] + b[1] * scale;
		this[2] = this[2] + b[2] * scale;
		this[3] = this[3] + b[3] * scale;
		this[4] = this[4] + b[4] * scale;
		this[5] = this[5] + b[5] * scale;
		this[6] = this[6] + b[6] * scale;
		this[7] = this[7] + b[7] * scale;
		this[8] = this[8] + b[8] * scale;
		this[9] = this[9] + b[9] * scale;
		this[10] = this[10] + b[10] * scale;
		this[11] = this[11] + b[11] * scale;
		this[12] = this[12] + b[12] * scale;
		this[13] = this[13] + b[13] * scale;
		this[14] = this[14] + b[14] * scale;
		this[15] = this[15] + b[15] * scale;
		return this;
	}

	/**
	 * Returns whether or not two {@link Mat4}s have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param b - The second matrix.
	 * @returns True if the matrices are equal, false otherwise.
	 */
	exactEquals(b: Readonly<Mat4Like>): boolean {
		return (
			this[0] === b[0] &&
			this[1] === b[1] &&
			this[2] === b[2] &&
			this[3] === b[3] &&
			this[4] === b[4] &&
			this[5] === b[5] &&
			this[6] === b[6] &&
			this[7] === b[7] &&
			this[8] === b[8] &&
			this[9] === b[9] &&
			this[10] === b[10] &&
			this[11] === b[11] &&
			this[12] === b[12] &&
			this[13] === b[13] &&
			this[14] === b[14] &&
			this[15] === b[15]
		);
	}

	/**
	 * Returns whether or not two {@link Mat4}s have approximately the same elements in the same position.
	 *
	 * @param b - The second matrix.
	 * @returns True if the matrices are equal, false otherwise.
	 */
	equals(b: Readonly<Mat4Like>): boolean {
		const a0 = this[0];
		const a1 = this[1];
		const a2 = this[2];
		const a3 = this[3];
		const a4 = this[4];
		const a5 = this[5];
		const a6 = this[6];
		const a7 = this[7];
		const a8 = this[8];
		const a9 = this[9];
		const a10 = this[10];
		const a11 = this[11];
		const a12 = this[12];
		const a13 = this[13];
		const a14 = this[14];
		const a15 = this[15];

		const b0 = b[0];
		const b1 = b[1];
		const b2 = b[2];
		const b3 = b[3];
		const b4 = b[4];
		const b5 = b[5];
		const b6 = b[6];
		const b7 = b[7];
		const b8 = b[8];
		const b9 = b[9];
		const b10 = b[10];
		const b11 = b[11];
		const b12 = b[12];
		const b13 = b[13];
		const b14 = b[14];
		const b15 = b[15];

		return (
			Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) &&
			Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) &&
			Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) &&
			Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) &&
			Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) &&
			Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) &&
			Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) &&
			Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) &&
			Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) &&
			Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) &&
			Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) &&
			Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) &&
			Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) &&
			Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15))
		);
	}

	/**
	 * Returns a string representation of a {@link Mat4}
	 * @category Static
	 *
	 * @param a - matrix to represent as a string
	 * @returns string representation of the matrix
	 */
	static str(a: Readonly<Mat4Like>): string {
		return `Mat4(${a.join(", ")})`;
	}

	transform(a: Readonly<Vec3>): Vec3 {
		const x = a[0],
			y = a[1],
			z = a[2];
		const w = this[3] * x + this[7] * y + this[11] * z + this[15] || 1.0;
		const out = new Vec3();
		out[0] = (this[0] * x + this[4] * y + this[8] * z + this[12]) / w;
		out[1] = (this[1] * x + this[5] * y + this[9] * z + this[13]) / w;
		out[2] = (this[2] * x + this[6] * y + this[10] * z + this[14]) / w;
		return out;
	}
}
