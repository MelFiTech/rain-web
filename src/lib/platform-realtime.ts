import { isApiConfigured } from "@/lib/api-client";
import { getSession } from "@/lib/session";
import { io, type Socket } from "socket.io-client";

export const WALLET_FUND_SESSION_PAID_EVENT = "wallet:fund_session_paid";

export type WalletFundSessionPaidPayload = {
  sessionId: string;
};

type PaidHandler = (payload: WalletFundSessionPaidPayload) => void;

let socket: Socket | null = null;
let subscribers = 0;

function getRealtimeSocket(): Socket | null {
  if (!isApiConfigured()) return null;
  const token = getSession()?.token?.trim();
  if (!token) return null;

  const base = process.env.NEXT_PUBLIC_API_URL!.trim().replace(/\/$/, "");

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(`${base}/platform/realtime`, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
  });

  return socket;
}

/** Subscribe to wallet fund session paid events for the logged-in institution. */
export function subscribeWalletFundSessionPaid(handler: PaidHandler): () => void {
  const client = getRealtimeSocket();
  if (!client) {
    return () => {};
  }

  subscribers += 1;
  client.on(WALLET_FUND_SESSION_PAID_EVENT, handler);

  return () => {
    client.off(WALLET_FUND_SESSION_PAID_EVENT, handler);
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) {
      client.disconnect();
      socket = null;
    }
  };
}
