import { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';

type Technique = {
  name: string;
  description: string;
  steps: { label: string; duration: number; color: string }[];
  emoji: string;
};

const techniques: Technique[] = [
  {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs to stay calm under pressure',
    emoji: '🟦',
    steps: [
      { label: 'Breathe In', duration: 4, color: 'hsl(var(--primary))' },
      { label: 'Hold', duration: 4, color: 'hsl(var(--accent))' },
      { label: 'Breathe Out', duration: 4, color: 'hsl(var(--secondary))' },
      { label: 'Hold', duration: 4, color: 'hsl(var(--muted))' },
    ],
  },
  {
    name: '4-7-8 Relaxing',
    description: 'A natural tranquilizer for the nervous system',
    emoji: '🌙',
    steps: [
      { label: 'Breathe In', duration: 4, color: 'hsl(var(--primary))' },
      { label: 'Hold', duration: 7, color: 'hsl(var(--accent))' },
      { label: 'Breathe Out', duration: 8, color: 'hsl(var(--secondary))' },
    ],
  },
  {
    name: 'Calm Breath',
    description: 'Simple deep breathing for instant relaxation',
    emoji: '🍃',
    steps: [
      { label: 'Breathe In', duration: 5, color: 'hsl(var(--primary))' },
      { label: 'Breathe Out', duration: 5, color: 'hsl(var(--secondary))' },
    ],
  },
];

const Breathe = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>(techniques[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [scale, setScale] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStepRef = useRef(0);

  const { startAmbient, stopAmbient, playChime } = useBreathingAudio({ volume: soundEnabled ? soundVolume : 0 });

  const totalStepDuration = selectedTechnique.steps[currentStep]?.duration || 1;

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(selectedTechnique.steps[currentStep].duration);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next step
          setCurrentStep(s => {
            const next = s + 1;
            if (next >= selectedTechnique.steps.length) {
              setCycles(c => c + 1);
              return 0;
            }
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, currentStep, selectedTechnique]);

  // Animate the breathing circle + play chime on step change
  useEffect(() => {
    if (!isActive) {
      setScale(1);
      return;
    }
    const step = selectedTechnique.steps[currentStep];
    if (step.label === 'Breathe In') {
      setScale(1.5);
    } else if (step.label === 'Breathe Out') {
      setScale(0.8);
    }
    // Play chime on each step transition
    if (prevStepRef.current !== currentStep || currentStep === 0) {
      playChime();
      prevStepRef.current = currentStep;
    }
  }, [currentStep, isActive, selectedTechnique, playChime]);

  const start = () => {
    setIsActive(true);
    setCurrentStep(0);
    setCycles(0);
    setTimeLeft(selectedTechnique.steps[0].duration);
    startAmbient();
  };

  const togglePause = () => setIsActive(prev => !prev);

  const reset = () => {
    setIsActive(false);
    setCurrentStep(0);
    setCycles(0);
    setTimeLeft(0);
    setScale(1);
    stopAmbient();
  };

  const selectTechnique = (t: Technique) => {
    reset();
    setSelectedTechnique(t);
  };

  const currentStepData = selectedTechnique.steps[currentStep];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Breathing <span className="text-gradient-primary">Exercises</span>
          </h1>
          <p className="text-muted-foreground">Calm your mind with guided breathing techniques</p>
        </div>

        {/* Sound controls */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <Label htmlFor="sound-toggle" className="text-sm flex items-center gap-1.5">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound
              </Label>
            </div>
            {soundEnabled && (
              <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-[240px]">
                <span className="text-xs text-muted-foreground">Vol</span>
                <Slider
                  value={[soundVolume * 100]}
                  onValueChange={([v]) => setSoundVolume(v / 100)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Technique selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {techniques.map(t => (
            <Card
              key={t.name}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${
                selectedTechnique.name === t.name
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-secondary/50'
              }`}
              onClick={() => selectTechnique(t)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>{t.emoji}</span> {t.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className="text-xs">{t.description}</CardDescription>
                <div className="flex gap-1 mt-2">
                  {t.steps.map((s, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {s.label} {s.duration}s
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Breathing circle */}
        <Card className="overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            {/* Animated circle */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Outer glow ring */}
              <div
                className="absolute w-56 h-56 rounded-full opacity-20 transition-transform"
                style={{
                  background: `radial-gradient(circle, ${currentStepData?.color || 'hsl(var(--primary))'}, transparent)`,
                  transform: `scale(${scale * 1.2})`,
                  transitionDuration: `${totalStepDuration}s`,
                  transitionTimingFunction: 'ease-in-out',
                }}
              />
              {/* Main circle */}
              <div
                className="w-44 h-44 rounded-full flex items-center justify-center transition-transform border-4"
                style={{
                  transform: `scale(${scale})`,
                  transitionDuration: `${totalStepDuration}s`,
                  transitionTimingFunction: 'ease-in-out',
                  borderColor: currentStepData?.color || 'hsl(var(--primary))',
                  background: `${currentStepData?.color || 'hsl(var(--primary))'}15`,
                }}
              >
                <div className="text-center">
                  {isActive ? (
                    <>
                      <p className="text-lg font-semibold text-foreground">{currentStepData?.label}</p>
                      <p className="text-4xl font-bold text-primary mt-1">{timeLeft}</p>
                    </>
                  ) : cycles > 0 ? (
                    <>
                      <p className="text-lg font-semibold text-foreground">Done!</p>
                      <p className="text-sm text-muted-foreground mt-1">{cycles} cycles</p>
                    </>
                  ) : (
                    <>
                      <Wind className="w-8 h-8 text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Ready?</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Step indicators */}
            {isActive && (
              <div className="flex gap-2 mb-6">
                {selectedTechnique.steps.map((s, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-8 bg-primary' : 'w-4 bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!isActive && cycles === 0 && (
                <Button onClick={start} size="lg">
                  <Play className="w-4 h-4 mr-2" /> Start
                </Button>
              )}
              {isActive && (
                <Button onClick={togglePause} variant="outline" size="lg">
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </Button>
              )}
              {!isActive && cycles > 0 && (
                <Button onClick={start} size="lg">
                  <Play className="w-4 h-4 mr-2" /> Resume
                </Button>
              )}
              {(isActive || cycles > 0) && (
                <Button onClick={reset} variant="secondary" size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              )}
            </div>

            {cycles > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Completed <span className="font-semibold text-primary">{cycles}</span> {cycles === 1 ? 'cycle' : 'cycles'} 🌟
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Breathe;
