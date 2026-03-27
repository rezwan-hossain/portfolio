// types/dashboard.ts
export type DashboardUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
};

export type DashboardStats = {
  totalOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  totalPaid: number;
  upcomingEvents: number;
  activeEventsCount: number;
};

export type DashboardOrder = {
  id: string;
  status: string;
  qty: number;
  createdAt: string;
  event: {
    id: string;
    name: string;
    slug: string;
    date: string;
    time: string;
    address: string;
    eventType: string;
    bannerImage: string;
    organizer: {
      id: number;
      name: string;
    };
  };
  package: {
    id: number;
    name: string;
    distance: string;
    price: number;
  };
  registration: {
    fullName: string;
    phone: string;
    gender: string;
    tshirtSize: string;
    runnerCategory: string;
  } | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string | null;
    transactionId: string | null;
    paymentGateway: string | null;
    createdAt: string;
  } | null;
};

export type DashboardEvent = {
  id: string;
  name: string;
  slug: string;
  date: string;
  time: string;
  address: string;
  eventType: string;
  bannerImage: string;
  organizer: {
    id: number;
    name: string;
  };
  packages: {
    id: number;
    name: string;
    distance: string;
    price: number;
    availableSlots: number;
    usedSlots: number;
  }[];
};
