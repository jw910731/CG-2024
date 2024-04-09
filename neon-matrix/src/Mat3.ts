/* eslint-disable no-case-declarations */

import { Vec2Like } from "./Vec2";
import { EPSILON } from "./common";

// prettier-ignore
/**
 * A 3x3 Matrix given as a {@link Mat3}, a 9-element Float32Array, or an array
 * of 9 numbers.
 */
export type Mat3Like = [// prettier-ignore
  number, number, number,
  number, number, number,
  number, number, number
] | Float32Array;

// prettier-ignore
const IDENTITY_3X3 = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
]);

export class Mat3 extends Float32Array {
	/**
	 * The number of bytes in a {@link Mat2}.
	 */
	static readonly BYTE_LENGTH = 4 * Float32Array.BYTES_PER_ELEMENT;

	/**
	 * Create a {@link Mat3}.
	 */
	constructor(...values: [Readonly<Mat3Like> | ArrayBufferLike, number?] | number[]) {
		switch (values.length) {
			case 9:
				super(values);
				break;
			case 2:
				super(values[0] as ArrayBufferLike, values[1], 9);
				break;
			case 1:
				const v = values[0];
				if (typeof v === "number") {
					super([v, v, v, v, v, v, v, v, v]);
				} else {
					super(v as ArrayBufferLike, 0, 9);
				}
				break;
			default:
				super(IDENTITY_3X3);
				break;
		}
	}

	/**
	 * Creates a new, identity {@link Mat3}
	 * @category Static
	 *
	 * @returns A new {@link Mat3}
	 */
	static create(): Mat3 {
		return new Mat3();
	}

	/**
	 * Creates a new {@link Mat3} initialized with values from an existing matrix
	 * @category Static
	 *
	 * @param a - Matrix to clone
	 * @returns A new {@link Mat3}
	 */
	static clone(a: Readonly<Mat3Like>): Mat3 {
		return new Mat3(a);
	}

	/**
	 * A string representation of `this`
	 * Equivalent to `Mat3.str(this);`
	 */
	get str(): string {
		return `Mat3(${this.join(", ")})`;
	}

	/**
	 * Set `this` to the identity matrix
	 * Equivalent to Mat3.identity(this)
	 *
	 * @returns `this`
	 */
	identity(): Mat3 {
		this.set(IDENTITY_3X3);
		return this;
	}

	/**
	 * Copy the values from one {@link Mat3} to another
	 * @category Static
	 *
	 * @param  this - The receiving Matrix
	 * @param a - Matrix to copy
	 * @returns ` this`
	 */
	copy(): Mat3 {
		const ret = new Mat3();
		ret[0] = this[0];
		ret[1] = this[1];
		ret[2] = this[2];
		ret[3] = this[3];
		ret[4] = this[4];
		ret[5] = this[5];
		ret[6] = this[6];
		ret[7] = this[7];
		ret[8] = this[8];
		return ret;
	}

	/**
	 * Create a new {@link Mat3} with the given values
	 * @category Static
	 *
	 * @param values - Matrix components
	 * @returns A new {@link Mat3}
	 */
	static fromValues(...values: number[]): Mat3 {
		return new Mat3(...values);
	}

	/**
	 * Transpose the values of a {@link Mat3}
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the source matrix
	 * @returns ` this`
	 */
	transpose(): Mat3 {
		// If we are transposing ourselves we can skip a few steps but have to cache some values
		const a01 = this[1],
			a02 = this[2],
			a12 = this[5];
		this[1] = this[3];
		this[2] = this[6];
		this[3] = a01;
		this[5] = this[7];
		this[6] = a02;
		this[7] = a12;
		return this;
	}

