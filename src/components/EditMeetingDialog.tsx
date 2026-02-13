import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMeeting } from "@/hooks/useMeetings";
import { Pencil } from "lucide-react";
import { format } from "date-fns";

interface EditMeetingDialogProps {
  meeting: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
  };
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function EditMeetingDialog({ meeting }: EditMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [startTime, setStartTime] = useState(toLocalDatetime(meeting.start_time));
  const [endTime, setEndTime] = useState(toLocalDatetime(meeting.end_time));
  const [validationError, setValidationError] = useState("");
  const updateMeeting = useUpdateMeeting();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim()) {
      setValidationError("Title is required");
      return;
    }
    if (!startTime || !endTime) {
      setValidationError("Start time and end time are required");
      return;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      setValidationError("Start time must be before end time");
      return;
    }

    updateMeeting.mutate(
      {
        id: meeting.id,
        data: {
          title: title.trim(),
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => setValidationError(error.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v) {
        setTitle(meeting.title);
        setStartTime(toLocalDatetime(meeting.start_time));
        setEndTime(toLocalDatetime(meeting.end_time));
        setValidationError("");
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {validationError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Meeting Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start Time</Label>
              <Input id="edit-start" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">End Time</Label>
              <Input id="edit-end" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={updateMeeting.isPending}>
            {updateMeeting.isPending ? "Updating..." : "Update Meeting"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
