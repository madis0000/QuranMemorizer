'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, BookOpen, Filter } from 'lucide-react';
import { getPagesInJuz } from '@/data/quranPages';

interface PageSelectorProps {
  onPageSelect: (pageNumber: number) => void;
  onBack: () => void;
}

export function PageSelector({ onPageSelect, onBack }: PageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);

  // Generate all pages (1-604)
  const allPages = Array.from({ length: 604 }, (_, i) => i + 1);

  // Filter pages based on search and juz selection
  const filteredPages = allPages.filter((page) => {
    const matchesSearch = searchQuery === '' || page.toString().includes(searchQuery);
    const matchesJuz = selectedJuz === null || getPagesInJuz(selectedJuz).includes(page);
    return matchesSearch && matchesJuz;
  });

  // Group pages by Juz for display
  const getJuzForPage = (page: number) => Math.ceil(page / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Modes
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Select Page to Memorize</h2>
        </div>
        <div className="w-24"></div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search page number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Juz Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedJuz || ''}
                onChange={(e) => setSelectedJuz(e.target.value ? Number(e.target.value) : null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Juz</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <option key={juz} value={juz}>
                    Juz {juz} (Pages {(juz - 1) * 20 + 1}-{Math.min(juz * 20, 604)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedJuz && (
            <div className="mt-4">
              <Badge variant="secondary" className="gap-2">
                Filtered: {filteredPages.length} pages in Juz {selectedJuz}
                <button
                  onClick={() => setSelectedJuz(null)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredPages.length} Page{filteredPages.length !== 1 ? 's' : ''} Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {filteredPages.map((page) => {
              const juz = getJuzForPage(page);
              const isJuzStart = (page - 1) % 20 === 0;

              return (
                <motion.button
                  key={page}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredPage(page)}
                  onHoverEnd={() => setHoveredPage(null)}
                  onClick={() => onPageSelect(page)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all
                    ${
                      isJuzStart
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 font-bold'
                        : 'bg-muted/30 border-muted hover:border-primary hover:bg-primary/10'
                    }
                    ${hoveredPage === page ? 'shadow-lg ring-2 ring-primary' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">{page}</div>
                    {isJuzStart && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Juz {juz}
                      </div>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  {hoveredPage === page && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover border rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap z-10"
                    >
                      <p className="text-xs font-semibold">Page {page}</p>
                      <p className="text-xs text-muted-foreground">Juz {juz}</p>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pages found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Page-by-Page Mode</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>The Quran has 604 pages in the standard Madani mushaf</li>
                <li>Each page contains 15 lines of text</li>
                <li>Pages marked with yellow are the start of a new Juz</li>
                <li>Practice all verses on a page together for complete memorization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
