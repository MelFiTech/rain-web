import { buildConfidence } from "@/lib/confidence";
import type {
  DashboardSummary,
  EarningRecord,
  InstitutionSettings,
  IdentifierType,
  NetworkReportEvent,
  NotificationItem,
  ReportCategory,
  ReportRecord,
  TeamMember,
  User,
  VerificationRecord,
  WalletState,
} from "@/types";

export const MOCK_USER: User = {
  id: "usr_001",
  email: "compliance@paynest.ng",
  name: "Adaora Okonkwo",
  role: "administrator",
  institution: {
    id: "inst_001",
    name: "PayNest Microfinance Bank",
    email: "compliance@paynest.ng",
    phone: "+234 809 441 2200",
    address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    contactName: "Adaora Okonkwo",
  },
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Verification complete",
    message: "Reports found for ******8841 — High confidence.",
    read: false,
    createdAt: "2026-07-17T14:22:00Z",
  },
  {
    id: "n2",
    title: "Reward credited",
    message: "₦20 credited for report RPT-2026-0841.",
    read: false,
    createdAt: "2026-07-17T11:05:00Z",
  },
  {
    id: "n3",
    title: "Team invite accepted",
    message: "Chinedu Eze joined as Analyst.",
    read: true,
    createdAt: "2026-07-16T09:30:00Z",
  },
  {
    id: "n4",
    title: "Low wallet balance",
    message: "Your wallet balance is below ₦200.",
    read: true,
    createdAt: "2026-07-15T16:00:00Z",
  },
];

const STREAM_INSTITUTIONS = [
  "Guaranty Trust Bank",
  "Zenith Bank",
  "Access Bank",
  "Kuda Microfinance Bank",
  "Opay",
  "Moniepoint MFB",
  "First Bank of Nigeria",
  "United Bank for Africa",
  "Stanbic IBTC Bank",
  "PalmPay",
  "Fidelity Bank",
  "Polaris Bank",
] as const;

const STREAM_IDENTIFIERS = [
  "******8841",
  "+234 80* *** 4412",
  "*******4321",
  "to***@finmail.ng",
  "******9912",
  "******1188",
  "+234 81* *** 9021",
  "******3341",
];

const STREAM_CATEGORIES: ReportCategory[] = [
  "scam",
  "mule_account",
  "fraud",
  "identity_theft",
  "loan_fraud",
  "chargeback_abuse",
  "suspicious_transaction",
];

let streamSeq = 100;

export function createNetworkReportEvent(
  overrides: Partial<NetworkReportEvent> = {}
): NetworkReportEvent {
  streamSeq += 1;
  const institutionName =
    overrides.institutionName ??
    STREAM_INSTITUTIONS[streamSeq % STREAM_INSTITUTIONS.length];
  const category =
    overrides.category ??
    STREAM_CATEGORIES[streamSeq % STREAM_CATEGORIES.length];
  return {
    id: overrides.id ?? `stream_${streamSeq}`,
    institutionName,
    category,
    maskedIdentifier:
      overrides.maskedIdentifier ??
      STREAM_IDENTIFIERS[streamSeq % STREAM_IDENTIFIERS.length],
    reference: overrides.reference ?? `RPT-2026-${9000 + streamSeq}`,
    submittedAt: overrides.submittedAt ?? new Date().toISOString(),
  };
}

