"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { formatDateTime, formatRelative } from "@/lib/format";
import { rotateApiKey } from "@/services/settings";
import type { ApiKeyInfo } from "@/types";
import { Copy } from "lucide-react";
import { useState } from "react";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}

interface ApiKeySettingsPanelProps {
  apiKey: ApiKeyInfo;
  onUpdated: () => Promise<void>;
}

export function ApiKeySettingsPanel({
  apiKey,
  onUpdated,
}: ApiKeySettingsPanelProps) {
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [keyMsg, setKeyMsg] = useState("");

  const handleRotate = async () => {
    setRotating(true);
    try {
      const { fullKey } = await rotateApiKey();
      setRevealedKey(fullKey);
      setRotateOpen(false);
      setKeyMsg("New API key created. Copy it now — it will not be shown again.");
      await onUpdated();
    } finally {
      setRotating(false);
    }
  };

  return (
    <>
      <Card className="space-y-4">
        <div className="rounded-xl border border-line px-4 py-3 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="text-sm font-mono text-ink break-all">
              {apiKey.maskedKey}
            </code>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  copyText(apiKey.maskedKey);
                  setKeyMsg("Copied masked key reference.");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRotateOpen(true)}
              >
                Rotate key
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted border-t border-line pt-3">
            <span>Created {formatDateTime(apiKey.createdAt)}</span>
            {apiKey.lastUsedAt && (
              <span>Last used {formatRelative(apiKey.lastUsedAt)}</span>
            )}
          </div>
        </div>
        {revealedKey && (
          <div className="rounded-xl bg-hover px-4 py-3 space-y-2">
            <p className="text-xs font-medium text-ink">New API key</p>
            <code className="block text-sm font-mono text-ink break-all">
              {revealedKey}
            </code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => copyText(revealedKey)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy key
            </Button>
          </div>
        )}
        {keyMsg && <p className="text-sm text-muted">{keyMsg}</p>}
        <p className="text-xs text-subtle leading-relaxed">
          Send{" "}
          <code className="text-muted">Authorization: Bearer YOUR_API_KEY</code>{" "}
          on API requests. Base URL:{" "}
          <code className="text-muted">https://api.rain.ng/v1</code>
        </p>
      </Card>

      <ConfirmDialog
        open={rotateOpen}
        onClose={() => setRotateOpen(false)}
        onConfirm={handleRotate}
        loading={rotating}
        title="Rotate API key?"
        description="The current key stops working immediately. Update any integrations using the old key."
        confirmLabel="Rotate key"
        danger
      />
    </>
  );
}
