import React from 'react';
import { Sun, Target, CloudRain, Coffee, Heart, Frown } from 'lucide-react';
import { MoodTag } from '../types';

interface MoodIconProps {
  mood: MoodTag;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className = 'w-4 h-4' }) => {
  switch (mood) {
    case 'Happy':
      return <Sun className={className} />;
    case 'Productive':
      return <Target className={className} />;
    case 'Stressed':
      return <CloudRain className={className} />;
    case 'Chill':
      return <Coffee className={className} />;
    case 'Grateful':
      return <Heart className={className} />;
    case 'Sad':
      return <Frown className={className} />;
  }
};
