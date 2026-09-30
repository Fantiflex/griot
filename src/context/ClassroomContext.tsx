import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClassroomGroup, ClassroomSession, GroupAnswer, LearningJourney, RoleType, ViewMode } from '../types/griot';
import { DEFAULT_JOURNEYS } from '../data/defaultJourneys';
import { playRotationCall } from '../utils/audio';

const STORAGE_KEY = 'legriot_classroom_session_v1';
const JOURNEYS_STORAGE_KEY = 'legriot_saved_journeys_v1';

const ANIMAL_TOTEMS = [
  { name: 'Groupe Lion', totem: '🦁', color: 'amber' },
  { name: 'Groupe Baobab', totem: '🌳', color: 'emerald' },
  { name: 'Groupe Fleuve', totem: '🌊', color: 'sky' },
  { name: 'Groupe Gazelle', totem: '🦌', color: 'orange' },
  { name: 'Groupe Éléphant', totem: '🐘', color: 'stone' },
  { name: 'Groupe Soleil', totem: '☀️', color: 'yellow' },
  { name: 'Groupe Sahel', totem: '🏜️', color: 'rose' },
  { name: 'Groupe Aigle', totem: '🦅', color: 'indigo' },
  { name: 'Groupe Kora', totem: '🪕', color: 'teal' },
];

function generateInitialGroups(totalStudents: number, selectedJourney: LearningJourney): ClassroomGroup[] {
  // Target 8 students per group
  const groupCount = Math.max(3, Math.round(totalStudents / 8));
  const baseStudentsPerGroup = Math.floor(totalStudents / groupCount);
  const remainder = totalStudents % groupCount;

  return Array.from({ length: groupCount }, (_, i) => {
    const totem = ANIMAL_TOTEMS[i % ANIMAL_TOTEMS.length];
    const studentCount = baseStudentsPerGroup + (i < remainder ? 1 : 0);
    const initialWorkshopIndex = i % 3;
    const initialWorkshopId = selectedJourney.workshops[initialWorkshopIndex]?.id || 'workshop-geometry';

    return {
      id: `group-${i + 1}`,
      index: i,
      name: `${totem.name} (${i + 1})`,
      animalTotem: totem.totem,
      color: totem.color,
      studentCount,
      currentWorkshopId: initialWorkshopId,
      assignedStudentNames: {
        griot: `Élève Griot ${i + 1}`,
        scribe: `Élève Scribe ${i + 1}`,
        architect: `Élève Bâtisseur ${i + 1}`,
        orator: `Élève Orateur ${i + 1}`,
        members: [`Élève 5`, `Élève 6`, `Élève 7`, `Élève 8`].slice(0, Math.max(0, studentCount - 4)),
      },
      answers: {},
      needsHelp: false,
    };
  });
}

interface ClassroomContextType {
  session: ClassroomSession;
  journeys: LearningJourney[];
  activeJourney: LearningJourney;
  viewMode: ViewMode;
  activeGroupId: string;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveGroupId: (id: string) => void;
  setTotalStudents: (count: number) => void;
  setRotationDuration: (minutes: number) => void;
  advanceRotation: () => void;
  previousRotation: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  selectJourney: (journeyId: string) => void;
  addCustomJourney: (journey: LearningJourney) => void;
  deleteJourney: (journeyId: string) => void;
  setGroupAnswer: (groupId: string, workshopId: string, answer: Partial<GroupAnswer>) => void;
  setGroupHelpNeeded: (groupId: string, needed: boolean, note?: string) => void;
  updateStudentRole: (groupId: string, role: RoleType, name: string) => void;
  getWorkshopForGroup: (groupIndex: number, rotation: number) => number;
  resetEntireClassroom: () => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved journeys
  const [journeys, setJourneys] = useState<LearningJourney[]>(() => {
    try {
      const saved = localStorage.getItem(JOURNEYS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load journeys from localStorage:', e);
    }
    return DEFAULT_JOURNEYS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [activeGroupId, setActiveGroupId] = useState<string>('group-1');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Load or initialize classroom session
  const [session, setSession] = useState<ClassroomSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load session from localStorage:', e);
    }

    const defaultJourney = DEFAULT_JOURNEYS[0];
    const initialStudents = 56;
    const initialGroups = generateInitialGroups(initialStudents, defaultJourney);

    return {
      totalStudents: initialStudents,
      groupCount: initialGroups.length,
      studentsPerGroup: 8,
      currentRotation: 1, // Start on Rotation 1 so groups immediately have interactive content
      rotationDurationMinutes: 35,
      timerSecondsRemaining: 35 * 60,
      isTimerRunning: false,
      selectedJourneyId: defaultJourney.id,
      groups: initialGroups,
    };
  });

