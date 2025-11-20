import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, RotateCcw, Eye } from 'lucide-react';

interface StuckWordModalProps {
  isOpen: boolean;
  word: string;
  attempts: number;
  maxAttempts: number;
  onRetry: () => void;
  onReveal: () => void;
  onClose: () => void;
}

export function StuckWordModal({
  isOpen,
  word,
  attempts,
  maxAttempts,
  onRetry,
  onReveal,
  onClose,
}: StuckWordModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [showWord, setShowWord] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setShowWord(false);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowWord(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-orange-500" />
            {showWord ? 'Need Help?' : 'Thinking Time...'}
          </DialogTitle>
          <DialogDescription>
            {showWord
              ? `You've attempted this word ${attempts} time${attempts > 1 ? 's' : ''}. Would you like to retry or reveal it?`
              : `Take a moment to recall the next word. It will be revealed in ${countdown} second${countdown > 1 ? 's' : ''}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showWord ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <div className="text-6xl font-bold text-orange-500 animate-pulse">
                  {countdown}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-gray-500">
                Get ready to see the word...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  The word you're looking for:
                </p>
                <p
                  className="text-4xl font-arabic text-center text-blue-900 dark:text-blue-100"
                  dir="rtl"
                >
                  {word}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Attempts:</strong> {attempts} / {maxAttempts}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Don't worry! Repetition is key to memorization.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          {showWord && (
            <>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry();
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReveal();
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4" />
                Reveal & Continue
              </Button>
            </>
          )}
          {!showWord && (
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500"
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
