import "server-only";
import { revalidateTag, updateTag } from "next/cache";
import { TAGS } from "@/lib/catalog";

/**
 * Call after an admin change so every shopper sees it on their next visit
 * (no old copy is served). Only usable inside server actions.
 */
export function refreshShop(...tags: (keyof typeof TAGS)[]) {
  for (const key of tags) {
    updateTag(TAGS[key]);
    revalidateTag(TAGS[key], { expire: 0 });
  }
}
