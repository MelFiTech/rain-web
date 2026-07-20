export type ConfidenceLevel = "low" | "medium" | "high" | "very_high";

export type IdentifierType =
  | "account_number"
  | "phone"
  | "email"
  | "bvn"
  | "nin";

export type ReportCategory =
  | "fraud"
  | "scam"
  | "mule_account"
  | "identity_theft"
  | "chargeback_abuse"
  | "loan_fraud"
  | "suspicious_transaction"
  | "other";

export type TeamRole = "administrator" | "developer" | "analyst" | "finance";

export type MemberStatus = "active" | "invited" | "deactivated";

export type TransactionType =
  | "funding"
  | "verification_charge"
  | "reward_credit"
  | "adjustment";

export type EarningsStatus = "available" | "pending" | "paid";

export type VerificationResult = "match" | "no_match";

export interface Institution {
  id: string;
  name: string;
  email: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  contactName?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  isPlatformAdmin?: boolean;
  institution: Institution;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/** Real-time-style feed item: a member institution filed a report on the network. */
export interface NetworkReportEvent {
  id: string;
  institutionName: string;
  category: ReportCategory;
  maskedIdentifier: string;
  reference: string;
  submittedAt: string;
}

export type PlatformAccountStatus = "active" | "restricted" | "dormant";

/** A customer record on the signed-in institution's own platform. */
export interface PlatformCustomerRecord {
  customerId: string;
  displayName: string;
  matchedField: IdentifierType;
  maskedIdentifier: string;
  onboardedAt: string;
  status: PlatformAccountStatus;
}

export type PlatformUserCheckResult =
  | {
      matched: true;
      customer: PlatformCustomerRecord;
      reportReference: string;
      checkedAt: string;
    }
  | {
      matched: false;
      reportReference: string;
      checkedAt: string;
    };

export interface ConfidenceInfo {
  level: ConfidenceLevel;
  independentSourceCount: number;
  label: string;
  description: string;
}

export interface VerificationRecord {
  id: string;
  reference: string;
  identifierType: IdentifierType;
  maskedIdentifier: string;
  result: VerificationResult;
  confidence: ConfidenceInfo | null;
  independentSourceCount: number;
  totalReports?: number;
  categories?: ReportCategory[];
  firstReportedAt?: string;
  mostRecentReportAt?: string;
  matchingIdentifiers?: string[];
  amountCharged: number;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reference: string;
  fullName?: string;
  bank?: string;
  maskedAccountNumber?: string;
  maskedPhone?: string;
  maskedEmail?: string;
  maskedBvn?: string;
  maskedNin?: string;
  category: ReportCategory;
  description: string;
  incidentDate: string;
  amountInvolved?: number;
  independentSourceCount: number;
  confidence: ConfidenceInfo;
  earningsGenerated: number;
  submittedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  reference: string;
  createdAt: string;
}

export interface WalletState {
  balance: number;
  lowBalanceThreshold: number;
  transactions: WalletTransaction[];
}

export interface EarningRecord {
  id: string;
  maskedIdentifier: string;
  reportReference: string;
  amount: number;
  status: EarningsStatus;
  createdAt: string;
}

export interface EarningsSummary {
  available: number;
  pending: number;
  lifetime: number;
  totalRewardedMatches: number;
  records: EarningRecord[];
}

/** Bank account for earnings payouts — configured in Settings. */
export interface SettlementBankAccount {
  accountName: string;
  bankName: string;
  accountNumber: string;
  updatedAt: string;
}

export type WithdrawEarningsDestination = "wallet" | "bank";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  lastActiveAt: string;
}

export interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActiveAt: string;
  current: boolean;
}

export interface NotificationPreferences {
  emailVerificationResults: boolean;
  emailEarnings: boolean;
  emailTeamActivity: boolean;
  emailLowBalance: boolean;
  inAppNotifications: boolean;
}

export type WebhookEventType =
  | "verification.completed"
  | "report.submitted"
  | "wallet.low_balance";

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEventType[];
  secretPreview: string;
  enabled: boolean;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "success" | "failed";
}

export interface ApiKeyInfo {
  keyPrefix: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface DeveloperSettings {
  apiKey: ApiKeyInfo;
  webhooks: WebhookEndpoint[];
}

export interface InstitutionSettings {
  profile: Institution;
  notificationPreferences: NotificationPreferences;
  sessions: LoginSession[];
  developer: DeveloperSettings;
  settlementBank: SettlementBankAccount | null;
}

export interface DashboardSummary {
  walletBalance: number;
  totalVerifications: number;
  usersReported: number;
  totalEarnings: number;
  recentVerifications: VerificationRecord[];
  recentReports: ReportRecord[];
  recentEarnings: EarningRecord[];
  reportStream: NetworkReportEvent[];
}

export interface VerifyUserRequest {
  identifierType: IdentifierType;
  identifier: string;
  bankCode?: string;
}

export type VerifyUserResponse =
  | { status: "success"; data: VerificationRecord }
  | { status: "insufficient_balance"; balance: number; cost: number }
  | { status: "error"; message: string };

export interface SubmitReportRequest {
  fullName?: string;
  bank?: string;
  accountNumber?: string;
  phone?: string;
  email?: string;
  bvn?: string;
  nin?: string;
  category: ReportCategory;
  description: string;
  incidentDate: string;
  amountInvolved?: number;
}

export interface FundWalletRequest {
  amount: number;
}

export type MonnifyFundSessionStatus = "pending" | "paid" | "expired";

/** One-time virtual account from Monnify checkout for wallet funding. */
export interface MonnifyFundSession {
  id: string;
  reference: string;
  /** Total the customer must transfer (credit + fee). */
  amount: number;
  creditAmount: number;
  fee: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresAt: string;
  status: MonnifyFundSessionStatus;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface VerificationFilters extends ListFilters {
  result?: VerificationResult | "all";
  confidence?: ConfidenceLevel | "all";
}

export interface ReportFilters extends ListFilters {
  category?: ReportCategory | "all";
  confidence?: ConfidenceLevel | "all";
}

export const VERIFICATION_COST = 50;
export const REWARD_AMOUNT = 20;
export const LOW_BALANCE_THRESHOLD = 200;

export const WALLET_FUNDING_FEE = 100;

export interface WalletFundingQuote {
  creditAmount: number;
  fee: number;
  transferAmount: number;
}

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "fraud", label: "Fraud" },
  { value: "scam", label: "Scam" },
  { value: "mule_account", label: "Mule account" },
  { value: "identity_theft", label: "Identity theft" },
  { value: "chargeback_abuse", label: "Chargeback abuse" },
  { value: "loan_fraud", label: "Loan fraud" },
  { value: "suspicious_transaction", label: "Suspicious transaction" },
  { value: "other", label: "Other" },
];

export const IDENTIFIER_TYPES: { value: IdentifierType; label: string }[] = [
  { value: "account_number", label: "Bank account number" },
  { value: "phone", label: "Phone number" },
  { value: "email", label: "Email address" },
  { value: "bvn", label: "BVN" },
  { value: "nin", label: "NIN" },
];

export const NIGERIAN_BANKS = [
  "Access Bank",
  "First Bank of Nigeria",
  "Guaranty Trust Bank",
  "United Bank for Africa",
  "Zenith Bank",
  "Stanbic IBTC Bank",
  "Fidelity Bank",
  "Union Bank",
  "Wema Bank",
  "Polaris Bank",
  "Kuda Microfinance Bank",
  "Opay",
  "PalmPay",
  "Moniepoint MFB",
];
