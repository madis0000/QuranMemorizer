'use client';

import { useState, useEffect } from 'react';
import { TajweedText } from '@/components/TajweedText';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TajweedTestPage() {
  const [verseData, setVerseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerse() {
      try {
        const response = await fetch('/api/quran/verse?key=1:1&tajweed=true');
        const data = await response.json();
        console.log('🎨 API Response:', data);
        console.log('🎨 Has Tajweed:', data.hasTajweed);
        console.log('🎨 Text preview:', data.text.substring(0, 200));
        setVerseData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVerse();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎨 Tajweed Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">API Response Status:</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify({
                hasTajweed: verseData?.hasTajweed,
                textLength: verseData?.text?.length,
                containsTajweedTags: verseData?.text?.includes('<tajweed'),
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold mb-2">Raw Text (first 300 chars):</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {verseData?.text?.substring(0, 300)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold mb-2">Rendered with TajweedText Component:</h3>
            <div className="p-6 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border border-emerald-500/20 rounded-lg">
              <TajweedText
                text={verseData?.text || ''}
                hasTajweed={true}
                className="text-4xl font-['Amiri'] leading-loose"
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Color Legend:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#d500b7' }}></span>
                <span>Idgham/Ghunna (Pink)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#169777' }}></span>
                <span>Ikhfa (Green)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ff7e1e' }}></span>
                <span>Iqlab (Orange)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0088ff' }}></span>
                <span>Qalqalah (Blue)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#aaaaaa' }}></span>
                <span>Silent/Sukun (Gray)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ff0000' }}></span>
                <span>Madd Obligatory (Red)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
