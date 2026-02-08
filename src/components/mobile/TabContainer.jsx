import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * TabContainer preserves state and scroll position for mobile tabs
 * Keeps all tabs mounted but hidden to preserve navigation stack
 */
export default function TabContainer({ tabs, currentTab, onTabChange }) {
  const tabRefs = useRef({});
  const scrollPositions = useRef({});

  useEffect(() => {
    // Save scroll position when switching tabs
    if (currentTab) {
      const currentEl = tabRefs.current[currentTab];
      if (currentEl) {
        scrollPositions.current[currentTab] = currentEl.scrollTop;
      }
    }
  }, [currentTab]);

  useEffect(() => {
    // Restore scroll position after tab change
    const timer = setTimeout(() => {
      if (currentTab && tabRefs.current[currentTab]) {
        const savedPosition = scrollPositions.current[currentTab] || 0;
        tabRefs.current[currentTab].scrollTop = savedPosition;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentTab]);

  return (
    <div className="relative h-full w-full">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          ref={(el) => (tabRefs.current[tab.id] = el)}
          className={cn(
            "absolute inset-0 overflow-y-auto",
            currentTab === tab.id ? "block" : "hidden"
          )}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}