export const MOCK_REPORT_STREAM: NetworkReportEvent[] = [
  createNetworkReportEvent({
    id: "stream_1",
    institutionName: "Guaranty Trust Bank",
    category: "loan_fraud",
    maskedIdentifier: "*******5544",
    reference: "RPT-2026-0912",
    submittedAt: new Date(Date.now() - 45_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_2",
    institutionName: "Opay",
    category: "scam",
    maskedIdentifier: "******9912",
    reference: "RPT-2026-0911",
    submittedAt: new Date(Date.now() - 120_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_3",
    institutionName: "Kuda Microfinance Bank",
    category: "mule_account",
    maskedIdentifier: "******3341",
    reference: "RPT-2026-0910",
    submittedAt: new Date(Date.now() - 4 * 60_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_4",
    institutionName: "Zenith Bank",
    category: "identity_theft",
    maskedIdentifier: "+234 80* *** 7721",
    reference: "RPT-2026-0909",
    submittedAt: new Date(Date.now() - 9 * 60_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_5",
    institutionName: "Moniepoint MFB",
    category: "fraud",
    maskedIdentifier: "******1188",
    reference: "RPT-2026-0908",
    submittedAt: new Date(Date.now() - 14 * 60_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_6",
    institutionName: "Access Bank",
    category: "suspicious_transaction",
    maskedIdentifier: "to***@finmail.ng",
    reference: "RPT-2026-0907",
    submittedAt: new Date(Date.now() - 22 * 60_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_7",
    institutionName: "PalmPay",
    category: "chargeback_abuse",
    maskedIdentifier: "+234 81* *** 9021",
    reference: "RPT-2026-0906",
    submittedAt: new Date(Date.now() - 31 * 60_000).toISOString(),
  }),
  createNetworkReportEvent({
    id: "stream_8",
    institutionName: "United Bank for Africa",
    category: "scam",
    maskedIdentifier: "******8841",
    reference: "RPT-2026-0905",
    submittedAt: new Date(Date.now() - 48 * 60_000).toISOString(),
  }),
];

export const walletStore = { balance: 4850 };

const EXTRA_VERIFICATION_TYPES: IdentifierType[] = [
  "account_number",
  "phone",
  "email",
  "bvn",
  "nin",
];

function maskForVerificationType(type: IdentifierType, seed: number): string {
  const n = String(1000 + seed).slice(-4);
  switch (type) {
    case "phone":
      return `+234 ${80 + (seed % 3)}* *** ${n}`;
    case "email":
      return `us${seed}***@mail.ng`;
    case "bvn":
    case "nin":
      return `*******${n}`;
    default:
      return `******${n}`;
  }
}

function buildExtraMockVerifications(count: number): VerificationRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const seq = i + 9;
    const identifierType =
      EXTRA_VERIFICATION_TYPES[i % EXTRA_VERIFICATION_TYPES.length];
    const isMatch = i % 3 !== 0;
    const sources = isMatch ? (i % 10) + 1 : 0;
    const createdAt = new Date(
      Date.now() - (i + 1) * 28 * 60 * 60 * 1000
    ).toISOString();
    const maskedIdentifier = maskForVerificationType(identifierType, seq);

    const base: VerificationRecord = {
      id: `ver_${String(seq).padStart(3, "0")}`,
      reference: `VER-T${seq}-${String(2000 + i).slice(-4)}`,
      identifierType,
      maskedIdentifier,
      result: isMatch ? "match" : "no_match",
      confidence: isMatch ? buildConfidence(sources) : null,
      independentSourceCount: sources,
      amountCharged: 50,
      createdAt,
    };

    if (!isMatch) return base;

    return {
      ...base,
      totalReports: sources + 2,
      categories: (["scam", "mule_account"] as ReportCategory[]).slice(
        0,
        1 + (i % 2)
      ),
      firstReportedAt: new Date(
        Date.now() - (i + 40) * 24 * 60 * 60 * 1000
      ).toISOString(),
      mostRecentReportAt: createdAt,
      matchingIdentifiers: [maskedIdentifier],
    };
  });
}

export const MOCK_VERIFICATIONS: VerificationRecord[] = [
  {
    id: "ver_001",
    reference: "VER-M8K2-A1B3",
    identifierType: "account_number",
    maskedIdentifier: "******8841",
    result: "match",
    confidence: buildConfidence(7),
    independentSourceCount: 7,
    totalReports: 12,
    categories: ["fraud", "mule_account", "scam"],
    firstReportedAt: "2025-11-02T10:00:00Z",
    mostRecentReportAt: "2026-07-10T08:15:00Z",
    matchingIdentifiers: ["******8841", "+234 80* *** 4412"],
    amountCharged: 50,
    createdAt: "2026-07-17T14:20:00Z",
  },
  {
    id: "ver_002",
    reference: "VER-M8J9-C4D5",
    identifierType: "phone",
    maskedIdentifier: "+234 81* *** 9021",
    result: "no_match",
    confidence: null,
    independentSourceCount: 0,
    amountCharged: 50,
    createdAt: "2026-07-17T10:45:00Z",
  },
  {
    id: "ver_003",
    reference: "VER-M8H1-E6F7",
    identifierType: "bvn",
    maskedIdentifier: "*******4321",
    result: "match",
    confidence: buildConfidence(3),
    independentSourceCount: 3,
    totalReports: 4,
    categories: ["loan_fraud", "identity_theft"],
    firstReportedAt: "2026-03-14T12:00:00Z",
    mostRecentReportAt: "2026-06-28T09:40:00Z",
    matchingIdentifiers: ["*******4321", "ch***@mail.ng"],
    amountCharged: 50,
    createdAt: "2026-07-16T16:12:00Z",
  },
  {
    id: "ver_004",
    reference: "VER-M8G4-G8H9",
    identifierType: "email",
    maskedIdentifier: "to***@finmail.ng",
    result: "match",
    confidence: buildConfidence(1),
    independentSourceCount: 1,
    totalReports: 1,
    categories: ["scam"],
    firstReportedAt: "2026-07-01T11:20:00Z",
    mostRecentReportAt: "2026-07-01T11:20:00Z",
    matchingIdentifiers: ["to***@finmail.ng"],
    amountCharged: 50,
    createdAt: "2026-07-15T09:05:00Z",
  },
  {
    id: "ver_005",
    reference: "VER-M8F2-I0J1",
    identifierType: "nin",
    maskedIdentifier: "*******7788",
    result: "no_match",
    confidence: null,
    independentSourceCount: 0,
    amountCharged: 50,
    createdAt: "2026-07-14T13:30:00Z",
  },
  {
    id: "ver_006",
    reference: "VER-M8E7-K2L3",
    identifierType: "account_number",
    maskedIdentifier: "******2209",
    result: "match",
    confidence: buildConfidence(11),
    independentSourceCount: 11,
    totalReports: 18,
    categories: ["fraud", "scam", "suspicious_transaction", "mule_account"],
    firstReportedAt: "2025-08-20T08:00:00Z",
    mostRecentReportAt: "2026-07-12T17:45:00Z",
    matchingIdentifiers: ["******2209", "+234 70* *** 1155", "*******9012"],
    amountCharged: 50,
    createdAt: "2026-07-13T11:18:00Z",
  },
  {
    id: "ver_007",
    reference: "VER-M8D3-M4N5",
    identifierType: "phone",
    maskedIdentifier: "+234 90* *** 3344",
    result: "match",
    confidence: buildConfidence(5),
    independentSourceCount: 5,
    totalReports: 6,
    categories: ["chargeback_abuse"],
    firstReportedAt: "2026-01-08T14:00:00Z",
    mostRecentReportAt: "2026-05-19T10:22:00Z",
    matchingIdentifiers: ["+234 90* *** 3344", "******6612"],
    amountCharged: 50,
    createdAt: "2026-07-12T08:40:00Z",
  },
  {
    id: "ver_008",
    reference: "VER-M8C8-O6P7",
    identifierType: "account_number",
    maskedIdentifier: "******5510",
    result: "no_match",
    confidence: null,
    independentSourceCount: 0,
    amountCharged: 50,
    createdAt: "2026-07-11T15:55:00Z",
  },
  ...buildExtraMockVerifications(32),
];

const EXTRA_REPORT_CATEGORIES: ReportCategory[] = [
  "scam",
  "mule_account",
  "loan_fraud",
  "identity_theft",
  "chargeback_abuse",
  "suspicious_transaction",
  "other",
];

const EXTRA_REPORT_BANKS = [
  "Kuda Microfinance Bank",
  "Opay",
  "Guaranty Trust Bank",
  "Zenith Bank",
  "Access Bank",
  "PalmPay",
  "Moniepoint MFB",
  "United Bank for Africa",
];

const EXTRA_REPORT_NAMES = [
  "Tunde Bakare",
  "Ngozi Ibe",
  "Chinedu Eze",
  "Yetunde Adebayo",
  "Samuel Adeyemi",
  "Amina Yusuf",
  "David Ojo",
  "Grace Etim",
  "Hassan Garba",
  "Precious Nwankwo",
];

function buildExtraMockReports(count: number): ReportRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const seq = i + 7;
    const sources = (i % 10) + 1;
    const category = EXTRA_REPORT_CATEGORIES[i % EXTRA_REPORT_CATEGORIES.length];
    const bank = EXTRA_REPORT_BANKS[i % EXTRA_REPORT_BANKS.length];
    const suffix = String(1000 + seq).slice(-4);
    const submittedAt = new Date(
      Date.now() - (i + 1) * 36 * 60 * 60 * 1000
    ).toISOString();

    return {
      id: `rpt_${String(seq).padStart(3, "0")}`,
      reference: `RPT-2026-${String(900 + seq).padStart(4, "0")}`,
      fullName: EXTRA_REPORT_NAMES[i % EXTRA_REPORT_NAMES.length],
      bank,
      maskedAccountNumber: `******${suffix}`,
      maskedPhone: `+234 ${70 + (i % 3)}* *** ${1000 + seq}`,
      category,
      description:
        "Synthetic network report for UI testing — repeated inbound transfers and identity reuse flagged during onboarding review.",
      incidentDate: submittedAt.slice(0, 10),
      amountInvolved: 150000 + (i % 12) * 125000,
      independentSourceCount: sources,
      confidence: buildConfidence(sources),
      earningsGenerated: (i % 4) * 20,
      submittedAt,
    };
  });
}

