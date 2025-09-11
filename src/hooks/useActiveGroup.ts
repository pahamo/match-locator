import { useEffect, useState, useRef, MutableRefObject } from 'react';

interface GroupData {
  date: string;
  time: string;
}

interface UseActiveGroupReturn {
  activeGroup: GroupData | null;
  groupRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}

export const useActiveGroup = (groups: { date: string; time: string }[]): UseActiveGroupReturn => {
  const [activeGroup, setActiveGroup] = useState<GroupData | null>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (groups.length === 0) return;

    // Initialize refs array
    groupRefs.current = groupRefs.current.slice(0, groups.length);

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        // Find the entry that is most visible at the top
        let mostVisibleEntry: IntersectionObserverEntry | undefined;
        let maxRatio = 0;

        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            mostVisibleEntry = entry;
            maxRatio = entry.intersectionRatio;
          }
        }

        if (mostVisibleEntry) {
          const target = mostVisibleEntry.target as HTMLDivElement;
          const index = groupRefs.current.indexOf(target);
          if (index >= 0 && index < groups.length && groups[index]) {
            setActiveGroup(groups[index]);
          }
        }
      },
      {
        threshold: [0, 0.1, 0.5, 1.0],
        rootMargin: '-20px 0px -80% 0px' // Trigger when element is near the top
      }
    );

    // Observe all group elements
    groupRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    // Set initial active group
    if (groups[0]) {
      setActiveGroup(groups[0]);
    }

    return () => {
      observer.disconnect();
    };
  }, [groups]);

  return { activeGroup, groupRefs };
};