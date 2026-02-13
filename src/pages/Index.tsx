import { CreateMeetingDialog } from "@/components/CreateMeetingDialog";
import { MeetingsList } from "@/components/MeetingsList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useUsers";
import { CalendarDays, LogOut, User } from "lucide-react";

const Index = () => {
  const { signOut } = useAuth();
  const { data: currentUser } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">CalBook</h1>
              <p className="text-xs text-muted-foreground">Meeting Scheduler</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{currentUser.name}</span>
              </div>
            )}
            <CreateMeetingDialog />
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <MeetingsList />
      </main>
    </div>
  );
};

export default Index;