export const MOCK_REPORTS: ReportRecord[] = [
  {
    id: "rpt_001",
    reference: "RPT-2026-0841",
    fullName: "Ibrahim Musa",
    bank: "Kuda Microfinance Bank",
    maskedAccountNumber: "******3341",
    maskedPhone: "+234 80* *** 7721",
    category: "mule_account",
    description:
      "Account used as intermediate hop for multiple unauthorized transfers from merchant wallets.",
    incidentDate: "2026-06-28",
    amountInvolved: 2450000,
    independentSourceCount: 4,
    confidence: buildConfidence(4),
    earningsGenerated: 60,
    submittedAt: "2026-07-02T10:15:00Z",
  },
  {
    id: "rpt_002",
    reference: "RPT-2026-0792",
    fullName: "Blessing Okoro",
    bank: "Opay",
    maskedAccountNumber: "******9912",
    maskedEmail: "bl***@yahoo.com",
    category: "scam",
    description:
      "Customer reported social-engineering scam; funds routed through this account within minutes.",
    incidentDate: "2026-06-15",
    amountInvolved: 380000,
    independentSourceCount: 2,
    confidence: buildConfidence(2),
    earningsGenerated: 20,
    submittedAt: "2026-06-18T14:40:00Z",
  },
  {
    id: "rpt_003",
    reference: "RPT-2026-0710",
    bank: "Guaranty Trust Bank",
    maskedAccountNumber: "******1188",
    maskedBvn: "*******5544",
    category: "loan_fraud",
    description:
      "Identity documents reused across multiple failed loan applications under different names.",
    incidentDate: "2026-05-22",
    amountInvolved: 1500000,
    independentSourceCount: 6,
    confidence: buildConfidence(6),
    earningsGenerated: 100,
    submittedAt: "2026-05-25T09:20:00Z",
  },
  {
    id: "rpt_004",
    reference: "RPT-2026-0655",
    fullName: "Emeka Nwosu",
    maskedPhone: "+234 70* *** 8820",
    maskedNin: "*******2201",
    category: "identity_theft",
    description:
      "NIN associated with account opening attempts that failed biometric checks.",
    incidentDate: "2026-05-01",
    independentSourceCount: 1,
    confidence: buildConfidence(1),
    earningsGenerated: 0,
    submittedAt: "2026-05-03T16:05:00Z",
  },
  {
    id: "rpt_005",
    reference: "RPT-2026-0601",
    bank: "Zenith Bank",
    maskedAccountNumber: "******4477",
    maskedEmail: "fa***@proton.me",
    category: "fraud",
    description:
      "Pattern of chargebacks after high-value card-not-present transactions.",
    incidentDate: "2026-04-12",
    amountInvolved: 920000,
    independentSourceCount: 9,
    confidence: buildConfidence(9),
    earningsGenerated: 140,
    submittedAt: "2026-04-14T11:50:00Z",
  },
  {
    id: "rpt_006",
    reference: "RPT-2026-0544",
    fullName: "Fatima Bello",
    bank: "Moniepoint MFB",
    maskedAccountNumber: "******8099",
    category: "suspicious_transaction",
    description:
      "Unusual velocity of inbound transfers from multiple unrelated senders.",
    incidentDate: "2026-03-30",
    amountInvolved: 5100000,
    independentSourceCount: 3,
    confidence: buildConfidence(3),
    earningsGenerated: 40,
    submittedAt: "2026-04-01T08:30:00Z",
  },
  ...buildExtraMockReports(32),
];