	/**
	 * Calculates the adjugate of a {@link Mat3}
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the source matrix
	 * @returns ` this`
	 */
	adjoint(): Mat3 {
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a10 = this[3];
		const a11 = this[4];
		const a12 = this[5];
		const a20 = this[6];
		const a21 = this[7];
		const a22 = this[8];

		this[0] = a11 * a22 - a12 * a21;
		this[1] = a02 * a21 - a01 * a22;
		this[2] = a01 * a12 - a02 * a11;
		this[3] = a12 * a20 - a10 * a22;
		this[4] = a00 * a22 - a02 * a20;
		this[5] = a02 * a10 - a00 * a12;
		this[6] = a10 * a21 - a11 * a20;
		this[7] = a01 * a20 - a00 * a21;
		this[8] = a00 * a11 - a01 * a10;
		return this;
	}

	/**
	 * Calculates the determinant of a {@link Mat3}
	 * @category Static
	 *
	 * @param a - the source matrix
	 * @returns determinant of a
	 */
	determinant(): number {
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a10 = this[3];
		const a11 = this[4];
		const a12 = this[5];
		const a20 = this[6];
		const a21 = this[7];
		const a22 = this[8];

		return (
			a00 * (a22 * a11 - a12 * a21) +
			a01 * (-a22 * a10 + a12 * a20) +
			a02 * (a21 * a10 - a11 * a20)
		);
	}

	/**
	 * Adds two {@link Mat3}'s
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the first operand
	 * @param b - the second operand
	 * @returns ` this`
	 */
	add(b: Readonly<Mat3Like>): Mat3 {
		this[0] = this[0] + b[0];
		this[1] = this[1] + b[1];
		this[2] = this[2] + b[2];
		this[3] = this[3] + b[3];
		this[4] = this[4] + b[4];
		this[5] = this[5] + b[5];
		this[6] = this[6] + b[6];
		this[7] = this[7] + b[7];
		this[8] = this[8] + b[8];
		return this;
	}

	/**
	 * Subtracts matrix b from matrix a
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the first operand
	 * @param b - the second operand
	 * @returns ` this`
	 */
	subtract(b: Readonly<Mat3Like>): Mat3 {
		this[0] = this[0] - b[0];
		this[1] = this[1] - b[1];
		this[2] = this[2] - b[2];
		this[3] = this[3] - b[3];
		this[4] = this[4] - b[4];
		this[5] = this[5] - b[5];
		this[6] = this[6] - b[6];
		this[7] = this[7] - b[7];
		this[8] = this[8] - b[8];
		return this;
	}

	/**
	 * Multiplies two {@link Mat3}s
	 * @category Static
	 *
	 * @param  this - The receiving Matrix
	 * @param a - The first operand
	 * @param b - The second operand
	 * @returns ` this`
	 */
	multiply(b: Readonly<Mat3Like>): Mat3 {
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a10 = this[3];
		const a11 = this[4];
		const a12 = this[5];
		const a20 = this[6];
		const a21 = this[7];
		const a22 = this[8];

		let b0 = b[0];
		let b1 = b[1];
		let b2 = b[2];
		this[0] = b0 * a00 + b1 * a10 + b2 * a20;
		this[1] = b0 * a01 + b1 * a11 + b2 * a21;
		this[2] = b0 * a02 + b1 * a12 + b2 * a22;

		b0 = b[3];
		b1 = b[4];
		b2 = b[5];
		this[3] = b0 * a00 + b1 * a10 + b2 * a20;
		this[4] = b0 * a01 + b1 * a11 + b2 * a21;
		this[5] = b0 * a02 + b1 * a12 + b2 * a22;

		b0 = b[6];
		b1 = b[7];
		b2 = b[8];
		this[6] = b0 * a00 + b1 * a10 + b2 * a20;
		this[7] = b0 * a01 + b1 * a11 + b2 * a21;
		this[8] = b0 * a02 + b1 * a12 + b2 * a22;
		return this;
	}

	/**
	 * Translate a {@link Mat3} by the given vector
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the matrix to translate
	 * @param v - vector to translate by
	 * @returns ` this`
	 */
	translate(v: Readonly<Vec2Like>): Mat3 {
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a10 = this[3];
		const a11 = this[4];
		const a12 = this[5];
		const a20 = this[6];
		const a21 = this[7];
		const a22 = this[8];
		const x = v[0];
		const y = v[1];

		this[0] = a00;
		this[1] = a01;
		this[2] = a02;

		this[3] = a10;
		this[4] = a11;
		this[5] = a12;

		this[6] = x * a00 + y * a10 + a20;
		this[7] = x * a01 + y * a11 + a21;
		this[8] = x * a02 + y * a12 + a22;
		return this;
	}

