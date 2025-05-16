import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { formatFocusTime } from "@/lib/utils/timer";

interface StatisticsCardProps {
  completedPomodoros: number;
  totalFocusTime: number;
}

export default function StatisticsCard({
  completedPomodoros,
  totalFocusTime,
}: StatisticsCardProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Today's Statistics</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-4 text-center">
            <p className="text-muted-foreground text-sm">Focus Sessions</p>
            <p className="text-3xl font-light mt-1">{completedPomodoros}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-muted-foreground text-sm">Total Focus Time</p>
            <p className="text-3xl font-light mt-1">{formatFocusTime(totalFocusTime)}</p>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="p-4">
        <Link href="/stats" className="w-full">
          <a className="text-primary flex items-center justify-center w-full">
            <span>View detailed statistics</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
