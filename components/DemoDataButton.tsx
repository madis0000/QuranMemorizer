'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Trash2, Info } from 'lucide-react';
import { initializeDemoData, clearDemoData, getDemoDataStats } from '@/lib/demoData';

export function DemoDataButton() {
  const [stats, setStats] = useState<ReturnType<typeof getDemoDataStats> | null>(null);

  const handleInitialize = () => {
    initializeDemoData();
    updateStats();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all demo data?')) {
      clearDemoData();
      updateStats();
    }
  };

  const updateStats = () => {
    setStats(getDemoDataStats());
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleInitialize}
        className="w-full sm:w-auto"
      >
        <Database className="w-4 h-4 mr-2" />
        Load Demo Data
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        className="w-full sm:w-auto"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear Data
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={updateStats}
        className="w-full sm:w-auto"
      >
        <Info className="w-4 h-4 mr-2" />
        Stats
      </Button>

      {stats && (
        <div className="text-xs text-muted-foreground">
          {stats.totalVerses} verses | {stats.dueForReview} due | {Math.round(stats.averageStrength * 100)}% avg strength
        </div>
      )}
    </div>
  );
}
