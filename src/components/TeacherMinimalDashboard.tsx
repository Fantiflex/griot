import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  X,
  Plus,
  ArrowRightLeft,
  Check,
  Volume2,
  BookOpen,
  Filter,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { playRotationCall } from '../utils/audio';
import { NdopBadgeMotif } from './NdopMotifSvg';

export interface StudentRecord {
  id: string;
  name: string;
  tableId: number;
  tableName: string;
  avatarInitials: string;
  masteredSkills: string[];
  flaggedDifficulties: string[];
  status: 'on_track' | 'needs_guidance' | 'advanced';
  teacherNotes: string;
  recentExerciseScore: number;
}

export interface TablePod {
  id: number;
  name: string;
  exercise: string;
  topic: string;
  status: 'active' | 'verified' | 'help';
  timeSpent: string;
  accuracyScore: number;
  snapshotStatus: 'pending' | 'verified';
}

// 10 Curriculum Workshops linked to genuine African cultural & scientific applications
const WORKSHOPS: { id: number; name: string; exercise: string; topic: string; remedialFor: string[] }[] = [
  { id: 1, name: 'Table 1', exercise: 'Market Fractions & Barter Math', topic: 'Arithmetic & Fractions', remedialFor: ['Fractions', 'Division', 'Unit ratios'] },
  { id: 2, name: 'Table 2', exercise: 'Bamum Polygon Geometry', topic: 'Angles & Polygons', remedialFor: ['Interior angle sum', 'Polygon symmetry', 'Octagons'] },
  { id: 3, name: 'Table 3', exercise: 'Round Hut Architecture', topic: 'Circumference & Pi (π)', remedialFor: ['Pi ratio calculation (π)', 'Radius vs diameter', 'Circle circumference'] },
  { id: 4, name: 'Table 4', exercise: 'Ndop Sacred Cloth Geometry', topic: 'Parallel Lines & Rhombus', remedialFor: ['Parallel lines (//)', 'Rhombus angle construction', 'Axial symmetry'] },
  { id: 5, name: 'Table 5', exercise: 'Water Well Hydrology', topic: 'Cylinder Volume & Liters', remedialFor: ['Cubic units conversion', 'Cylinder volume', 'Base area x height'] },
  { id: 6, name: 'Table 6', exercise: 'Granary Grain Ratios', topic: 'Direct Proportions', remedialFor: ['Direct proportions', 'Ratios', 'Storage capacity'] },
  { id: 7, name: 'Table 7', exercise: 'Sundial Shadow Trigonometry', topic: 'Solar Angles & Tangents', remedialFor: ['Tangent ratio', 'Shadow trigonometry', 'Angle of elevation'] },
  { id: 8, name: 'Table 8', exercise: 'Kente Loom Transformations', topic: 'Reflection & Translation', remedialFor: ['Reflection matrices', 'Translation vectors', 'Bilateral symmetry'] },
  { id: 9, name: 'Table 9', exercise: 'Agricultural Land Partition', topic: 'Polygon Decomposition', remedialFor: ['Irregular quadrilateral area', 'Triangle decomposition', 'Land surveying'] },
  { id: 10, name: 'Table 10', exercise: 'River Crossing Triangulation', topic: 'Sine Law & Distance', remedialFor: ['Triangulation', 'Sine law', 'Distance measurement'] },
];