	/**
	 * Rotates a {@link Mat3} by the given angle
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the matrix to rotate
	 * @param rad - the angle to rotate the matrix by
	 * @returns ` this`
	 */
	rotate(rad: number): Mat3 {
		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a10 = this[3];
		const a11 = this[4];
		const a12 = this[5];
		const a20 = this[6];
		const a21 = this[7];
		const a22 = this[8];
		const s = Math.sin(rad);
		const c = Math.cos(rad);

		this[0] = c * a00 + s * a10;
		this[1] = c * a01 + s * a11;
		this[2] = c * a02 + s * a12;

		this[3] = c * a10 - s * a00;
		this[4] = c * a11 - s * a01;
		this[5] = c * a12 - s * a02;

		this[6] = a20;
		this[7] = a21;
		this[8] = a22;
		return this;
	}

	/**
	 * Scales the {@link Mat3} by the dimensions in the given {@link Vec2}
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the matrix to scale
	 * @param v - the {@link Vec2} to scale the matrix by
	 * @returns ` this`
	 **/
	scale(v: Readonly<Vec2Like>): Mat3 {
		const x = v[0];
		const y = v[1];

		this[0] = x * this[0];
		this[1] = x * this[1];
		this[2] = x * this[2];

		this[3] = y * this[3];
		this[4] = y * this[4];
		this[5] = y * this[5];
		return this;
	}

	/**
	 * Creates a {@link Mat3} from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.translate(dest, dest, vec);
	 * @category Static
	 *
	 * @param  this - {@link Mat3} receiving operation result
	 * @param v - Translation vector
	 * @returns ` this`
	 */
	static fromTranslation(v: Readonly<Vec2Like>): Mat3 {
		const ret = new Mat3();
		ret[0] = 1;
		ret[1] = 0;
		ret[2] = 0;
		ret[3] = 0;
		ret[4] = 1;
		ret[5] = 0;
		ret[6] = v[0];
		ret[7] = v[1];
		ret[8] = 1;
		return ret;
	}

	/**
	 * Creates a {@link Mat3} from a given angle around a given axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.rotate(dest, dest, rad);
	 * @category Static
	 *
	 * @param  this - {@link Mat3} receiving operation result
	 * @param rad - the angle to rotate the matrix by
	 * @returns ` this`
	 */
	static fromRotation(rad: number): Mat3 {
		const ret = new Mat3();
		const s = Math.sin(rad);
		const c = Math.cos(rad);

		ret[0] = c;
		ret[1] = s;
		ret[2] = 0;

		ret[3] = -s;
		ret[4] = c;
		ret[5] = 0;

		ret[6] = 0;
		ret[7] = 0;
		ret[8] = 1;
		return ret;
	}

	/**
	 * Creates a {@link Mat3} from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.scale(dest, dest, vec);
	 * @category Static
	 *
	 * @param  this - {@link Mat3} receiving operation result
	 * @param v - Scaling vector
	 * @returns ` this`
	 */
	static fromScaling(v: Readonly<Vec2Like>): Mat3 {
		const ret = new Mat3();
		ret[0] = v[0];
		ret[1] = 0;
		ret[2] = 0;

		ret[3] = 0;
		ret[4] = v[1];
		ret[5] = 0;

		ret[6] = 0;
		ret[7] = 0;
		ret[8] = 1;
		return ret;
	}

	/**
	 * Generates a 2D projection matrix with the given bounds
	 * @category Static
	 *
	 * @param  this mat3 frustum matrix will be written into
	 * @param width Width of your gl context
	 * @param height Height of gl context
	 * @returns ` this`
	 */
	projection(width: number, height: number): Mat3 {
		this[0] = 2 / width;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = -2 / height;
		this[5] = 0;
		this[6] = -1;
		this[7] = 1;
		this[8] = 1;
		return this;
	}

