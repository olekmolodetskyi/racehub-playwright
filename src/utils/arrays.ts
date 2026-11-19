export function itemAt<T>(items: T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an item at index ${index}, got ${items.length} items`);
  return item;
}
