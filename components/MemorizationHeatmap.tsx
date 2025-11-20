import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Flame } from 'lucide-react';
import { useMemorizationStore } from '@/store/useMemorizationStore';

// Generate last 12 months of dates
function getLast12Months() {
  const months: Date[][] = [];
  const today = new Date();

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - monthOffset + 1, 0);
    const days: Date[] = [];

    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    months.push(days);
  }

  return months;
}

export function MemorizationHeatmap() {
  const { progress } = useMemorizationStore();

  // Calculate activity for each day (simulated - in production, track actual review dates)
  const getActivityLevel = (date: Date) => {
    // For demo: randomly generate activity based on progress
    const dateStr = date.toISOString().split('T')[0];
    const hash = dateStr.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const level = Math.abs(hash % 5);

    // Reduce activity for future dates
    if (date > new Date()) return 0;

    // Simulate some activity pattern
    return progress.size > 0 ? Math.min(level, 4) : 0;
  };

  const getColorClass = (level: number) => {
    const colors = {
      0: 'bg-muted/30 hover:bg-muted/50',
      1: 'bg-primary/20 hover:bg-primary/30',
      2: 'bg-primary/40 hover:bg-primary/50',
      3: 'bg-primary/60 hover:bg-primary/70',
      4: 'bg-primary hover:bg-primary/90',
    };
    return colors[level as keyof typeof colors];
  };

  const months = getLast12Months();

  // Calculate stats
  const totalDays = months.flat().filter(d => d <= new Date()).length;
  const activeDays = months.flat().filter(d => getActivityLevel(d) > 0).length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      if (getActivityLevel(checkDate) > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [progress.size]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Memorization Activity
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold">{currentStreak}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-bold">{activeDays}/{totalDays}</span>
              <span className="text-muted-foreground">active days</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {months.map((monthDays, monthIndex) => {
              const monthDate = monthDays[0];
              const monthName = monthNames[monthDate.getMonth()];

              return (
                <div key={monthIndex} className="flex flex-col gap-1">
                  {/* Month label */}
                  <div className="text-xs text-muted-foreground h-4 text-center">
                    {monthIndex % 2 === 0 ? monthName : ''}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-rows-7 gap-1">
                    {/* Fill empty cells for first week */}
                    {monthIndex === 0 &&
                      Array.from({ length: monthDays[0].getDay() }, (_, i) => (
                        <div key={`empty-${i}`} className="w-3 h-3" />
                      ))}

                    {monthDays.map((date, dayIndex) => {
                      const level = getActivityLevel(date);
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <motion.div
                          key={dayIndex}
                          whileHover={{ scale: 1.3 }}
                          className={`w-3 h-3 rounded-sm transition-colors cursor-pointer ${getColorClass(
                            level
                          )} ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          title={`${date.toLocaleDateString()}: ${
                            level === 0 ? 'No activity' : `${level} review${level > 1 ? 's' : ''}`
                          }`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: monthIndex * 0.02 + dayIndex * 0.001 }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColorClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