	/**
	 * Returns Frobenius norm of a {@link Mat3}
	 * @category Static
	 *
	 * @param a - the matrix to calculate Frobenius norm of
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
				this[8] * this[8]
		);
	}

	/**
	 * Multiply each element of a {@link Mat3} by a scalar.
	 * @category Static
	 *
	 * @param  this - the receiving matrix
	 * @param a - the matrix to scale
	 * @param b - amount to scale the matrix's elements by
	 * @returns ` this`
	 */
	multiplyScalar(b: number): Mat3 {
		this[0] = this[0] * b;
		this[1] = this[1] * b;
		this[2] = this[2] * b;
		this[3] = this[3] * b;
		this[4] = this[4] * b;
		this[5] = this[5] * b;
		this[6] = this[6] * b;
		this[7] = this[7] * b;
		this[8] = this[8] * b;
		return this;
	}

	/**
	 * Adds two {@link Mat3}'s after multiplying each element of the second operand by a scalar value.
	 * @category Static
	 *
	 * @param  this - the receiving vector
	 * @param a - the first operand
	 * @param b - the second operand
	 * @param scale - the amount to scale b's elements by before adding
	 * @returns ` this`
	 */
	multiplyScalarAndAdd(b: Readonly<Mat3Like>, scale: number): Mat3 {
		this[0] = this[0] + b[0] * scale;
		this[1] = this[1] + b[1] * scale;
		this[2] = this[2] + b[2] * scale;
		this[3] = this[3] + b[3] * scale;
		this[4] = this[4] + b[4] * scale;
		this[5] = this[5] + b[5] * scale;
		this[6] = this[6] + b[6] * scale;
		this[7] = this[7] + b[7] * scale;
		this[8] = this[8] + b[8] * scale;
		return this;
	}

	equals(rhs: Readonly<Mat3Like>) {
		Mat3.equals(this, rhs);
	}

	/**
	 * Returns whether or not two {@link Mat3}s have exactly the same elements in the same position (when compared with ===)
	 * @category Static
	 *
	 * @param a - The first matrix.
	 * @param b - The second matrix.
	 * @returns True if the matrices are equal, false otherwise.
	 */
	static exactEquals(a: Readonly<Mat3Like>, b: Readonly<Mat3Like>): boolean {
		return (
			a[0] === b[0] &&
			a[1] === b[1] &&
			a[2] === b[2] &&
			a[3] === b[3] &&
			a[4] === b[4] &&
			a[5] === b[5] &&
			a[6] === b[6] &&
			a[7] === b[7] &&
			a[8] === b[8]
		);
	}

	/**
	 * Returns whether or not two {@link Mat3}s have approximately the same elements in the same position.
	 * @category Static
	 *
	 * @param a - The first matrix.
	 * @param b - The second matrix.
	 * @returns True if the matrices are equal, false otherwise.
	 */
	static equals(a: Readonly<Mat3Like>, b: Readonly<Mat3Like>): boolean {
		const a0 = a[0];
		const a1 = a[1];
		a;
		const a2 = a[2];
		const a3 = a[3];
		const a4 = a[4];
		const a5 = a[5];
		const a6 = a[6];
		const a7 = a[7];
		const a8 = a[8];

		const b0 = b[0];
		const b1 = b[1];
		const b2 = b[2];
		const b3 = b[3];
		const b4 = b[4];
		const b5 = b[5];
		const b6 = b[6];
		const b7 = b[7];
		const b8 = b[8];

		return (
			Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) &&
			Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) &&
			Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) &&
			Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) &&
			Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) &&
			Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) &&
			Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8))
		);
	}

	multiplyVec(v: Readonly<Vec2Like>): Vec2Like {
		const ret = <Vec2Like>structuredClone(v);
		ret[0] = this[0] * v[0] + this[3] * v[1] + this[6];
		ret[1] = this[1] * v[0] + this[4] * v[1] + this[7];
		return ret;
	}
}
