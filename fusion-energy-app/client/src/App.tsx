import { useState } from 'react';
import { LanguageContext } from './lib/i18n';
import type { Language } from './types';
import Navigation from './components/layout/Navigation';
import ScrollProgress from './components/layout/ScrollProgress';
import LanguageToggle from './components/layout/LanguageToggle';
import HeroSection from './components/sections/HeroSection';
import IndustryMap from './components/sections/IndustryMap';
import FusionExplainer from './components/sections/FusionExplainer';
import CostReality from './components/sections/CostReality';
import FutureOutlook from './components/sections/FutureOutlook';

export default function App() {
  const [lang, setLang] = useState<Language>('zh');

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <div className="relative">
        <ScrollProgress />
        <Navigation />
        <LanguageToggle />

        <main>
          <HeroSection />
          <IndustryMap />
          <FusionExplainer />
          <CostReality />
          <FutureOutlook />
        </main>
      </div>
    </LanguageContext.Provider>
  );
}
