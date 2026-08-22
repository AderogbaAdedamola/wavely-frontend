"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "./auth-provider";
import type { QrResponse, WaStatus, WaStatusResponse } from "@/lib/types";

interface SocketContextValue {
  /** Socket.io is connected — real-time events are flowing. */
  realtime: boolean;
}

const SocketContext = createContext<SocketContextValue>({ realtime: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [realtime, setRealtime] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io(API_BASE_URL || undefined, {
      auth: { token },
      // Polling first so the socket connects through the Next.js proxy even when the
      // WebSocket upgrade isn't proxied in dev; it upgrades to WS when available.
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => setRealtime(true));
    socket.on("disconnect", () => setRealtime(false));
    socket.on("connect_error", () => setRealtime(false));

    socket.on("wa:status", (data: { status: WaStatus; qr?: string }) => {
      queryClient.setQueryData<WaStatusResponse>(["wa", "status"], {
        status: data.status,
        hasQr: !!data.qr,
      });
      if (data.qr) {
        queryClient.setQueryData<QrResponse>(["wa", "qr"], { qr: data.qr });
      }
      if (data.status === "connected") {
        queryClient.setQueryData(["wa", "qr"], null);
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      }
    });

    socket.on("wa:qr", (data: { qr: string }) => {
      queryClient.setQueryData<QrResponse>(["wa", "qr"], { qr: data.qr });
      queryClient.setQueryData<WaStatusResponse>(["wa", "status"], {
        status: "requires_scan",
        hasQr: true,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);

  return (
    <SocketContext.Provider value={{ realtime: token ? realtime : false }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useRealtime() {
  return useContext(SocketContext).realtime;
}
