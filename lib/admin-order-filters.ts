export const orderChannels = ["All", "Website", "WhatsApp AI", "Web Chat"] as const;
export type OrderChannel = typeof orderChannels[number];

export function filterOrders<T extends { channel?: string | null; reference?: string; store?: string; customer?: string }>(
  rows: T[], channel: OrderChannel, search: string,
): T[] {
  const term = search.trim().toLowerCase();
  return rows.filter(row => {
    const matchesChannel = channel === "All" || row.channel?.trim().toLowerCase() === channel.toLowerCase();
    const matchesSearch = !term || [row.reference, row.store, row.customer]
      .some(value => value?.toLowerCase().includes(term));
    return matchesChannel && matchesSearch;
  });
}
