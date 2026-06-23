export function formatDueDate(iso?: string): string {
  if (!iso) return "No due date";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}
