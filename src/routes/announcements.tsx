import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Megaphone, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Panel } from "@/components/kit/ChartCard";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { announcements, fmtDateTime } from "@/lib/mock/data";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Veytrix Control Centre" },
      { name: "description", content: "Draft, schedule and publish platform-wide announcements to targeted customer segments." },
      { property: "og:title", content: "Announcements — Veytrix Control Centre" },
      { property: "og:description", content: "Broadcast platform announcements to customers." },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Broadcasts shown in the customer portal, status page and notification centre."
        breadcrumbs={[{ label: "System" }, { label: "Announcements" }]}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> New announcement
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Published" value={String(announcements.filter((a) => a.status === "published").length)} icon={Megaphone} />
        <StatCard label="Scheduled" value={String(announcements.filter((a) => a.status === "scheduled").length)} icon={Bell} tone="warning" />
        <StatCard label="Drafts" value={String(announcements.filter((a) => a.status === "draft").length)} />
        <StatCard label="Avg read rate" value="63%" delta={4.7} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {announcements.map((a) => (
          <Panel
            key={a.id}
            title={a.title}
            description={`${a.audience} · ${fmtDateTime(a.scheduledFor).slice(0, 16)}`}
            actions={<StatusBadge status={a.status} />}
            bodyClassName="flex flex-col gap-3 p-4"
          >
            <p className="text-sm text-muted-foreground">{a.message}</p>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="num text-xs text-muted-foreground">{a.createdBy}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast.info("Editing announcement")}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast.success("Announcement published")}>
                  Publish
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
            <DialogDescription>Compose a broadcast and choose who should receive it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Title</Label>
              <Input id="ann-title" placeholder="Scheduled maintenance window" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-aud">Audience</Label>
              <Input id="ann-aud" placeholder="All users" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-msg">Message</Label>
              <Textarea id="ann-msg" className="min-h-28" placeholder="What should customers know?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast.success("Announcement scheduled");
              }}
            >
              <Send className="size-3.5" /> Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
