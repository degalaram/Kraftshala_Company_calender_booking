import { useState } from "react";
import { useMeetings } from "@/hooks/useMeetings";
import { useUsers } from "@/hooks/useUsers";
import { MeetingCard } from "./MeetingCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Filter } from "lucide-react";

export function MeetingsList() {
  const [userId, setUserId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: users } = useUsers();

  const filters = {
    ...(userId && userId !== "all" ? { userId } : {}),
    ...(startDate ? { startDate: new Date(startDate).toISOString() } : {}),
    ...(endDate ? { endDate: new Date(endDate).toISOString() } : {}),
  };

  const { data: meetings, isLoading } = useMeetings(
    Object.keys(filters).length > 0 ? filters : undefined
  );

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">User</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input type="date" className="h-9" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input type="date" className="h-9" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !meetings?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No meetings found. Book one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting as any} />
          ))}
        </div>
      )}
    </div>
  );
}
