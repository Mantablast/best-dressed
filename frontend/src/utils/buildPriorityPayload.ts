export type PriorityPayload = {
  sections: string[];
  values: Record<string, string[]>;
};

const normalize = (value: string) => value?.trim().toLowerCase();

export function buildPriorityPayload(
  sectionOrder: string[],
  selectedOrder: Record<string, string[] | undefined>
): PriorityPayload {
  const sections: string[] = [];
  const values: Record<string, string[]> = {};

  sectionOrder.forEach((section) => {
    const key = normalize(section ?? "");
    if (!key) return;

    const items = Array.isArray(selectedOrder[key]) ? (selectedOrder[key] as string[]) : [];
    const normalizedItems = items
      .map((item) => normalize(item ?? ""))
      .filter((item): item is string => !!item);

    if (normalizedItems.length > 0) {
      sections.push(key);
      values[key] = normalizedItems;
    }
  });

  return { sections, values };
}
