import { zodResolver as baseZodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * Wrapper around zodResolver to handle Zod v4 mini API type incompatibility
 * with @hookform/resolvers. The runtime behavior is identical.
 */
export function zodResolver<T extends z.ZodType>(
	schema: T,
	...args: any[]
): Resolver<z.infer<T> extends FieldValues ? z.infer<T> : FieldValues> {
	return baseZodResolver(schema as any, ...args) as any;
}
