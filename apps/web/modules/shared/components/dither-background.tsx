"use client";

import type { DitherProps } from "@shared/components/dither";
import dynamic from "next/dynamic";

const Dither = dynamic(
	() => import("@shared/components/dither").then((mod) => mod.Dither),
	{ ssr: false },
);

function DitherBackground(props: DitherProps) {
	return <Dither {...props} />;
}

export { DitherBackground };
