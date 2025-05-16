import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { DailyStats, Session } from "@shared/schema";
import { formatFocusTime } from "@/lib/utils/timer";
import { format } from "date-fns";

export default function Stats() {
  // Fetch today's stats
  const { data: stats, isLoading: statsLoading } = useQuery<DailyStats>({
    queryKey: ["/api/stats/daily"],
  });

  // Fetch today's sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions", { date: new Date().toISOString() }],
  });

  // Calculate session data for chart
  const chartData = sessions.map((session, index) => {
    return {
      name: `Session ${index + 1}`,
      minutes: Math.round(session.duration / 60),
      type: session.type
    };
  });

  // Calculate some additional stats
  const workSessions = sessions.filter(s => s.type === 'work');
  const breakSessions = sessions.filter(s => s.type === 'break');
  const averageWorkDuration = workSessions.length > 0
    ? workSessions.reduce((sum, s) => sum + s.duration, 0) / workSessions.length
    : 0;
  const averageBreakDuration = breakSessions.length > 0
    ? breakSessions.reduce((sum, s) => sum + s.duration, 0) / breakSessions.length
    : 0;
  
  return (
    <>
      <header className="py-4">
        <h1 className="text-2xl font-medium">Statistics</h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </header>

      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Focus Sessions</p>
                <p className="text-2xl font-medium">
                  {statsLoading ? "-" : stats?.completedPomodoros || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Focus Time</p>
                <p className="text-2xl font-medium">
                  {statsLoading ? "-" : formatFocusTime(stats?.totalFocusTime || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Focus Session</p>
                <p className="text-2xl font-medium">
                  {statsLoading ? "-" : formatFocusTime(averageWorkDuration)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-medium">
                  {statsLoading ? "-" : stats?.tasksCompleted || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sessions Timeline</CardTitle>
            <CardDescription>Duration of each session in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Loading session data...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-64">
                <BarChart 
                  data={chartData}
                  index="name"
                  categories={["minutes"]}
                  colors={["var(--chart-1)", "var(--chart-2)"]}
                  yAxisWidth={30}
                  valueFormatter={(value) => `${value} min`}
                  customTooltip={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {data.name}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {data.type === 'work' ? 'Focus' : 'Break'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-bold">
                              {data.minutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No sessions recorded today</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Session Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-primary">Focus Sessions</h3>
                  <p className="text-3xl font-light">{workSessions.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-accent">Break Sessions</h3>
                  <p className="text-3xl font-light">{breakSessions.length}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recent Sessions</h3>
                {sessions.length > 0 ? (
                  <ul className="space-y-2">
                    {sessions.slice(-5).reverse().map((session, index) => (
                      <li key={session.id} className="flex justify-between text-sm">
                        <span className={session.type === 'work' ? 'text-primary' : 'text-accent'}>
                          {session.type === 'work' ? 'Focus' : 'Break'} Session
                        </span>
                        <span className="text-muted-foreground">
                          {formatFocusTime(session.duration)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No sessions recorded today</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
