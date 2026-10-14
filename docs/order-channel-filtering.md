# Order channel filtering

The Orders tabs represent sales channels: All, Website, WhatsApp AI and Web Chat.
Sendbox and Relay are delivery providers, not sales channels.

The staging API implementation inspected at d76629b only filters `channel` for
Sendbox and Relay through `fulfillment_provider`. Other channel parameters are
ignored, and most returned orders are labelled Website. Do not infer an order's
sales channel from its delivery provider.

The admin sends the selected channel and search to `/admin/orders/list` and also
checks each returned row against the selected channel. Unmatched rows never appear
in a channel tab. Filtering is restricted to the returned page, so the UI labels
counts as page-specific and retains pagination. An empty filtered page is not proof
that there are no matching orders elsewhere.

Backend follow-up: persist the actual order sales channel at creation, validate the
channel query, apply it before pagination/counting, and return accurate channel
values and filtered pagination metadata. Historical unknown channels must not be
silently labelled Website. Once that contract is available, the defensive client
check can stay, and server totals can be shown as channel totals.