export const MOCK_WALLET: WalletState = {
  balance: walletStore.balance,
  lowBalanceThreshold: 200,
  transactions: [
    {
      id: "txn_001",
      type: "reward_credit",
      amount: 20,
      balanceAfter: 4850,
      description: "Reward for report RPT-2026-0841",
      reference: "RWD-M8K2-Q1",
      createdAt: "2026-07-17T11:05:00Z",
    },
    {
      id: "txn_002",
      type: "verification_charge",
      amount: -50,
      balanceAfter: 4830,
      description: "Verification VER-M8K2-A1B3",
      reference: "CHG-M8K2-A1",
      createdAt: "2026-07-17T14:20:00Z",
    },
    {
      id: "txn_003",
      type: "verification_charge",
      amount: -50,
      balanceAfter: 4880,
      description: "Verification VER-M8J9-C4D5",
      reference: "CHG-M8J9-C4",
      createdAt: "2026-07-17T10:45:00Z",
    },
    {
      id: "txn_004",
      type: "funding",
      amount: 5000,
      balanceAfter: 4930,
      description: "Wallet funding via Monnify",
      reference: "FND-M8H1-Z9",
      createdAt: "2026-07-16T08:00:00Z",
    },
    {
      id: "txn_005",
      type: "reward_credit",
      amount: 20,
      balanceAfter: -70,
      description: "Reward for report RPT-2026-0792",
      reference: "RWD-M8G4-W2",
      createdAt: "2026-07-15T12:30:00Z",
    },
    {
      id: "txn_006",
      type: "verification_charge",
      amount: -50,
      balanceAfter: -90,
      description: "Verification VER-M8H1-E6F7",
      reference: "CHG-M8H1-E6",
      createdAt: "2026-07-16T16:12:00Z",
    },
    {
      id: "txn_007",
      type: "adjustment",
      amount: 100,
      balanceAfter: 30,
      description: "Manual credit adjustment",
      reference: "ADJ-M8F2-X3",
      createdAt: "2026-07-10T09:00:00Z",
    },
    {
      id: "txn_008",
      type: "funding",
      amount: 2000,
      balanceAfter: 2080,
      description: "Wallet funding via Monnify",
      reference: "FND-M8E7-Y4",
      createdAt: "2026-07-08T15:20:00Z",
    },
  ],
};

