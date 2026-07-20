"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  removeWebhook,
  setWebhookEnabled,
  upsertWebhook,
} from "@/services/settings";
import type { WebhookEndpoint, WebhookEventType } from "@/types";
import { Copy, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

const WEBHOOK_EVENTS: { value: WebhookEventType; label: string }[] = [
  { value: "verification.completed", label: "Verification completed" },
  { value: "report.submitted", label: "Report submitted" },
  { value: "wallet.low_balance", label: "Wallet low balance" },
];

function eventLabel(type: WebhookEventType): string {
  return WEBHOOK_EVENTS.find((e) => e.value === type)?.label ?? type;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}

interface WebhooksSettingsPanelProps {
  webhooks: WebhookEndpoint[];
  onUpdated: () => Promise<void>;
}

export function WebhooksSettingsPanel({
  webhooks,
  onUpdated,
}: WebhooksSettingsPanelProps) {
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(
    null
  );
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventType[]>([
    "verification.completed",
  ]);
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookError, setWebhookError] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  const [deleteWebhook, setDeleteWebhook] = useState<WebhookEndpoint | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAddWebhook = () => {
    setEditingWebhook(null);
    setWebhookUrl("");
    setWebhookEvents(["verification.completed"]);
    setWebhookError("");
    setNewWebhookSecret(null);
    setWebhookOpen(true);
  };

  const openEditWebhook = (wh: WebhookEndpoint) => {
    setEditingWebhook(wh);
    setWebhookUrl(wh.url);
    setWebhookEvents([...wh.events]);
    setWebhookError("");
    setNewWebhookSecret(null);
    setWebhookOpen(true);
  };

  const toggleEvent = (event: WebhookEventType) => {
    setWebhookEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  const saveWebhook = async (e: FormEvent) => {
    e.preventDefault();
    setWebhookError("");
    if (!webhookUrl.trim()) {
      setWebhookError("Enter a webhook URL.");
      return;
    }
    if (webhookEvents.length === 0) {
      setWebhookError("Select at least one event.");
      return;
    }
    setWebhookSaving(true);
    try {
      const res = await upsertWebhook({
        id: editingWebhook?.id,
        url: webhookUrl,
        events: webhookEvents,
      });
      if (res.signingSecret) {
        setNewWebhookSecret(res.signingSecret);
      } else {
        setWebhookOpen(false);
      }
      await onUpdated();
    } catch {
      setWebhookError("Could not save webhook.");
    } finally {
      setWebhookSaving(false);
    }
  };

  const handleToggleEnabled = async (wh: WebhookEndpoint) => {
    await setWebhookEnabled(wh.id, !wh.enabled);
    await onUpdated();
  };

  const handleDeleteWebhook = async () => {
    if (!deleteWebhook) return;
    setDeleteLoading(true);
    try {
      await removeWebhook(deleteWebhook.id);
      setDeleteWebhook(null);
      await onUpdated();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Card padding="none" className="py-4 sm:py-5">
        <CardHeader
          className="px-5 sm:px-6 mb-3"
          title="Endpoints"
          description="HTTPS URLs that receive signed POST payloads from Rain"
          action={
            <Button type="button" size="sm" onClick={openAddWebhook}>
              <Plus className="h-4 w-4" />
              Add endpoint
            </Button>
          }
        />

        {webhooks.length === 0 ? (
          <p className="mx-5 sm:mx-6 text-sm text-muted py-6 text-center rounded-xl bg-hover/50">
            No webhook endpoints yet.
          </p>
        ) : (
          <div className="space-y-0.5 px-2 sm:px-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="px-3 py-3.5 rounded-xl hover:bg-hover/50 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">
                      {wh.url}
                    </p>
                    <p className="mt-0.5 text-xs text-muted font-mono">
                      Signing secret {wh.secretPreview}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={wh.enabled ? "success" : "soft"}>
                      {wh.enabled ? "Active" : "Paused"}
                    </Badge>
                    <label className="inline-flex items-center gap-2 text-xs text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wh.enabled}
                        onChange={() => handleToggleEnabled(wh)}
                        className="checkbox"
                      />
                      Enabled
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {wh.events.map((ev) => (
                    <span
                      key={ev}
                      className="text-[11px] text-muted rounded-md bg-hover px-2 py-0.5"
                    >
                      {eventLabel(ev)}
                    </span>
                  ))}
                </div>
                {wh.lastDeliveryAt && (
                  <p className="text-xs text-subtle">
                    Last delivery {formatRelative(wh.lastDeliveryAt)}
                    {wh.lastDeliveryStatus === "success" && " · OK"}
                    {wh.lastDeliveryStatus === "failed" && " · Failed"}
                  </p>
                )}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditWebhook(wh)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteWebhook(wh)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={webhookOpen}
        onClose={() => setWebhookOpen(false)}
        title={editingWebhook ? "Edit webhook" : "Add webhook"}
        description="HTTPS endpoints only. Rain signs each payload with your signing secret."
        size="md"
      >
        {newWebhookSecret ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Copy your signing secret now. You will not be able to view the full
              secret again.
            </p>
            <code className="block rounded-xl bg-hover px-4 py-3 text-sm font-mono text-ink break-all">
              {newWebhookSecret}
            </code>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => copyText(newWebhookSecret)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy secret
              </Button>
              <Button onClick={() => setWebhookOpen(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={saveWebhook} className="space-y-4">
            <Input
              label="Endpoint URL"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.example.com/rain/webhooks"
              required
            />
            <div>
              <p className="text-sm font-medium text-ink mb-2">Events</p>
              <div className="space-y-1">
                {WEBHOOK_EVENTS.map((ev) => (
                  <label
                    key={ev.value}
                    className={cn(
                      "flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl hover:bg-hover cursor-pointer"
                    )}
                  >
                    <span className="text-sm text-foreground">{ev.label}</span>
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(ev.value)}
                      onChange={() => toggleEvent(ev.value)}
                      className="checkbox"
                    />
                  </label>
                ))}
              </div>
            </div>
            {webhookError && (
              <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
                {webhookError}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              loading={webhookSaving}
              disabled={!webhookUrl.trim() || webhookEvents.length === 0}
            >
              {editingWebhook ? "Save webhook" : "Create webhook"}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteWebhook}
        onClose={() => setDeleteWebhook(null)}
        onConfirm={handleDeleteWebhook}
        loading={deleteLoading}
        title="Remove webhook?"
        description={
          deleteWebhook
            ? `${deleteWebhook.url} will no longer receive events.`
            : undefined
        }
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