// Initial Full Class Roster: 80 Real Students (8 per table across 10 tables)
const INITIAL_STUDENTS: StudentRecord[] = [
  // Table 1 (Market Fractions)
  { id: 's-1-1', name: 'Kwame Mensah', tableId: 1, tableName: 'Table 1', avatarInitials: 'KM', masteredSkills: ['Fractions', 'Proportions'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good team communicator in barter trade.', recentExerciseScore: 88 },
  { id: 's-1-2', name: 'Amara Diop', tableId: 1, tableName: 'Table 1', avatarInitials: 'AD', masteredSkills: ['Mental Math', 'Division'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Calculates fraction splits instantly.', recentExerciseScore: 96 },
  { id: 's-1-3', name: 'Kofi Annan', tableId: 1, tableName: 'Table 1', avatarInitials: 'KA', masteredSkills: ['Basic Addition'], flaggedDifficulties: ['Equivalent fractions'], status: 'needs_guidance', teacherNotes: 'Confuses common denominators when dividing bags of millet.', recentExerciseScore: 68 },
  { id: 's-1-4', name: 'Fatou Sow', tableId: 1, tableName: 'Table 1', avatarInitials: 'FS', masteredSkills: ['Fractions', 'Barter ratios'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Careful with measurement units.', recentExerciseScore: 84 },
  { id: 's-1-5', name: 'Tariq Al-Mansur', tableId: 1, tableName: 'Table 1', avatarInitials: 'TA', masteredSkills: ['Ratios'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Solid work.', recentExerciseScore: 82 },
  { id: 's-1-6', name: 'Zainab Touré', tableId: 1, tableName: 'Table 1', avatarInitials: 'ZT', masteredSkills: ['Fractions', 'Percentages'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Helps peers at table.', recentExerciseScore: 89 },
  { id: 's-1-7', name: 'Lamin Jatta', tableId: 1, tableName: 'Table 1', avatarInitials: 'LJ', masteredSkills: ['Division'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Steady pace on paper.', recentExerciseScore: 81 },
  { id: 's-1-8', name: 'Mariam Camara', tableId: 1, tableName: 'Table 1', avatarInitials: 'MC', masteredSkills: ['Fractions'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good focus.', recentExerciseScore: 85 },

  // Table 2 (Bamum Polygon Geometry)
  { id: 's-2-1', name: 'Kouassi Konan', tableId: 2, tableName: 'Table 2', avatarInitials: 'KK', masteredSkills: ['Acute & Obtuse Angles'], flaggedDifficulties: ['Polygon angle sum'], status: 'needs_guidance', teacherNotes: 'Needs hands-on triangle decomposition for octagons.', recentExerciseScore: 71 },
  { id: 's-2-2', name: 'Aïssata Diallo', tableId: 2, tableName: 'Table 2', avatarInitials: 'AD', masteredSkills: ['Internal angles', 'Protractor use'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Accurate protractor measurements.', recentExerciseScore: 90 },
  { id: 's-2-3', name: 'Thabo Mbeki', tableId: 2, tableName: 'Table 2', avatarInitials: 'TM', masteredSkills: ['Polygon edges'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Constructs 6-sided polygons well.', recentExerciseScore: 87 },
  { id: 's-2-4', name: 'Nia Ndlovu', tableId: 2, tableName: 'Table 2', avatarInitials: 'NN', masteredSkills: ['Right angles', 'Square symmetry'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Constructed 8-sided polygon cleanly.', recentExerciseScore: 98 },
  { id: 's-2-5', name: 'Ousmane Cissé', tableId: 2, tableName: 'Table 2', avatarInitials: 'OC', masteredSkills: ['Angle types'], flaggedDifficulties: ['Polygon angle sum'], status: 'needs_guidance', teacherNotes: 'Struggles with (n-2)x180 formula.', recentExerciseScore: 70 },
  { id: 's-2-6', name: 'Blessing Adeyemi', tableId: 2, tableName: 'Table 2', avatarInitials: 'BA', masteredSkills: ['Toghu motifs', 'Symmetry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good team presenter.', recentExerciseScore: 86 },
  { id: 's-2-7', name: 'Moussa Fofana', tableId: 2, tableName: 'Table 2', avatarInitials: 'MF', masteredSkills: ['Angle measurement'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Steady pace.', recentExerciseScore: 84 },
  { id: 's-2-8', name: 'Esi Boateng', tableId: 2, tableName: 'Table 2', avatarInitials: 'EB', masteredSkills: ['Geometric angles'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Careful with paper tools.', recentExerciseScore: 89 },

  // Table 3 (Round Hut Architecture - Circumference & Pi)
  { id: 's-3-1', name: 'Chidi Obi', tableId: 3, tableName: 'Table 3', avatarInitials: 'CO', masteredSkills: ['Diameter measurement'], flaggedDifficulties: ['Pi ratio calculation (π)'], status: 'needs_guidance', teacherNotes: 'Asked teacher for clarification on C = 2πr.', recentExerciseScore: 68 },
  { id: 's-3-2', name: 'Halima Bello', tableId: 3, tableName: 'Table 3', avatarInitials: 'HB', masteredSkills: ['Circle radius'], flaggedDifficulties: ['Radius vs diameter'], status: 'needs_guidance', teacherNotes: 'Mixed up diameter and radius on thatched roof.', recentExerciseScore: 70 },
  { id: 's-3-3', name: 'Sekou Keita', tableId: 3, tableName: 'Table 3', avatarInitials: 'SK', masteredSkills: ['Physical string measurement'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Great hands-on measurement using string.', recentExerciseScore: 85 },
  { id: 's-3-4', name: 'Adanna Nwosu', tableId: 3, tableName: 'Table 3', avatarInitials: 'AN', masteredSkills: ['Applied circumference'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Solved circular hut perimeter.', recentExerciseScore: 92 },
  { id: 's-3-5', name: 'Bakary Sissoko', tableId: 3, tableName: 'Table 3', avatarInitials: 'BS', masteredSkills: ['Rounds & perimeters'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Active discussion contributor.', recentExerciseScore: 84 },
  { id: 's-3-6', name: 'Aminata Sanogo', tableId: 3, tableName: 'Table 3', avatarInitials: 'AS', masteredSkills: ['Circle properties'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands circle divisions.', recentExerciseScore: 80 },
  { id: 's-3-7', name: 'Femi Alabi', tableId: 3, tableName: 'Table 3', avatarInitials: 'FA', masteredSkills: ['Perimeter math'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good team scribe.', recentExerciseScore: 87 },
  { id: 's-3-8', name: 'Tendai Moyo', tableId: 3, tableName: 'Table 3', avatarInitials: 'TM', masteredSkills: ['Circle geometry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Steady progress.', recentExerciseScore: 82 },

  // Table 4 (Ndop Sacred Cloth - Parallel Lines & Rhombus)
  { id: 's-4-1', name: 'Chinwe Eze', tableId: 4, tableName: 'Table 4', avatarInitials: 'CE', masteredSkills: ['Parallel lines (//)', 'Rhombus angles', 'Axial symmetry'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Led group drawing of royal Ndop pattern.', recentExerciseScore: 99 },
  { id: 's-4-2', name: 'Mamadou Kane', tableId: 4, tableName: 'Table 4', avatarInitials: 'MK', masteredSkills: ['Parallel line distance (d)', 'Ndop symbolics'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands equal spacing rule.', recentExerciseScore: 96 },
  { id: 's-4-3', name: 'Grace Mutua', tableId: 4, tableName: 'Table 4', avatarInitials: 'GM', masteredSkills: ['Rhombus 4 sides congruent'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Accurate ruler measurements.', recentExerciseScore: 95 },
  { id: 's-4-4', name: 'Jean-Paul Biya', tableId: 4, tableName: 'Table 4', avatarInitials: 'JP', masteredSkills: ['Perpendicular lines (⊥)', 'Symmetry axis'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Identified vertical reflection axis.', recentExerciseScore: 94 },
  { id: 's-4-5', name: 'Nadia Cherif', tableId: 4, tableName: 'Table 4', avatarInitials: 'NC', masteredSkills: ['Euclidean axioms', 'Ndop motif analysis'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Explaining concepts clearly to table peers.', recentExerciseScore: 98 },
  { id: 's-4-6', name: 'Abel Tesfaye', tableId: 4, tableName: 'Table 4', avatarInitials: 'AT', masteredSkills: ['Line geometry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Reliable participant.', recentExerciseScore: 91 },
  { id: 's-4-7', name: 'Ramatoulaye Ndiaye', tableId: 4, tableName: 'Table 4', avatarInitials: 'RN', masteredSkills: ['Axial mirror symmetry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Drew leopard diamond balanced.', recentExerciseScore: 93 },
  { id: 's-4-8', name: 'Kagiso Dlamini', tableId: 4, tableName: 'Table 4', avatarInitials: 'KD', masteredSkills: ['Parallel rails'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Passed 1s snapshot validation.', recentExerciseScore: 92 },

  // Table 5 (Water Well Hydrology - Cylinder Volume & Liters)
  { id: 's-5-1', name: 'David Banda', tableId: 5, tableName: 'Table 5', avatarInitials: 'DB', masteredSkills: ['Cylinder volume formula'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Calculated water well liters accurately.', recentExerciseScore: 90 },
  { id: 's-5-2', name: 'Salif Traoré', tableId: 5, tableName: 'Table 5', avatarInitials: 'ST', masteredSkills: ['Height x Base Area'], flaggedDifficulties: ['Cubic units conversion'], status: 'needs_guidance', teacherNotes: 'Converts m³ to liters with difficulty.', recentExerciseScore: 72 },
  { id: 's-5-3', name: 'Kadiatou Bah', tableId: 5, tableName: 'Table 5', avatarInitials: 'KB', masteredSkills: ['Well depth & volume'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Solid understanding of capacity.', recentExerciseScore: 86 },
  { id: 's-5-4', name: 'Yaw Osei', tableId: 5, tableName: 'Table 5', avatarInitials: 'YO', masteredSkills: ['Cylinder height math'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Accurate notebook sketches.', recentExerciseScore: 85 },
  { id: 's-5-5', name: 'Sipho Zuma', tableId: 5, tableName: 'Table 5', avatarInitials: 'SZ', masteredSkills: ['Base circle area'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Calculates πr² quickly.', recentExerciseScore: 88 },
  { id: 's-5-6', name: 'Amina Idris', tableId: 5, tableName: 'Table 5', avatarInitials: 'AI', masteredSkills: ['Volume scaling'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good team participant.', recentExerciseScore: 84 },
  { id: 's-5-7', name: 'Cheikh Anta', tableId: 5, tableName: 'Table 5', avatarInitials: 'CA', masteredSkills: ['Water volume'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands liter capacity.', recentExerciseScore: 89 },
  { id: 's-5-8', name: 'Zola Mthembu', tableId: 5, tableName: 'Table 5', avatarInitials: 'ZM', masteredSkills: ['3D cylinders'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Very neat drawing.', recentExerciseScore: 91 },

  // Table 6 (Granary Grain Ratios - Proportions)
  { id: 's-6-1', name: 'Abeba Gidey', tableId: 6, tableName: 'Table 6', avatarInitials: 'AG', masteredSkills: ['Direct proportions', 'Ratios'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Granary grain calculations correct.', recentExerciseScore: 91 },
  { id: 's-6-2', name: 'Tewodros Kassahun', tableId: 6, tableName: 'Table 6', avatarInitials: 'TK', masteredSkills: ['Cross multiplication'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Fast with proportion calculations.', recentExerciseScore: 89 },
  { id: 's-6-3', name: 'Bintu Sanogo', tableId: 6, tableName: 'Table 6', avatarInitials: 'BS', masteredSkills: ['Storage ratios'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands harvest share distribution.', recentExerciseScore: 87 },
  { id: 's-6-4', name: 'Godfrey Mwamba', tableId: 6, tableName: 'Table 6', avatarInitials: 'GM', masteredSkills: ['Unit rates'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good oral explanation.', recentExerciseScore: 86 },
  { id: 's-6-5', name: 'Habiba Umar', tableId: 6, tableName: 'Table 6', avatarInitials: 'HU', masteredSkills: ['Proportions'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Steady progress.', recentExerciseScore: 83 },
  { id: 's-6-6', name: 'Jumaane Bakari', tableId: 6, tableName: 'Table 6', avatarInitials: 'JB', masteredSkills: ['Grain capacity'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Participates actively.', recentExerciseScore: 85 },
  { id: 's-6-7', name: 'Lulua Hassan', tableId: 6, tableName: 'Table 6', avatarInitials: 'LH', masteredSkills: ['Ratios & scale'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Clean notation.', recentExerciseScore: 88 },
  { id: 's-6-8', name: 'Modibo Keita', tableId: 6, tableName: 'Table 6', avatarInitials: 'MK', masteredSkills: ['Direct proportions'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Assists peers with ratio tables.', recentExerciseScore: 95 },

  // Table 7 (Sundial Shadow Trigonometry - Tangents)
  { id: 's-7-1', name: 'Faraji Omondi', tableId: 7, tableName: 'Table 7', avatarInitials: 'FO', masteredSkills: ['Tangent ratio', 'Shadow trigonometry'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Measured pole shadow with exact angle.', recentExerciseScore: 97 },
  { id: 's-7-2', name: 'Nneka Okonjo', tableId: 7, tableName: 'Table 7', avatarInitials: 'NO', masteredSkills: ['Angle of elevation'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Traced shadow length at 10 AM.', recentExerciseScore: 92 },
  { id: 's-7-3', name: 'Serigne Fall', tableId: 7, tableName: 'Table 7', avatarInitials: 'SF', masteredSkills: ['Trig ratios'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good with protractor and sunlight line.', recentExerciseScore: 88 },
  { id: 's-7-4', name: 'Wanjiku Karanja', tableId: 7, tableName: 'Table 7', avatarInitials: 'WK', masteredSkills: ['Opposite / Adjacent'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands tangent definition.', recentExerciseScore: 89 },
  { id: 's-7-5', name: 'Yusuf Garba', tableId: 7, tableName: 'Table 7', avatarInitials: 'YG', masteredSkills: ['Shadow heights'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Calculated baobab tree height.', recentExerciseScore: 90 },
  { id: 's-7-6', name: 'Simi Adebayo', tableId: 7, tableName: 'Table 7', avatarInitials: 'SA', masteredSkills: ['Solar angle'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Active table facilitator.', recentExerciseScore: 86 },
  { id: 's-7-7', name: 'Desta Mengistu', tableId: 7, tableName: 'Table 7', avatarInitials: 'DM', masteredSkills: ['Trigonometry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands angle variation over time.', recentExerciseScore: 87 },
  { id: 's-7-8', name: 'Bakari Toure', tableId: 7, tableName: 'Table 7', avatarInitials: 'BT', masteredSkills: ['Shadow measurements'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Accurate notebook records.', recentExerciseScore: 85 },

  // Table 8 (Kente Loom Transformations - Symmetries)
  { id: 's-8-1', name: 'Yaa Asantewaa', tableId: 8, tableName: 'Table 8', avatarInitials: 'YA', masteredSkills: ['Reflection matrices', 'Kente symmetry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Excellent understanding of transformations.', recentExerciseScore: 93 },
  { id: 's-8-2', name: 'Ekwueme Duru', tableId: 8, tableName: 'Table 8', avatarInitials: 'ED', masteredSkills: ['Translation vectors'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Traces repeating strips correctly.', recentExerciseScore: 88 },
  { id: 's-8-3', name: 'Gifty Mensah', tableId: 8, tableName: 'Table 8', avatarInitials: 'GM', masteredSkills: ['Horizontal & vertical reflection'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Mastered 2D coordinate flips.', recentExerciseScore: 96 },
  { id: 's-8-4', name: 'Hamidou Sene', tableId: 8, tableName: 'Table 8', avatarInitials: 'HS', masteredSkills: ['Geometric patterns'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Careful with color coding.', recentExerciseScore: 84 },
  { id: 's-8-5', name: 'Isabelle Ewane', tableId: 8, tableName: 'Table 8', avatarInitials: 'IE', masteredSkills: ['Symmetry axes'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Identifies glide reflection.', recentExerciseScore: 90 },
  { id: 's-8-6', name: 'Kojo Antwi', tableId: 8, tableName: 'Table 8', avatarInitials: 'KA', masteredSkills: ['Loom transformations'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Solid drawing accuracy.', recentExerciseScore: 85 },
  { id: 's-8-7', name: 'Leticia Appiah', tableId: 8, tableName: 'Table 8', avatarInitials: 'LA', masteredSkills: ['Coordinate shifts'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Steady pace.', recentExerciseScore: 86 },
  { id: 's-8-8', name: 'Malick Sy', tableId: 8, tableName: 'Table 8', avatarInitials: 'MS', masteredSkills: ['Weaving symmetry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands warp/weft geometry.', recentExerciseScore: 89 },

  // Table 9 (Agricultural Land Partition - Polygon Decomposition)
  { id: 's-9-1', name: 'Idrissa Gueye', tableId: 9, tableName: 'Table 9', avatarInitials: 'IG', masteredSkills: ['Polygon land partition'], flaggedDifficulties: ['Irregular quadrilateral area'], status: 'needs_guidance', teacherNotes: 'Needs decomposition into 2 triangles before area summation.', recentExerciseScore: 76 },
  { id: 's-9-2', name: 'Njideka Akunyili', tableId: 9, tableName: 'Table 9', avatarInitials: 'NA', masteredSkills: ['Triangle area (1/2 b x h)'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Decomposes complex plots effortlessly.', recentExerciseScore: 97 },
  { id: 's-9-3', name: 'Oumar Tall', tableId: 9, tableName: 'Table 9', avatarInitials: 'OT', masteredSkills: ['Perimeter boundary'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good with surveyor measurements.', recentExerciseScore: 86 },
  { id: 's-9-4', name: 'Patience Dlamini', tableId: 9, tableName: 'Table 9', avatarInitials: 'PD', masteredSkills: ['Trapezoid area'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Accurate field calculations.', recentExerciseScore: 88 },
  { id: 's-9-5', name: 'Qadir Sanusi', tableId: 9, tableName: 'Table 9', avatarInitials: 'QS', masteredSkills: ['Composite shapes'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Helpful table scribe.', recentExerciseScore: 85 },
  { id: 's-9-6', name: 'Rashida Mussa', tableId: 9, tableName: 'Table 9', avatarInitials: 'RM', masteredSkills: ['Scale drawings'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good cartography skills.', recentExerciseScore: 89 },
  { id: 's-9-7', name: 'Souleymane Ba', tableId: 9, tableName: 'Table 9', avatarInitials: 'SB', masteredSkills: ['Area addition'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Checked plot boundaries.', recentExerciseScore: 87 },
  { id: 's-9-8', name: 'Tatenda Chikore', tableId: 9, tableName: 'Table 9', avatarInitials: 'TC', masteredSkills: ['Polygon surveying'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Solid understanding.', recentExerciseScore: 84 },

  // Table 10 (River Crossing Triangulation - Sine Law & Distance)
  { id: 's-10-1', name: 'Simphiwe Khumalo', tableId: 10, tableName: 'Table 10', avatarInitials: 'SK', masteredSkills: ['Triangulation', 'Sine law'], flaggedDifficulties: [], status: 'advanced', teacherNotes: 'Determined river width across two banks without crossing.', recentExerciseScore: 95 },
  { id: 's-10-2', name: 'Ursule Ngo', tableId: 10, tableName: 'Table 10', avatarInitials: 'UN', masteredSkills: ['Baseline surveying'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Understands baseline measurement ratio.', recentExerciseScore: 90 },
  { id: 's-10-3', name: 'Victor Eze', tableId: 10, tableName: 'Table 10', avatarInitials: 'VE', masteredSkills: ['Angle sightings'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Sightline angles calculated precisely.', recentExerciseScore: 89 },
  { id: 's-10-4', name: 'Wale Adeyemi', tableId: 10, tableName: 'Table 10', avatarInitials: 'WA', masteredSkills: ['Sine theorem'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Solves non-right triangles.', recentExerciseScore: 92 },
  { id: 's-10-5', name: 'Xolani Buthelezi', tableId: 10, tableName: 'Table 10', avatarInitials: 'XB', masteredSkills: ['Distance scaling'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Good scale conversion.', recentExerciseScore: 86 },
  { id: 's-10-6', name: 'Yolande Mbida', tableId: 10, tableName: 'Table 10', avatarInitials: 'YM', masteredSkills: ['Triangulation geometry'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Team navigator.', recentExerciseScore: 88 },
  { id: 's-10-7', name: 'Zakari Soumana', tableId: 10, tableName: 'Table 10', avatarInitials: 'ZS', masteredSkills: ['Angle measurements'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Steady pace.', recentExerciseScore: 87 },
  { id: 's-10-8', name: 'Aicha Traoré', tableId: 10, tableName: 'Table 10', avatarInitials: 'AT', masteredSkills: ['Triangulation calculation'], flaggedDifficulties: [], status: 'on_track', teacherNotes: 'Verified final river span.', recentExerciseScore: 91 },
];

export const TeacherMinimalDashboard: React.FC<{ onBackToSelection: () => void }> = ({
  onBackToSelection,
}) => {
  // Navigation Tabs: 'tables' (Classroom Tables Overview) | 'students' (Student Directory & Dossiers)
  const [activeTab, setActiveTab] = useState<'tables' | 'students'>('tables');

  // Search & Filter state for students
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_guidance' | 'on_track' | 'advanced'>('all');
  const [tableFilter, setTableFilter] = useState<number | 'all'>('all');

  // Selected Student for detailed Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Selected Table for deep dive
  const [selectedTableId, setSelectedTableId] = useState<number>(4);

  // Dynamic Class State: 80 students across 10 tables
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);

  // Table Statuses
  const [tables, setTables] = useState<TablePod[]>([
    { id: 1, name: 'Table 1', exercise: 'Market Fractions & Barter Math', topic: 'Arithmetic', status: 'active', timeSpent: '18m', accuracyScore: 86, snapshotStatus: 'pending' },
    { id: 2, name: 'Table 2', exercise: 'Bamum Polygon Geometry', topic: 'Angles & Polygons', status: 'active', timeSpent: '22m', accuracyScore: 84, snapshotStatus: 'pending' },
    { id: 3, name: 'Table 3', exercise: 'Round Hut Architecture', topic: 'Circumference & Pi (π)', status: 'help', timeSpent: '27m', accuracyScore: 78, snapshotStatus: 'pending' },
    { id: 4, name: 'Table 4', exercise: 'Ndop Sacred Cloth Geometry', topic: 'Parallel Lines & Rhombus', status: 'verified', timeSpent: '19m', accuracyScore: 98, snapshotStatus: 'verified' },
    { id: 5, name: 'Table 5', exercise: 'Water Well Hydrology', topic: 'Cylinder Volume & Liters', status: 'active', timeSpent: '16m', accuracyScore: 88, snapshotStatus: 'pending' },
    { id: 6, name: 'Table 6', exercise: 'Granary Grain Ratios', topic: 'Direct Proportions', status: 'active', timeSpent: '14m', accuracyScore: 87, snapshotStatus: 'pending' },
    { id: 7, name: 'Table 7', exercise: 'Sundial Shadow Trigonometry', topic: 'Solar Angles & Tangents', status: 'verified', timeSpent: '24m', accuracyScore: 94, snapshotStatus: 'verified' },
    { id: 8, name: 'Table 8', exercise: 'Kente Loom Transformations', topic: 'Reflection & Translation', status: 'active', timeSpent: '15m', accuracyScore: 89, snapshotStatus: 'pending' },
    { id: 9, name: 'Table 9', exercise: 'Agricultural Land Partition', topic: 'Polygon Decomposition', status: 'active', timeSpent: '21m', accuracyScore: 85, snapshotStatus: 'pending' },
    { id: 10, name: 'Table 10', exercise: 'River Crossing Triangulation', topic: 'Sine Law & Distance', status: 'verified', timeSpent: '26m', accuracyScore: 92, snapshotStatus: 'verified' },
  ]);

  // Form inputs for Student Dossier
  const [selectedExerciseForFlag, setSelectedExerciseForFlag] = useState<string>('Table 3: Round Hut Architecture (Circumference & π)');
  const [customDifficultyText, setCustomDifficultyText] = useState<string>('');
  const [newCompetencyInput, setNewCompetencyInput] = useState<string>('');
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');
  const [assignmentSuccessToast, setAssignmentSuccessToast] = useState<string | null>(null);

  // Selected table object
  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const studentsAtSelectedTable = students.filter((s) => s.tableId === selectedTableId);

  // Metrics
  const totalStudentsCount = students.length;

  // Close student dossier modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedStudent) {
        setSelectedStudent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStudent]);
  const studentsNeedingGuidance = students.filter((s) => s.status === 'needs_guidance').length;
  const verifiedCount = tables.filter((t) => t.status === 'verified').length;
  const helpCount = tables.filter((t) => t.status === 'help').length;

  // Sound gathering drum
  const handleSoundGatheringDrum = () => {
    playRotationCall();
  };

  // Open Student Dossier
  const handleOpenStudentDossier = (student: StudentRecord) => {
    setSelectedStudent(student);
    setTeacherNoteInput(student.teacherNotes);
    setCustomDifficultyText('');
    setNewCompetencyInput('');
  };

  // Resolve table assistance request
  const handleResolveHelp = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'active' } : t))
    );
  };

  // Teacher flags a difficulty on a specific exercise
  const handleFlagDifficultyOnExercise = () => {
    if (!selectedStudent) return;
    const diffText = customDifficultyText.trim() || `Struggles with ${selectedExerciseForFlag}`;
    const fullFlag = `${selectedExerciseForFlag.split(':')[0]}: ${diffText}`;

    const updatedStudent: StudentRecord = {
      ...selectedStudent,
      flaggedDifficulties: Array.from(new Set([...selectedStudent.flaggedDifficulties, fullFlag])),
      status: 'needs_guidance',
    };

    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
    setCustomDifficultyText('');
    setAssignmentSuccessToast(`Difficulty flagged on ${selectedExerciseForFlag.split(':')[0]}!`);
    setTimeout(() => setAssignmentSuccessToast(null), 3000);
  };

  // Teacher removes a difficulty tag
  const handleRemoveDifficulty = (diffToRemove: string) => {
    if (!selectedStudent) return;
    const newDiffs = selectedStudent.flaggedDifficulties.filter((d) => d !== diffToRemove);
    const updatedStudent: StudentRecord = {
      ...selectedStudent,
      flaggedDifficulties: newDiffs,
      status: newDiffs.length === 0 ? 'on_track' : 'needs_guidance',
    };

    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
  };

  // Teacher adds a mastered competency
  const handleAddMasteredSkill = () => {
    if (!selectedStudent || !newCompetencyInput.trim()) return;
    const skill = newCompetencyInput.trim();
    const updatedStudent: StudentRecord = {
      ...selectedStudent,
      masteredSkills: Array.from(new Set([...selectedStudent.masteredSkills, skill])),
    };

    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
    setNewCompetencyInput('');
  };

  // Teacher reassigns student to another workshop table
  const handleReassignStudentTable = (newTableId: number) => {
    if (!selectedStudent) return;
    const targetWorkshop = WORKSHOPS.find((w) => w.id === newTableId);
    if (!targetWorkshop) return;

    const updatedStudent: StudentRecord = {
      ...selectedStudent,
      tableId: newTableId,
      tableName: targetWorkshop.name,
    };

    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
    setAssignmentSuccessToast(`Student assigned to ${targetWorkshop.name} (${targetWorkshop.exercise})`);
    setTimeout(() => setAssignmentSuccessToast(null), 3500);
  };

  // Teacher saves notes
  const handleSaveTeacherNote = () => {
    if (!selectedStudent) return;
    const updatedStudent: StudentRecord = {
      ...selectedStudent,
      teacherNotes: teacherNoteInput,
    };
    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
    setAssignmentSuccessToast('Teacher pedagogical observation saved.');
    setTimeout(() => setAssignmentSuccessToast(null), 2500);
  };

  // Filtered Students list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.masteredSkills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.flaggedDifficulties.some((df) => df.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : s.status === statusFilter;

    const matchesTable =
      tableFilter === 'all' ? true : s.tableId === tableFilter;

    return matchesSearch && matchesStatus && matchesTable;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 font-sans pb-24">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-3.5 sticky top-14 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSelection}
              className="text-xs font-mono text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <div className="flex items-center gap-2">
              <NdopBadgeMotif size={16} className="text-[#A36B46]" />
              <span className="font-serif font-black text-base text-stone-950">
                Teacher Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'tables'
                    ? 'bg-white text-stone-950 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Classroom Tables (10)
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'students'
                    ? 'bg-white text-stone-950 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Student Dossiers ({totalStudentsCount})</span>
                {studentsNeedingGuidance > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {studentsNeedingGuidance}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleSoundGatheringDrum}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all hidden sm:flex"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#A36B46]" />
              <span>Gathering Drum</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* METRICS SUMMARY STRIP (Clean & Direct) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-mono text-stone-500 uppercase block">Active Tables</span>
            <span className="font-serif font-black text-2xl text-stone-950 mt-0.5 block">10 Tables</span>
            <span className="text-[11px] text-stone-500 mt-1 block">8 students per table</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-mono text-stone-500 uppercase block">Class Roster</span>
            <span className="font-serif font-black text-2xl text-stone-950 mt-0.5 block">{totalStudentsCount} Students</span>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Active on physical paper</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-mono text-stone-500 uppercase block">Verified Work</span>
            <span className="font-serif font-black text-2xl text-emerald-700 mt-0.5 block">{verifiedCount} / 10 Tables</span>
            <span className="text-[11px] text-stone-500 mt-1 block">1-second snapshot approved</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-mono text-stone-500 uppercase block">Teacher Attention</span>
            <span className={`font-serif font-black text-2xl mt-0.5 block ${studentsNeedingGuidance > 0 ? 'text-amber-700' : 'text-stone-900'}`}>
              {studentsNeedingGuidance} Students
            </span>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              Flagged for targeted guidance
            </span>
          </div>
        </div>

        {/* TAB 1: CLASSROOM TABLES OVERVIEW */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            
            {/* Table Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-black text-lg text-stone-950">
                    Classroom Tables Overview
                  </h3>
                  <p className="text-xs text-stone-500">
                    Select a table to inspect seated students, view individual dossiers, or reassign workshops.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {tables.map((table) => {
                  const isSelected = selectedTableId === table.id;
                  const isHelp = table.status === 'help';
                  const isVerified = table.status === 'verified';
                  const tableStudents = students.filter((s) => s.tableId === table.id);
                  const tableFlaggedCount = tableStudents.filter((s) => s.status === 'needs_guidance').length;

                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                        isSelected
                          ? 'ring-2 ring-stone-950 border-stone-950 bg-white shadow-md'
                          : isHelp
                          ? 'bg-amber-50/80 border-amber-400 shadow-2xs'
                          : isVerified
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                          : 'bg-white border-stone-200 hover:border-stone-400 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-serif font-black text-base text-stone-950">
                            {table.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                            {tableStudents.length} students
                          </span>
                        </div>
                        <div className="text-xs font-bold text-stone-800 line-clamp-1">
                          {table.exercise}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                          {table.topic}
                        </div>
                      </div>

                      {/* Seated Students Dots */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-1">
                          {tableStudents.map((s, idx) => (
                            <span
                              key={idx}
                              className={`w-2 h-2 rounded-full ${
                                s.status === 'needs_guidance'
                                  ? 'bg-amber-500'
                                  : isVerified
                                  ? 'bg-emerald-500'
                                  : 'bg-stone-400'
                              }`}
                              title={s.name}
                            />
                          ))}
                        </div>
                        {tableFlaggedCount > 0 && (
                          <span className="text-[10px] font-mono text-amber-700 font-bold block">
                            {tableFlaggedCount} needs guidance
                          </span>
                        )}
                      </div>

                      {/* Status row */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{table.timeSpent}</span>
                        </span>
                        {isHelp ? (
                          <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Help</span>
                          </span>
                        ) : isVerified ? (
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{table.accuracyScore}%</span>
                          </span>
                        ) : (
                          <span className="text-stone-500">Autonomous</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Table Deep Dive & Seated Students Cards */}
            {selectedTable && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Table Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#A36B46] font-bold uppercase">
                      <span>Table Workshop Station</span>
                      <span>•</span>
                      <span>{selectedTable.topic}</span>
                    </div>
                    <h3 className="font-serif font-black text-2xl text-stone-950 mt-0.5">
                      {selectedTable.name} · {selectedTable.exercise}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-stone-100 px-3 py-1.5 rounded-xl text-stone-700 font-medium">
                      Camera: {selectedTable.snapshotStatus === 'verified' ? '✓ Verified (1s snapshot)' : 'Pending submission'}
                    </span>
                    {selectedTable.status === 'help' && (
                      <button
                        onClick={() => handleResolveHelp(selectedTable.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
                      >
                        Resolve Assistance
                      </button>
                    )}
                  </div>
                </div>

                {/* Seated Students Grid for this Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900">
                      Students Seated at {selectedTable.name} ({studentsAtSelectedTable.length})
                    </h4>
                    <span className="text-xs text-stone-500 font-mono">
                      Click any student to open dossier, flag difficulties, or reassign workshop
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {studentsAtSelectedTable.map((student) => {
                      const hasDifficulties = student.flaggedDifficulties.length > 0;
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleOpenStudentDossier(student)}
                          className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 hover:border-stone-400 transition-all cursor-pointer space-y-3 shadow-2xs group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                                {student.avatarInitials}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-stone-950 group-hover:text-[#A36B46] transition-colors">
                                  {student.name}
                                </div>
                                <div className="text-[10px] font-mono text-stone-500">
                                  Score: {student.recentExerciseScore}%
                                </div>
                              </div>
                            </div>
                            {student.status === 'needs_guidance' ? (
                              <span className="w-2 h-2 rounded-full bg-amber-500" title="Needs guidance" />
                            ) : student.status === 'advanced' ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Advanced" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-stone-400" title="On track" />
                            )}
                          </div>

                          {/* Mastered Skills chips */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 uppercase block">Competencies:</span>
                            <div className="flex flex-wrap gap-1">
                              {student.masteredSkills.slice(0, 2).map((skill, i) => (
                                <span key={i} className="text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-700 truncate max-w-[130px]">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Flagged difficulties chips */}
                          {hasDifficulties ? (
                            <div className="space-y-1 pt-1 border-t border-stone-200">
                              <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block">
                                Difficulty Flagged:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {student.flaggedDifficulties.map((diff, i) => (
                                  <span key={i} className="text-[10px] bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-medium">
                                    {diff}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="pt-1 text-[10px] font-mono text-emerald-700">
                              ✓ No difficulties reported
                            </div>
                          )}

                          <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-[#A36B46]">
                            <span>Open Student Dossier</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: STUDENT PROFILES & DIRECTORY (Search, Filter, Full 80 Roster) */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            
            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name, competency, or difficulty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'all' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setStatusFilter('needs_guidance')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'needs_guidance' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <span>Needs Guidance</span>
                  <span className="text-[10px] font-mono bg-white/20 px-1 rounded">
                    {students.filter((s) => s.status === 'needs_guidance').length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('on_track')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'on_track' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  On Track
                </button>
                <button
                  onClick={() => setStatusFilter('advanced')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'advanced' ? 'bg-emerald-700 text-white font-bold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {/* Students List Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Assigned Table / Workshop</th>
                      <th className="py-3 px-4">Competencies</th>
                      <th className="py-3 px-4">Flagged Difficulties</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredStudents.map((student) => {
                      const isNeedsHelp = student.status === 'needs_guidance';
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-stone-50 transition-colors cursor-pointer group"
                          onClick={() => handleOpenStudentDossier(student)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-[11px] font-mono shrink-0">
                                {student.avatarInitials}
                              </div>
                              <span className="font-bold text-stone-900 group-hover:text-[#A36B46] transition-colors">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-stone-700">
                            {student.tableName}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {student.masteredSkills.map((sk, i) => (
                                <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {student.flaggedDifficulties.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {student.flaggedDifficulties.map((diff, i) => (
                                  <span key={i} className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-1.5 py-0.5 rounded">
                                    {diff}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] font-mono text-stone-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            {student.recentExerciseScore}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStudentDossier(student);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white transition-colors text-[11px] font-bold text-stone-800 cursor-pointer"
                            >
                              Open Dossier
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* STUDENT PROFILE DOSSIER (MODAL) */}
      {selectedStudent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null);
          }}
          className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative cursor-default">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-base font-mono">
                  {selectedStudent.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-black text-2xl text-stone-950">
                      {selectedStudent.name}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedStudent.status === 'needs_guidance'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : selectedStudent.status === 'advanced'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-stone-100 text-stone-800 border border-stone-300'
                    }`}>
                      {selectedStudent.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 font-mono mt-0.5">
                    Currently assigned to: <strong>{selectedStudent.tableName}</strong> · Score: {selectedStudent.recentExerciseScore}%
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Press Esc or click to close dossier"
              >
                <span>Fermer</span>
                <X className="w-4 h-4 text-stone-700" />
              </button>
            </div>

            {/* Notification Toast */}
            {assignmentSuccessToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{assignmentSuccessToast}</span>
              </div>
            )}

            {/* 1. Mastered Competencies Matrix */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-[#A36B46] font-bold">
                1. Mastered Competencies
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.masteredSkills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>

              {/* Add Mastered Competency */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add mastered competency..."
                  value={newCompetencyInput}
                  onChange={(e) => setNewCompetencyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMasteredSkill()}
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                />
                <button
                  onClick={handleAddMasteredSkill}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* 2. Flagged Difficulties Section & Teacher Signal Tool */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase text-amber-700 font-bold">
                  2. Flagged Difficulties on Exercises
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  Reported by Teacher
                </span>
              </div>

              {selectedStudent.flaggedDifficulties.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.flaggedDifficulties.map((diff, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{diff}</span>
                      <button
                        onClick={() => handleRemoveDifficulty(diff)}
                        className="text-amber-700 hover:text-amber-950 font-bold ml-1 cursor-pointer"
                        title="Mark as resolved"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500">
                  No difficulties flagged yet for {selectedStudent.name}.
                </div>
              )}

              {/* Teacher Form: Signal a Difficulty on an Exercise */}
              <div className="bg-[#FAF6EC] border border-[#A36B46]/30 rounded-2xl p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-stone-900 flex items-center justify-between">
                  <span>Signal a Difficulty on an Exercise</span>
                  <span className="text-[10px] font-mono text-[#A36B46]">Auto-suggests remedial workshop</span>
                </div>

                <div className="space-y-2">
                  <select
                    value={selectedExerciseForFlag}
                    onChange={(e) => setSelectedExerciseForFlag(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900 font-medium"
                  >
                    {WORKSHOPS.map((w) => (
                      <option key={w.id} value={`${w.name}: ${w.exercise} (${w.topic})`}>
                        {w.name}: {w.exercise} · {w.topic}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Specify the difficulty (e.g. confuses diameter and radius, interior angle sum)..."
                      value={customDifficultyText}
                      onChange={(e) => setCustomDifficultyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFlagDifficultyOnExercise()}
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                    />
                    <button
                      onClick={handleFlagDifficultyOnExercise}
                      className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Flag Difficulty</span>
                    </button>
                  </div>
                </div>

                {/* Smart Remedial Recommendation Action */}
                {(() => {
                  const workshopMatch = WORKSHOPS.find(w => selectedExerciseForFlag.startsWith(w.name));
                  if (!workshopMatch) return null;
                  const isAlreadyAtTable = selectedStudent.tableId === workshopMatch.id;

                  return (
                    <div className="pt-2 border-t border-[#A36B46]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-stone-900">Recommended Workshop: </span>
                        <span className="text-stone-700">{workshopMatch.name} ({workshopMatch.exercise})</span>
                      </div>
                      {!isAlreadyAtTable ? (
                        <button
                          onClick={() => handleReassignStudentTable(workshopMatch.id)}
                          className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-[#A36B46]" />
                          <span>Assign Student to this Workshop Now</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-800 font-bold">
                          ✓ Student currently seated at this table
                        </span>
                      )}
                    </div>
                  );
                })()}

              </div>

            </div>

            {/* 3. Reassign to Workshop Table Grid */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase text-stone-900 font-bold flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#A36B46]" />
                  <span>3. Reassign to Workshop Table</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  Moves student to address their difficulty
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {tables.map((t) => {
                  const isCurrent = t.id === selectedStudent.tableId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleReassignStudentTable(t.id)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="font-bold truncate">{t.name}</div>
                      <div className={`text-[10px] truncate ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                        {t.topic}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Teacher Pedagogical Notes */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="text-xs font-mono uppercase text-stone-900 font-bold">
                4. Teacher Pedagogical Observations
              </div>
              <textarea
                rows={2}
                value={teacherNoteInput}
                onChange={(e) => setTeacherNoteInput(e.target.value)}
                placeholder="Add teacher pedagogical observations for this student..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveTeacherNote}
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Observation
                </button>
              </div>
            </div>

            {/* Modal Footer Exit Action */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-mono">
                Press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded text-[10px]">Esc</kbd> or click outside to exit
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span>Fermer le Dossier</span>
                <X className="w-4 h-4 text-stone-300" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