export const MOCK_EARNINGS: EarningRecord[] = [
  {
    id: "earn_001",
    maskedIdentifier: "******3341",
    reportReference: "RPT-2026-0841",
    amount: 20,
    status: "available",
    createdAt: "2026-07-17T11:05:00Z",
  },
  {
    id: "earn_002",
    maskedIdentifier: "******9912",
    reportReference: "RPT-2026-0792",
    amount: 20,
    status: "available",
    createdAt: "2026-07-15T12:30:00Z",
  },
  {
    id: "earn_003",
    maskedIdentifier: "******1188",
    reportReference: "RPT-2026-0710",
    amount: 20,
    status: "available",
    createdAt: "2026-07-10T09:15:00Z",
  },
  {
    id: "earn_004",
    maskedIdentifier: "******1188",
    reportReference: "RPT-2026-0710",
    amount: 20,
    status: "available",
    createdAt: "2026-07-08T14:00:00Z",
  },
  {
    id: "earn_005",
    maskedIdentifier: "******4477",
    reportReference: "RPT-2026-0601",
    amount: 20,
    status: "pending",
    createdAt: "2026-07-16T18:40:00Z",
  },
  {
    id: "earn_006",
    maskedIdentifier: "******8099",
    reportReference: "RPT-2026-0544",
    amount: 20,
    status: "available",
    createdAt: "2026-07-05T11:22:00Z",
  },
  {
    id: "earn_007",
    maskedIdentifier: "******4477",
    reportReference: "RPT-2026-0601",
    amount: 20,
    status: "paid",
    createdAt: "2026-06-28T10:00:00Z",
  },
  {
    id: "earn_008",
    maskedIdentifier: "******3341",
    reportReference: "RPT-2026-0841",
    amount: 20,
    status: "available",
    createdAt: "2026-07-12T16:50:00Z",
  },
];

