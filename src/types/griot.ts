export type RoleType = 'griot' | 'scribe' | 'architect' | 'orator';

export interface WorkshopRole {
  id: RoleType;
  title: string;
  nameEn: string;
  shortDescription: string;
  actionInstruction: string;
  iconName: string;
}

export interface Workshop {
  id: string;
  title: string;
  subject: string;
  curriculumConnection: string;
  contextStory: string;
  handsOnChallenge: string;
  interactiveSteps: string[];
  groupQuestion: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  hints: string[];
  teacherGuideNote: string;
}

export interface PlenaryCouncil {
  title: string;
  description: string;
  finalChallengePrompt: string;
}

export interface LearningJourney {
  id: string;
  title: string;
  subtitle: string;
  culture: string;
  period: string;
  theme: string;
  icon: string;
  griotPrologue: string;
  coreQuestion: string;
  materialsNeeded: string;
  workshops: Workshop[];
  plenaryCouncil: PlenaryCouncil;
  isCustom?: boolean;
}

export interface GroupAnswer {
  selectedOption?: number;
  slateNote?: string;
  completed: boolean;
  completedAt?: number;
  hintCountUsed: number;
}

export interface ClassroomGroup {
  id: string;
  index: number;
  name: string;
  animalTotem: string;
  color: string;
  studentCount: number;
  currentWorkshopId: string;
  assignedStudentNames: {
    griot: string;
    scribe: string;
    architect: string;
    orator: string;
    members: string[];
  };
  answers: Record<string, GroupAnswer>; // workshopId -> answer
  needsHelp: boolean;
  helpNote?: string;
}

export interface ClassroomSession {
  totalStudents: number;
  groupCount: number;
  studentsPerGroup: number;
  currentRotation: number; // 0 = Classroom Briefing & Prologue, 1 = Rotation 1, 2 = Rotation 2, 3 = Rotation 3, 4 = Grand Council Plenary
  rotationDurationMinutes: number;
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  selectedJourneyId: string;
  groups: ClassroomGroup[];
}

export type ViewMode = 'landing' | 'teacher' | 'group' | 'projector' | 'print' | 'generator';
