export interface Invitation {
  id: string;
  user_id: string;
  template_id: string | null;
  slug: string;
  title: string;
  event_type: "wedding" | "birthday" | "event";
  event_name: string;
  host_names: string;
  event_date: string | null;
  event_time: string;
  event_location: string;
  event_description: string;
  map_embed_url: string;
  cover_image_url: string | null;
  music_url: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  rsvp_status: "pending" | "attending" | "not_attending" | "maybe";
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  weekly_quota: number;
  features: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "inactive" | "expired";
  start_date: string;
  end_date: string | null;
  subscription_plans?: SubscriptionPlan;
}

export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: "pending" | "success" | "failed" | "expired";
  created_at: string;
  subscription_plans?: { name: string };
}

export interface Template {
  id: string;
  name: string;
  category: string;
  is_public: boolean;
  template_data: {
    colors: { primary: string; secondary: string; text: string; bg: string };
    fonts: { display: string; body: string };
  };
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  week_start: string;
  invitation_count: number;
}

export interface AdminStats {
  users: number;
  invitations: number;
  revenue: number;
  activeWeekly: number;
}

export interface DashboardStats {
  invitations: number;
  totalViews: number;
  totalGuests: number;
}