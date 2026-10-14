export interface AdminUser {
  id: string;
  name: string;
  email: string;
  country: string;
  businessType: string;
  stores: number | null;
  status: string;
  joined: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  store: string;
  customer: string;
  channel: string;
  amount: number;
  status: string;
  date: string;
}

export interface AdminTransaction {
  id: string;
  reference: string;
  gateway: string;
  store: string;
  amount: number;
  platformFee: number;
  vendorAmount: number;
  status: string;
  date: string;
}

export interface AdminDelivery {
  id: string;
  trackingCode: string;
  provider: string;
  store: string;
  destination: string;
  status: string;
  dispatched: string;
}

export interface AdminSubscription {
  id: string;
  store: string;
  plan: string;
  interval: string;
  amount: number;
  status: string;
  renews: string;
}

export interface AdminTicket {
  id: string;
  subject: string;
  requester: string;
  store: string;
  priority: string;
  status: string;
  opened: string;
}

export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

export interface AdminStore {
  id: string;
  name: string;
  owner: string;
  country: string;
  plan: string;
  products: number;
  revenue: number;
  status: string;
}
