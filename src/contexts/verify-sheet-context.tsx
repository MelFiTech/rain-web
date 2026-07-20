"use client";

import { VerifyUserSheet } from "@/components/verify-user-sheet";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface OpenVerifySheetOptions {
  ref?: string;
}

interface VerifySheetContextValue {
  openVerifySheet: (options?: OpenVerifySheetOptions) => void;
  closeVerifySheet: () => void;
}

const VerifySheetContext = createContext<VerifySheetContextValue | null>(null);

export function VerifySheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [initialRef, setInitialRef] = useState<string | null>(null);

  const openVerifySheet = useCallback((options?: OpenVerifySheetOptions) => {
    setInitialRef(options?.ref?.trim() || null);
    setOpen(true);
  }, []);

  const closeVerifySheet = useCallback(() => {
    setOpen(false);
    setInitialRef(null);
  }, []);

  const value = useMemo(
    () => ({ openVerifySheet, closeVerifySheet }),
    [openVerifySheet, closeVerifySheet]
  );

  return (
    <VerifySheetContext.Provider value={value}>
      {children}
      <VerifyUserSheet
        open={open}
        onClose={closeVerifySheet}
        initialRef={initialRef}
      />
    </VerifySheetContext.Provider>
  );
}

export function useVerifySheet() {
  const ctx = useContext(VerifySheetContext);
  if (!ctx) {
    throw new Error("useVerifySheet must be used within VerifySheetProvider");
  }
  return ctx;
}
