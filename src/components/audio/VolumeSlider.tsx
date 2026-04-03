/**
 * Composant VolumeSlider - Contrôle de volume avec slider Radix UI
 */

import * as React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VOLUME_PRESETS, MASTER_GAIN_MIN, MASTER_GAIN_MAX } from '@/audio/constants';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  onMutedChange?: (muted: boolean) => void;
  muted?: boolean;
  className?: string;
  showPresets?: boolean;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onChange,
  onMutedChange,
  muted = false,
  className,
  showPresets = true,
}) => {
  // Convertir le gain (0-1) en pourcentage (0-100) pour l'UI
  const percentage = Math.round(value * 100);

  const handleValueChange = (values: number[]) => {
    if (values.length > 0) {
      const newValue = values[0] / 100;
      // Clamping aux valeurs saines
      const clampedValue = Math.max(MASTER_GAIN_MIN, Math.min(MASTER_GAIN_MAX, newValue));
      onChange(clampedValue);
    }
  };

  const handleMuteToggle = () => {
    onMutedChange?.(!muted);
  };

  const applyPreset = (presetValue: number) => {
    onChange(presetValue);
  };

  const getVolumeIcon = () => {
    if (muted || value === 0) return <VolumeX className="w-5 h-5" />;
    if (value < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <button
          onClick={handleMuteToggle}
          className={cn(
            "p-2 rounded-full transition-colors duration-200",
            "hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30",
            muted && "text-muted-foreground"
          )}
          aria-label={muted ? "Activer le son" : "Couper le son"}
        >
          {getVolumeIcon()}
        </button>

        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[percentage]}
          onValueChange={handleValueChange}
          max={100}
          step={1}
          disabled={muted}
          aria-label="Volume"
        >
          <Slider.Track className="bg-secondary relative grow rounded-full h-[3px]">
            <Slider.Range className="absolute bg-primary rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className={cn(
              "block w-4 h-4 bg-primary rounded-full shadow-sm",
              "hover:scale-110 transition-transform duration-150",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              muted && "bg-muted-foreground cursor-not-allowed"
            )}
          />
        </Slider.Root>

        <span className="text-xs font-mono w-10 text-right tabular-nums">
          {muted ? 'OFF' : `${percentage}%`}
        </span>
      </div>

      {showPresets && (
        <div className="flex items-center gap-2 ml-10">
          <span className="text-xs text-muted-foreground">Préréglages:</span>
          <div className="flex gap-1">
            {Object.entries(VOLUME_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(preset.master)}
                className={cn(
                  "px-2 py-1 text-[10px] rounded-sm transition-colors",
                  "hover:bg-primary/10 focus:outline-none",
                  value === preset.master && !muted && "bg-primary/20 text-primary font-medium"
                )}
                disabled={muted}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
