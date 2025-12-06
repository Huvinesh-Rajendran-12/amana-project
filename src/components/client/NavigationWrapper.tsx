'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/server/Navigation';

export default function NavigationWrapper() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <Navigation scrolled={scrolled} />;
}