export const teamStore: { members: TeamMember[] } = {
  members: [
    {
      id: "tm_001",
      name: "Adaora Okonkwo",
      email: "adaora.okonkwo@paynest.ng",
      role: "administrator",
      status: "active",
      lastActiveAt: "2026-07-17T14:30:00Z",
    },
    {
      id: "tm_002",
      name: "Chinedu Eze",
      email: "chinedu.eze@paynest.ng",
      role: "analyst",
      status: "active",
      lastActiveAt: "2026-07-17T13:10:00Z",
    },
    {
      id: "tm_003",
      name: "Yetunde Adebayo",
      email: "yetunde.adebayo@paynest.ng",
      role: "finance",
      status: "active",
      lastActiveAt: "2026-07-17T09:45:00Z",
    },
    {
      id: "tm_004",
      name: "Tunde Bakare",
      email: "tunde.bakare@paynest.ng",
      role: "analyst",
      status: "invited",
      lastActiveAt: "2026-07-16T08:00:00Z",
    },
    {
      id: "tm_005",
      name: "Ngozi Ibe",
      email: "ngozi.ibe@paynest.ng",
      role: "analyst",
      status: "deactivated",
      lastActiveAt: "2026-06-20T17:00:00Z",
    },
  ],
};

export const settingsStore: { data: InstitutionSettings } = {
  data: {
  profile: { ...MOCK_USER.institution },
  notificationPreferences: {
    emailVerificationResults: true,
    emailEarnings: true,
    emailTeamActivity: false,
    emailLowBalance: true,
    inAppNotifications: true,
  },
  sessions: [
    {
      id: "sess_001",
      device: "Chrome on macOS",
      location: "Lagos, Nigeria",
      ipAddress: "102.89.***.**",
      lastActiveAt: "2026-07-17T14:30:00Z",
      current: true,
    },
    {
      id: "sess_002",
      device: "Safari on iPhone",
      location: "Lagos, Nigeria",
      ipAddress: "105.112.***.**",
      lastActiveAt: "2026-07-16T20:15:00Z",
      current: false,
    },
    {
      id: "sess_003",
      device: "Chrome on Windows",
      location: "Abuja, Nigeria",
      ipAddress: "41.190.***.**",
      lastActiveAt: "2026-07-14T11:00:00Z",
      current: false,
    },
  ],
  developer: {
    apiKey: {
      keyPrefix: "rain_live",
      maskedKey: "rain_live_••••••••••••8f3a",
      createdAt: "2026-01-15T09:00:00.000Z",
      lastUsedAt: "2026-07-17T11:22:00.000Z",
    },
    webhooks: [
      {
        id: "wh_001",
        url: "https://api.paynest.ng/rain/webhooks",
        events: ["verification.completed", "report.submitted"],
        secretPreview: "whsec_••••••••42ab",
        enabled: true,
        lastDeliveryAt: "2026-07-17T13:05:00.000Z",
        lastDeliveryStatus: "success",
      },
    ],
  },
  settlementBank: null,
  },
};

export function getDashboardSummary(): DashboardSummary {
  return {
    walletBalance: walletStore.balance,
    totalVerifications: MOCK_VERIFICATIONS.length + 42,
    usersReported: MOCK_REPORTS.length + 18,
    totalEarnings: MOCK_EARNINGS.reduce((s, e) => s + e.amount, 0) + 280,
    recentVerifications: MOCK_VERIFICATIONS.slice(0, 5),
    recentReports: MOCK_REPORTS.slice(0, 4),
    recentEarnings: MOCK_EARNINGS.filter((e) => e.status !== "paid").slice(0, 4),
    reportStream: MOCK_REPORT_STREAM.map((e) => ({ ...e })),
  };
}

/** Identifiers that return a match in mock verification */
export const MATCH_TRIGGERS = [
  "0123456789",
  "8841223341",
  "08031234567",
  "fraud@test.ng",
  "22222222222",
  "12345678901",
];
