'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  Volume2,
  Settings,
  Bell,
  Palette,
  Download,
  Upload,
  Trash2,
  Play,
  Square,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useMemorizationStore } from '@/store/useMemorizationStore';

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    showTajweed,
    toggleTajweed,
    showTransliteration,
    toggleTransliteration,
    showTranslation,
    toggleTranslation,
    translationLanguage,
    setTranslationLanguage,
    currentReciter,
    setCurrentReciter,
    playbackSpeed,
    setPlaybackSpeed,
    selectedMicrophone,
    setSelectedMicrophone,
    selectedSpeaker,
    setSelectedSpeaker,
    notificationsEnabled,
    setNotificationsEnabled,
    reminderTime,
    setReminderTime,
  } = useUIStore();

  const { resetProgress } = useMemorizationStore();

  // Audio Device States
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [micLevel, setMicLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [hasLoadedDevices, setHasLoadedDevices] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Debug: Log initial store values on mount
  useEffect(() => {
    console.log('🔧 [Settings Page] Component mounted');
    console.log('📦 [Settings Page] Initial selectedMicrophone from store:', selectedMicrophone);
    console.log('🔊 [Settings Page] Initial selectedSpeaker from store:', selectedSpeaker);
  }, []);

  // Debug: Log when store values change
  useEffect(() => {
    console.log('🔄 [Settings Page] Store value changed - selectedMicrophone:', selectedMicrophone);
  }, [selectedMicrophone]);

  useEffect(() => {
    console.log('🔄 [Settings Page] Store value changed - selectedSpeaker:', selectedSpeaker);
  }, [selectedSpeaker]);

  // Get available audio devices - only load once after store has hydrated
  useEffect(() => {
    // Wait a tick to ensure Zustand has hydrated from localStorage
    const timer = setTimeout(() => {
      if (!hasLoadedDevices) {
        loadAudioDevices();
        setHasLoadedDevices(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasLoadedDevices]);

  const loadAudioDevices = async () => {
    try {
      console.log('🎤 [Audio Devices] Loading devices...');

      // Check localStorage directly for saved values
      let savedMicrophone = selectedMicrophone;
      let savedSpeaker = selectedSpeaker;

      try {
        const storedData = localStorage.getItem('ui-storage');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          console.log('💾 [Audio Devices] Raw localStorage data:', parsed);
          if (parsed.state) {
            savedMicrophone = parsed.state.selectedMicrophone || selectedMicrophone;
            savedSpeaker = parsed.state.selectedSpeaker || selectedSpeaker;
            console.log('📦 [Audio Devices] Saved microphone from localStorage:', savedMicrophone);
            console.log('🔊 [Audio Devices] Saved speaker from localStorage:', savedSpeaker);
          }
        }
      } catch (e) {
        console.warn('⚠️ [Audio Devices] Could not read from localStorage:', e);
      }

      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setPermissionGranted(true);

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());

      // Get all devices
      const devices = await navigator.mediaDevices.enumerateDevices();

      const mics = devices.filter(device => device.kind === 'audioinput');
      const spks = devices.filter(device => device.kind === 'audiooutput');

      console.log('🎤 [Audio Devices] Found microphones:', mics.length);
      console.log('🔊 [Audio Devices] Found speakers:', spks.length);

      setMicrophones(mics);
      setSpeakers(spks);

      // Set defaults ONLY if no saved value exists in localStorage
      if (mics.length > 0 && !savedMicrophone) {
        console.log('🎤 [Audio Devices] No saved microphone, setting default:', mics[0].label);
        setSelectedMicrophone(mics[0].deviceId);
      } else if (savedMicrophone) {
        console.log('✅ [Audio Devices] Restoring saved microphone:', savedMicrophone);
        // Verify the stored device still exists
        const micExists = mics.some(mic => mic.deviceId === savedMicrophone);
        if (!micExists && mics.length > 0) {
          console.warn('⚠️ [Audio Devices] Saved microphone not found, setting default');
          setSelectedMicrophone(mics[0].deviceId);
        } else if (micExists) {
          // Make sure the store value is set (in case it wasn't hydrated yet)
          setSelectedMicrophone(savedMicrophone);
        }
      }

      if (spks.length > 0 && !savedSpeaker) {
        console.log('🔊 [Audio Devices] No saved speaker, setting default:', spks[0].label);
        setSelectedSpeaker(spks[0].deviceId);
      } else if (savedSpeaker) {
        console.log('✅ [Audio Devices] Restoring saved speaker:', savedSpeaker);
        // Verify the stored device still exists
        const spkExists = spks.some(spk => spk.deviceId === savedSpeaker);
        if (!spkExists && spks.length > 0) {
          console.warn('⚠️ [Audio Devices] Saved speaker not found, setting default');
          setSelectedSpeaker(spks[0].deviceId);
        } else if (spkExists) {
          // Make sure the store value is set (in case it wasn't hydrated yet)
          setSelectedSpeaker(savedSpeaker);
        }
      }
    } catch (error) {
      console.error('❌ [Audio Devices] Error accessing audio devices:', error);
      setPermissionGranted(false);
    }
  };

  // Test microphone (show audio level)
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined }
      });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setMicLevel(average);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();

      // Stop after 5 seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setMicLevel(0);
      }, 5000);
    } catch (error) {
      console.error('Error testing microphone:', error);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined }
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Test speaker with generated tone
  const testSpeaker = async () => {
    try {
      // Create a simple test tone using Web Audio API
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Create a pleasant tone (A4 note = 440 Hz)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

      // Set volume
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      // Connect nodes
      oscillator.connect(gainNode);

      // Try to set the output device if supported
      if (selectedSpeaker && 'setSinkId' in audioContext) {
        try {
          // @ts-ignore
          await audioContext.setSinkId(selectedSpeaker);
          console.log('✅ Audio output set to:', selectedSpeaker);
        } catch (err) {
          console.warn('⚠️ Could not set speaker, using default:', err);
        }
      }

      gainNode.connect(audioContext.destination);

      // Play tone
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      console.log('🔊 Playing test tone...');

      // Clean up after tone finishes
      setTimeout(() => {
        audioContext.close();
      }, 1500);

    } catch (error) {
      console.error('❌ Error testing speaker:', error);

      // Fallback: Try with simple audio element
      try {
        console.log('🔄 Trying fallback method...');
        const audio = new Audio();

        // Create a simple beep using data URL
        const beep = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTgjMGG2m98OKZSQwPU6vm8b1hGwU7kdzy0n0pBSh+zPDck0ILDV6y6OyqWhYLSpzd8rllHgUugdHy1IU1BRxqu+3jnE4NEFSr5O+9YBsCOpHX8tJ8JwYogcnw45JBCh1bsOjqr14WCkyc3fK5ZhwFLYHO8tOFNgYcarvt5JtNDg5Vq+TuqFYVCkmb3PK8aB4GMIHSv6wAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTgjMGG2m98OKZSQwPU6vm8b1hGwU7kdzy0n0pBSh+zPDck0ILDV6y6OyqWhYLSpzd8rllHgUugdHy1IU1BRxqu+3jnE4NEFSr5O+9YBsCOpHX8tJ8JwYogcnw45JBCh1bsOjqr14WCkyc3fK5ZhwFLYHO8tOFNgYcarvt5JtNDg5Vq+TuqFYVCkmb3PK8aB4GMIHSv6wAAAA=';

        audio.src = beep;

        if (selectedSpeaker && 'setSinkId' in audio) {
          // @ts-ignore
          await audio.setSinkId(selectedSpeaker);
          console.log('✅ Fallback: Audio output set');
        }

        await audio.play();
        console.log('✅ Fallback: Playing beep');

      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        alert('Could not play test audio. Please check your speaker is connected and not muted.');
      }
    }
  };

  // Export data
  const exportData = () => {
    const data = {
      progress: Object.fromEntries(useMemorizationStore.getState().progress),
      settings: useUIStore.getState(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-memorizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Import data
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Restore progress
        if (data.progress) {
          const progressMap = new Map(Object.entries(data.progress));
          useMemorizationStore.setState({ progress: progressMap as any });
        }
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your Quran memorization experience
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="audio">
              <Volume2 className="w-4 h-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="display">
              <Palette className="w-4 h-4 mr-2" />
              Display
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="data">
              <Download className="w-4 h-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6">
            {/* Permission Status */}
            {!permissionGranted && (
              <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                        Microphone Permission Required
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        To use recording features and test your microphone, please grant permission.
                      </p>
                      <Button
                        size="sm"
                        onClick={loadAudioDevices}
                        className="mt-3"
                      >
                        Grant Permission
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Microphone Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Microphone Settings
                </CardTitle>
                <CardDescription>
                  Select and test your microphone for recitation recording
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Microphone</label>
                  <select
                    value={selectedMicrophone || ''}
                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-background"
                    disabled={!permissionGranted}
                  >
                    {microphones.map((mic) => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Your selection is automatically saved and will persist across sessions
                  </p>
                </div>

                {/* Microphone Level Meter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Microphone Level</label>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-75"
                      style={{ width: `${(micLevel / 255) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={testMicrophone}
                    disabled={!permissionGranted || !selectedMicrophone}
                  >
                    Test Microphone (5s)
                  </Button>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!permissionGranted || !selectedMicrophone}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>

                {/* Recorded Audio Playback */}
                {recordedAudio && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Recording Complete
                    </div>
                    <audio controls src={recordedAudio} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Speaker Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Speaker Settings
                </CardTitle>
                <CardDescription>
                  Select your audio output device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Speaker/Headphones</label>
                  <select
                    value={selectedSpeaker || ''}
                    onChange={(e) => setSelectedSpeaker(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    {speakers.map((speaker) => (
                      <option key={speaker.deviceId} value={speaker.deviceId}>
                        {speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Your selection is automatically saved and will persist across sessions
                  </p>
                </div>

                <Button variant="outline" onClick={testSpeaker}>
                  <Play className="w-4 h-4 mr-2" />
                  Test Speaker
                </Button>
              </CardContent>
            </Card>

            {/* Reciter & Playback */}
            <Card>
              <CardHeader>
                <CardTitle>Reciter & Playback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Reciter</label>
                  <select
                    value={currentReciter}
                    onChange={(e) => setCurrentReciter(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    <option value="ar.alafasy">Mishary Rashid Alafasy</option>
                    <option value="ar.abdulbasit">Abdul Basit Abdul Samad</option>
                    <option value="ar.minshawi">Mohamed Siddiq El-Minshawi</option>
                    <option value="ar.husary">Mahmoud Khalil Al-Hussary</option>
                    <option value="ar.shaatree">Abu Bakr Al-Shatri</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Playback Speed: {playbackSpeed.toFixed(1)}x
                  </label>
                  <Slider
                    value={[playbackSpeed]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setPlaybackSpeed(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5x (Slower)</span>
                    <span>2.0x (Faster)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-4 border-2 rounded-lg capitalize transition-all ${
                        theme === t
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border hover:border-primary-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text Display</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`p-2 border rounded-lg text-xs capitalize ${
                          fontSize === size
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-border'
                        }`}
                      >
                        {size === 'extra-large' ? 'XL' : size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Tajweed Colors</span>
                    <button
                      onClick={toggleTajweed}
                      className={`w-12 h-6 rounded-full transition-all ${
                        showTajweed ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          showTajweed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Transliteration</span>
                    <button
                      onClick={toggleTransliteration}
                      className={`w-12 h-6 rounded-full transition-all ${
                        showTransliteration ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          showTransliteration ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Translation</span>
                    <button
                      onClick={toggleTranslation}
                      className={`w-12 h-6 rounded-full transition-all ${
                        showTranslation ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          showTranslation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Reminders</CardTitle>
                <CardDescription>
                  Get notified when it's time to review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable Notifications</span>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                {notificationsEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reminder Time</label>
                    <input
                      type="time"
                      value={reminderTime || '09:00'}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-background"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Export or import your memorization progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={exportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data (Backup)
                </Button>

                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('import-file')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data (Restore)
                  </Button>
                </label>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions - use with caution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (confirm('Are you sure? This will delete ALL your progress!')) {
                      resetProgress();
                      alert('All progress has been reset.');
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Progress
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Translation Language</label>
                  <select
                    value={translationLanguage}
                    onChange={(e) => setTranslationLanguage(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    <option value="en-sahih-international">English - Sahih International</option>
                    <option value="en-pickthall">English - Pickthall</option>
                    <option value="ur-jalandhry">Urdu - Jalandhry</option>
                    <option value="id-indonesian">Indonesian</option>
                    <option value="fr-hamidullah">French - Hamidullah</option>
                  </select>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <h4 className="font-semibold">App Information</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Version: 0.2.0 (Phase 2)</p>
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                    <p>Storage Used: {typeof window !== 'undefined' ? localStorage.length : 0} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
