/**
 * Composant AudioSettings - Panneau de paramètres audio complet
 */

import * as React from 'react';
import { VolumeSlider } from './VolumeSlider';
import { audioEngine } from '@/audio/AudioEngine';
import type { VolumeSettings } from '@/audio/types';
import { cn } from '@/lib/utils';
import { Music, Volume2, Mic2 } from 'lucide-react';

interface AudioSettingsProps {
  className?: string;
  compact?: boolean;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  className,
  compact = false,
}) => {
  const [settings, setSettings] = React.useState<VolumeSettings>({
    master: 0.6,
    music: 0.8,
    sfx: 0.6,
    voice: 1.0,
    muted: false,
  });

  const [isExpanded, setIsExpanded] = React.useState(!compact);

  React.useEffect(() => {
    // Charger les paramètres initiaux
    const initialSettings = audioEngine.getVolumeSettings();
    setSettings(initialSettings);

    // S'abonner aux changements
    audioEngine.setOnVolumeChange((newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      audioEngine.setOnVolumeChange(null);
    };
  }, []);

  const handleMasterChange = (value: number) => {
    audioEngine.setMasterVolume(value);
  };

  const handleCategoryChange = (category: 'music' | 'sfx' | 'voice', value: number) => {
    audioEngine.setCategoryVolume(category, value);
  };

  const handleMutedChange = (muted: boolean) => {
    audioEngine.setMuted(muted);
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md",
          "bg-secondary/50 hover:bg-secondary transition-colors",
          "text-sm"
        )}
      >
        <Volume2 className="w-4 h-4" />
        <span>Audio</span>
        {settings.muted && (
          <span className="text-[10px] text-muted-foreground">(muet)</span>
        )}
      </button>
    );
  }

  return (
    <div className={cn(
      "bg-card border rounded-lg p-4 space-y-4",
      compact && "absolute z-50 shadow-lg",
      className
    )}>
      {compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Paramètres audio</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Volume Master */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Volume général
          </label>
        </div>
        <VolumeSlider
          value={settings.master}
          onChange={handleMasterChange}
          onMutedChange={handleMutedChange}
          muted={settings.muted}
          showPresets={true}
        />
      </div>

      {/* Séparateur */}
      <div className="h-px bg-border" />

      {/* Volumes par catégorie */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Volumes par catégorie
        </h4>

        {/* Musique */}
        <div className="space-y-1">
          <label className="text-xs flex items-center gap-1.5 text-muted-foreground">
            <Music className="w-3 h-3" />
            Musique
          </label>
          <VolumeSlider
            value={settings.music}
            onChange={(value) => handleCategoryChange('music', value)}
            muted={settings.muted}
            showPresets={false}
          />
        </div>

        {/* Effets sonores */}
        <div className="space-y-1">
          <label className="text-xs flex items-center gap-1.5 text-muted-foreground">
            <Volume2 className="w-3 h-3" />
            Effets sonores
          </label>
          <VolumeSlider
            value={settings.sfx}
            onChange={(value) => handleCategoryChange('sfx', value)}
            muted={settings.muted}
            showPresets={false}
          />
        </div>

        {/* Voix */}
        <div className="space-y-1">
          <label className="text-xs flex items-center gap-1.5 text-muted-foreground">
            <Mic2 className="w-3 h-3" />
            Voix / Narration
          </label>
          <VolumeSlider
            value={settings.voice}
            onChange={(value) => handleCategoryChange('voice', value)}
            muted={settings.muted}
            showPresets={false}
          />
        </div>
      </div>

      {/* Info */}
      <div className="text-[10px] text-muted-foreground bg-secondary/30 rounded p-2">
        <p>Le volume est automatiquement ajusté pour rester dans une plage audible et agréable (30-80%).</p>
      </div>
    </div>
  );
};
