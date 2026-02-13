"use client";

import { useSidebar } from "@repo/ui";
import { useSyncExternalStore } from "react";

const MD_BREAKPOINT = 768;
const SIDEBAR_WIDTH_PX = 256;
const MIN_DESKTOP_CONTENT_WIDTH = 960;

// Use matchMedia to only re-render when crossing the md breakpoint
const mdQuery = `(max-width: ${MD_BREAKPOINT - 1}px)`;
// For desktop: sidebar expanded leaves less room, so the threshold is higher
const desktopExpandedQuery = `(max-width: ${MIN_DESKTOP_CONTENT_WIDTH + SIDEBAR_WIDTH_PX - 1}px)`;
const desktopCollapsedQuery = `(max-width: ${MIN_DESKTOP_CONTENT_WIDTH - 1}px)`;

function subscribe(query: string, callback: () => void): () => void {
	const mql = window.matchMedia(query);
	mql.addEventListener("change", callback);
	return () => mql.removeEventListener("change", callback);
}

function getSnapshot(query: string): boolean {
	return window.matchMedia(query).matches;
}

function useMediaQuery(query: string): boolean {
	return useSyncExternalStore(
		(cb) => subscribe(query, cb),
		() => getSnapshot(query),
		() => false, // SSR: default to false (desktop)
	);
}

export function useKanbanMobileView(): boolean {
	const { state } = useSidebar();

	const isBelowMd = useMediaQuery(mdQuery);
	const isBelowDesktopExpanded = useMediaQuery(desktopExpandedQuery);
	const isBelowDesktopCollapsed = useMediaQuery(desktopCollapsedQuery);

	// Below md breakpoint: always mobile view
	if (isBelowMd) {
		return true;
	}

	// Desktop: account for sidebar width
	if (state === "expanded") {
		return isBelowDesktopExpanded;
	}

	return isBelowDesktopCollapsed;
}