  const activeJourney = journeys.find(j => j.id === session.selectedJourneyId) || journeys[0] || DEFAULT_JOURNEYS[0];

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [session]);

  useEffect(() => {
    try {
      localStorage.setItem(JOURNEYS_STORAGE_KEY, JSON.stringify(journeys));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [journeys]);

  // Master Timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session.isTimerRunning && session.timerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSession(prev => {
          if (prev.timerSecondsRemaining <= 1) {
            playRotationCall();
            return {
              ...prev,
              timerSecondsRemaining: 0,
              isTimerRunning: false,
            };
          }
          return {
            ...prev,
            timerSecondsRemaining: prev.timerSecondsRemaining - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.isTimerRunning, session.timerSecondsRemaining]);

  // Helper: which workshop index (0, 1, 2) is a group in for a given rotation?
  const getWorkshopForGroup = useCallback((groupIndex: number, rotation: number): number => {
    if (rotation <= 0) return 0;
    if (rotation > 3) return 0; // Plenary
    // Rotation 1: group 0 -> w0, group 1 -> w1, group 2 -> w2, group 3 -> w0...
    // Rotation 2: group 0 -> w1, group 1 -> w2, group 2 -> w0...
    // Rotation 3: group 0 -> w2, group 1 -> w0, group 2 -> w1...
    return (groupIndex + (rotation - 1)) % 3;
  }, []);

  const updateGroupsForRotation = useCallback((groups: ClassroomGroup[], rotation: number, journey: LearningJourney) => {
    return groups.map(g => {
      const workshopIdx = getWorkshopForGroup(g.index, rotation);
      const targetWorkshop = journey.workshops[workshopIdx] || journey.workshops[0];
      return {
        ...g,
        currentWorkshopId: targetWorkshop.id,
      };
    });
  }, [getWorkshopForGroup]);

  const advanceRotation = useCallback(() => {
    playRotationCall();
    setSession(prev => {
      const nextRotation = Math.min(4, prev.currentRotation + 1);
      const updatedGroups = updateGroupsForRotation(prev.groups, nextRotation, activeJourney);
      return {
        ...prev,
        currentRotation: nextRotation,
        timerSecondsRemaining: prev.rotationDurationMinutes * 60,
        isTimerRunning: nextRotation <= 3, // auto-start on rotation transition
        groups: updatedGroups,
      };
    });
  }, [updateGroupsForRotation, activeJourney]);

  const previousRotation = useCallback(() => {
    setSession(prev => {
      const prevRotation = Math.max(0, prev.currentRotation - 1);
      const updatedGroups = updateGroupsForRotation(prev.groups, prevRotation, activeJourney);
      return {
        ...prev,
        currentRotation: prevRotation,
        timerSecondsRemaining: prev.rotationDurationMinutes * 60,
        isTimerRunning: false,
        groups: updatedGroups,
      };
    });
  }, [updateGroupsForRotation, activeJourney]);

  const toggleTimer = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isTimerRunning: !prev.isTimerRunning,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setSession(prev => ({
      ...prev,
      timerSecondsRemaining: prev.rotationDurationMinutes * 60,
      isTimerRunning: false,
    }));
  }, []);

  const setTotalStudents = useCallback((count: number) => {
    const validCount = Math.max(16, Math.min(100, count));
    setSession(prev => {
      const newGroups = generateInitialGroups(validCount, activeJourney);
      const updatedGroups = updateGroupsForRotation(newGroups, prev.currentRotation, activeJourney);
      return {
        ...prev,
        totalStudents: validCount,
        groupCount: newGroups.length,
        studentsPerGroup: Math.round(validCount / newGroups.length),
        groups: updatedGroups,
      };
    });
  }, [activeJourney, updateGroupsForRotation]);

  const setRotationDuration = useCallback((minutes: number) => {
    const validMinutes = Math.max(10, Math.min(90, minutes));
    setSession(prev => ({
      ...prev,
      rotationDurationMinutes: validMinutes,
      timerSecondsRemaining: validMinutes * 60,
      isTimerRunning: false,
    }));
  }, []);

  const selectJourney = useCallback((journeyId: string) => {
    const chosen = journeys.find(j => j.id === journeyId);
    if (!chosen) return;

    setSession(prev => {
      const updatedGroups = updateGroupsForRotation(prev.groups, prev.currentRotation, chosen);
      return {
        ...prev,
        selectedJourneyId: journeyId,
        groups: updatedGroups,
      };
    });
  }, [journeys, updateGroupsForRotation]);

  const addCustomJourney = useCallback((newJourney: LearningJourney) => {
    setJourneys(prev => [newJourney, ...prev]);
    selectJourney(newJourney.id);
  }, [selectJourney]);

  const deleteJourney = useCallback((journeyId: string) => {
    setJourneys(prev => {
      const filtered = prev.filter(j => j.id !== journeyId);
      return filtered.length > 0 ? filtered : DEFAULT_JOURNEYS;
    });
    if (session.selectedJourneyId === journeyId) {
      selectJourney(DEFAULT_JOURNEYS[0].id);
    }
  }, [session.selectedJourneyId, selectJourney]);

  const setGroupAnswer = useCallback((groupId: string, workshopId: string, answer: Partial<GroupAnswer>) => {
    setSession(prev => {
      const updated = prev.groups.map(g => {
        if (g.id !== groupId) return g;
        const currentAns = g.answers[workshopId] || { completed: false, hintCountUsed: 0 };
        return {
          ...g,
          answers: {
            ...g.answers,
            [workshopId]: {
              ...currentAns,
              ...answer,
              completed: answer.selectedOption !== undefined || answer.slateNote !== undefined || currentAns.completed,
              completedAt: Date.now(),
            },
          },
        };
      });
      return { ...prev, groups: updated };
    });
  }, []);

  const setGroupHelpNeeded = useCallback((groupId: string, needed: boolean, note?: string) => {
    setSession(prev => {
      const updated = prev.groups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          needsHelp: needed,
          helpNote: note,
        };
      });
      return { ...prev, groups: updated };
    });
  }, []);

  const updateStudentRole = useCallback((groupId: string, role: RoleType, name: string) => {
    setSession(prev => {
      const updated = prev.groups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          assignedStudentNames: {
            ...g.assignedStudentNames,
            [role]: name,
          },
        };
      });
      return { ...prev, groups: updated };
    });
  }, []);

  const resetEntireClassroom = useCallback(() => {
    const defaultJourney = journeys[0] || DEFAULT_JOURNEYS[0];
    const initialGroups = generateInitialGroups(session.totalStudents, defaultJourney);
    setSession({
      totalStudents: session.totalStudents,
      groupCount: initialGroups.length,
      studentsPerGroup: 8,
      currentRotation: 1,
      rotationDurationMinutes: 35,
      timerSecondsRemaining: 35 * 60,
      isTimerRunning: false,
      selectedJourneyId: defaultJourney.id,
      groups: initialGroups,
    });
  }, [journeys, session.totalStudents]);

  return (
    <ClassroomContext.Provider
      value={{
        session,
        journeys,
        activeJourney,
        viewMode,
        activeGroupId,
        isDemoModalOpen,
        setIsDemoModalOpen,
        setViewMode,
        setActiveGroupId,
        setTotalStudents,
        setRotationDuration,
        advanceRotation,
        previousRotation,
        toggleTimer,
        resetTimer,
        selectJourney,
        addCustomJourney,
        deleteJourney,
        setGroupAnswer,
        setGroupHelpNeeded,
        updateStudentRole,
        getWorkshopForGroup,
        resetEntireClassroom,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};
