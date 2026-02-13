import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMeeting } from "@/hooks/useMeetings";
import { useCurrentUser } from "@/hooks/useUsers";
import { CalendarPlus } from "lucide-react";

export function CreateMeetingDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const createMeeting = useCreateMeeting();
  const { data: currentUser } = useCurrentUser();

  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!currentUser) { setValidationError("User profile not found. Please try logging in again."); return; }
    if (!title.trim()) { setValidationError("Meeting title is required"); return; }
    if (!startTime || !endTime) { setValidationError("Start time and end time are required"); return; }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) { setValidationError("Start time must be before end time"); return; }

    createMeeting.mutate(
      {
        user_id: currentUser.id,
        title: title.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      },
      {
        onSuccess: () => {
          setTitle("");
          setStartTime("");
          setEndTime("");
          setOpen(false);
          setValidationError("");
        },
        onError: (error) => setValidationError(error.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Book Meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Book a Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {validationError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Team Standup" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createMeeting.isPending}>
            {createMeeting.isPending ? "Booking..." : "Book Meeting"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
