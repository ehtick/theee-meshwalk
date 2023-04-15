import { Vector3, Triangle, Box3, Sphere } from 'three';

export class ComputedTriangle extends Triangle {

	boundingBox: Box3;
	boundingSphere: Sphere;
	normal: Vector3;

	constructor( a: Vector3, b: Vector3, c: Vector3 ) {

		super( a, b, c );

		this.normal = this.getNormal( new Vector3() );
		this.boundingBox = makeTriangleBoundingBox( this );
		this.boundingSphere = makeTriangleBoundingSphere( this, this.normal );

	}

}

export function makeTriangleBoundingBox( triangle: Triangle ) {

	const bb = new Box3();

	bb.min = bb.min.min( triangle.a );
	bb.min = bb.min.min( triangle.b );
	bb.min = bb.min.min( triangle.c );

	bb.max = bb.max.max( triangle.a );
	bb.max = bb.max.max( triangle.b );
	bb.max = bb.max.max( triangle.c );

	return bb;

}

const triangleNormal = new Vector3();

export function makeTriangleBoundingSphere( triangle: Triangle, normal: Vector3 ) {

	const bs = new Sphere();
	const v = new Vector3();
	const v0 = new Vector3();
	const v1 = new Vector3();
	const e0 = new Vector3();
	const e1 = new Vector3();

	// obtuse triangle

	v0.subVectors( triangle.b, triangle.a );
	v1.subVectors( triangle.c, triangle.a );

	if ( v0.dot( v1 ) <= 0 ) {

		bs.center.addVectors( triangle.b, triangle.c ).divideScalar( 2 );
		bs.radius = v.subVectors( triangle.b, triangle.c ).length() / 2;
		return bs;

	}

	v0.subVectors( triangle.a, triangle.b );
	v1.subVectors( triangle.c, triangle.b );

	if ( v0.dot( v1 ) <= 0 ) {

		bs.center.addVectors( triangle.a, triangle.c ).divideScalar( 2 );
		bs.radius = v.subVectors( triangle.a, triangle.c ).length() / 2;
		return bs;

	}

	v0.subVectors( triangle.a, triangle.c );
	v1.subVectors( triangle.b, triangle.c );

	if ( v0.dot( v1 ) <= 0 ) {

		bs.center.addVectors( triangle.a, triangle.b ).divideScalar( 2 );
		bs.radius = v.subVectors( triangle.a, triangle.b ).length() / 2;
		return bs;

	}

	// acute‐angled triangle

	if ( ! normal ) {

		normal = triangle.getNormal( triangleNormal );

	}

	v0.crossVectors( v.subVectors( triangle.c, triangle.b ), normal );
	v1.crossVectors( v.subVectors( triangle.c, triangle.a ), normal );

	e0.addVectors( triangle.c, triangle.b ).multiplyScalar( .5 );
	e1.addVectors( triangle.c, triangle.a ).multiplyScalar( .5 );

	const a = v0.dot( v1 );
	const b = v0.dot( v0 );
	const d = v1.dot( v1 );
	const c = - v.subVectors( e1, e0 ).dot( v0 );
	const e = - v.subVectors( e1, e0 ).dot( v1 );

	const div = - a * a + b * d;
	// t = ( - a * c + b * e ) / div;
	const s = ( - c * d + a * e ) / div;

	bs.center = e0.clone().add( v0.clone().multiplyScalar( s ) );
	bs.radius = v.subVectors( bs.center, triangle.a ).length();
	return bs;

}
