import type { ContentItem, ContentProgress } from "@pmhc/types";

export function mergeContentProgress(items: ContentItem[], progress: ContentProgress[]): ContentItem[] {
  const progressById = new Map(progress.map((item) => [item.itemId, item]));

  return items.map((item) => {
    const savedProgress = progressById.get(item.id);

    if (!savedProgress) {
      return item;
    }

    return {
      ...item,
      saved: savedProgress.saved,
      completed: savedProgress.completed,
    };
  });
}

export function toggleContentSaved(
  progress: ContentProgress[],
  itemId: string,
  updatedAt: string,
): ContentProgress[] {
  const current = findProgress(progress, itemId);
  return upsertProgress(progress, {
    itemId,
    saved: !current.saved,
    completed: current.completed,
    updatedAt,
  });
}

export function markContentCompleted(
  progress: ContentProgress[],
  itemId: string,
  updatedAt: string,
): ContentProgress[] {
  return upsertProgress(progress, {
    itemId,
    saved: true,
    completed: true,
    updatedAt,
  });
}

function findProgress(progress: ContentProgress[], itemId: string): ContentProgress {
  return (
    progress.find((item) => item.itemId === itemId) ?? {
      itemId,
      saved: false,
      completed: false,
      updatedAt: "",
    }
  );
}

function upsertProgress(progress: ContentProgress[], next: ContentProgress): ContentProgress[] {
  const existing = progress.some((item) => item.itemId === next.itemId);

  if (!existing) {
    return [...progress, next];
  }

  return progress.map((item) => (item.itemId === next.itemId ? next : item));
}
