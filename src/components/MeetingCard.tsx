import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeleteMeeting } from "@/hooks/useMeetings";
import { EditMeetingDialog } from "./EditMeetingDialog";
import { Clock, User, Trash2, Calendar } from "lucide-react";

interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    user_id: string;
    users: { name: string; email: string } | null;
  };
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const deleteMeeting = useDeleteMeeting();
  const start = new Date(meeting.start_time);
  const end = new Date(meeting.end_time);
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

  return (
    <Card className="animate-fade-in glass-card hover:shadow-xl transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="font-heading font-semibold text-lg text-foreground">{meeting.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{meeting.users?.name ?? "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(start, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(start, "h:mm a")} – {format(end, "h:mm a")} ({durationMin}m)
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <EditMeetingDialog meeting={meeting} />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => deleteMeeting.mutate(meeting.id)}
              disabled={deleteMeeting.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
