export type DeadlineStatus = "pending" | "completed" | "overdue";
export type PaymentLogStatus = "pending" | "paid" | "failed";
export type DraftStatus = "draft" | "final";
export type PlanTier = "free" | "pro";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "inactive";

export type Deadline = {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  amountCents: number | null;
  currency: string;
  status: DeadlineStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Checklist = {
  id: string;
  userId: string;
  title: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItem = {
  id: string;
  checklistId: string;
  label: string;
  isDone: boolean;
  dueDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type EmailDraft = {
  id: string;
  userId: string;
  contextType: string;
  recipient: string | null;
  language: string;
  tone: string;
  inputJson: Record<string, unknown>;
  subject: string;
  body: string;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentLog = {
  id: string;
  userId: string;
  payee: string;
  amountCents: number;
  currency: string;
  paidAt: string;
  proofUrl: string | null;
  status: PaymentLogStatus;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
};
