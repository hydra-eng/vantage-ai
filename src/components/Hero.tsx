import React from 'react';
import { CanvasHero, CanvasHeroProps } from './CanvasHero';

export const Hero: React.FC<CanvasHeroProps> = (props) => {
  return <CanvasHero {...props} />;
};

export default Hero;
