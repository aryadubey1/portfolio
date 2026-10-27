import { revalidatePath } from 'next/cache'

/* Refresh cached pages after a CMS edit. Outside a Next request (seed, migrate)
   there is nothing to refresh, so errors are ignored. */
export function revalidate(...paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p)
    } catch {
      /* not inside Next */
    }
  }
}
