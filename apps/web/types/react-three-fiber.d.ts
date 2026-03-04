/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Minimal JSX type augmentation for the Three.js elements used in the Dither component.
 * Only declares the specific elements we use to avoid polluting the global JSX namespace.
 */

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			mesh: any;
			planeGeometry: any;
			shaderMaterial: any;
			meshBasicMaterial: any;
		}
	}
}

declare module "react/jsx-runtime" {
	namespace JSX {
		interface IntrinsicElements {
			mesh: any;
			planeGeometry: any;
			shaderMaterial: any;
			meshBasicMaterial: any;
		}
	}
}

export {};
