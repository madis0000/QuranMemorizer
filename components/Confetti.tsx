import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  delay: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const newPieces: ConfettiPiece[] = [];

      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 8 + 4,
          delay: Math.random() * 0.3,
        });
      }

      setPieces(newPieces);

      const timeout = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [active, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}vw`,
              y: `${piece.y}vh`,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              rotate: piece.rotation + 720,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              delay: piece.delay,
              ease: 'easeIn',
            }}
            style={{
              position: 'absolute',
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Achievement unlock modal
interface AchievementUnlockProps {
  show: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: () => void;
}

export function AchievementUnlock({
  show,
  title,
  description,
  icon,
  onClose,
}: AchievementUnlockProps) {
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(onClose, 4000);
      return () => clearTimeout(timeout);
    }
  }, [show, onClose]);

  return (
    <>
      <Confetti active={show} />
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-background/95 backdrop-blur-lg border-2 border-primary rounded-2xl p-8 shadow-2xl max-w-md pointer-events-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                className="flex justify-center mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  {icon}
                </div>
              </motion.div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Achievement Unlocked!
                </h2>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-6 w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
