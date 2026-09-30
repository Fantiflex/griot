import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Sparkles, Loader2, ArrowLeft, BookOpen, CheckCircle, Wand2 } from 'lucide-react';
import { LearningJourney } from '../types/griot';

const QUICK_INSPIRATIONS = [
  'The Great Zimbabwe & Dry Stone Masonry (No mortar architecture)',
  'Thomas Sankara & Community Trees for Food Sovereignty',
  'The Dogon Astronomy & The Constellation of Sirius',
  'The Pyramids of Meroë & Ancient Nubian Iron Furnaces',
  'The Voyage of Ibn Battuta across the Sahara to Mali',
  'Filtering Clean Drinking Water with Local Sand and Moringa Seeds',
];

export const JourneyGeneratorModal: React.FC = () => {
  const { addCustomJourney, setViewMode } = useClassroom();

  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Middle School (Ages 10-14)');
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          gradeLevel,
          language,
          context: 'Large classroom of 40-70 students, 1 phone per group of 8, rotating through Geometry, Writing, and Geography workshops',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate journey');
      }

      const generatedJourney: LearningJourney = await res.json();
      generatedJourney.isCustom = true;

      // Add to classroom journeys and switch to teacher view
      addCustomJourney(generatedJourney);
      setViewMode('teacher');
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Could not connect to Gemini. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => setViewMode('teacher')}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Teacher Console</span>
      </button>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Pedagogy Forge · Powered by Gemini</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Forge a New Interdisciplinary Journey
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            Name any historical figure, ancient empire, local science challenge, or moral folktale. LeGriot will craft a full 3-workshop curriculum (Geometry, Writing, Geography) tailored for circles of 8 students with 1 smartphone per circle.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Topic input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-800">
              Story, Event, Historical Figure, or Topic:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The Great Zimbabwe Stone Enclosures, Thomas Sankara, Water filtration..."
              className="w-full text-sm p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              required
            />
          </div>

          {/* Quick inspiration chips */}
          <div className="space-y-2">
            <span className="text-xs text-stone-500 font-medium">Quick Inspirations:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INSPIRATIONS.map((insp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(insp)}
                  className="text-xs text-stone-700 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-lg border border-stone-200 text-left transition-colors"
                >
                  {insp}
                </button>
              ))}
            </div>
          </div>

          {/* Parameters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Target Age / Grade Level:
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-amber-600"
              >
                <option value="Primary School (Ages 7-10)">Primary School (Ages 7-10)</option>
                <option value="Middle School (Ages 10-14)">Middle School (Ages 10-14)</option>
                <option value="High School (Ages 14-18)">High School (Ages 14-18)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Language:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-amber-600"
              >
                <option value="English">English</option>
                <option value="French">Français (French)</option>
                <option value="Swahili">Kiswahili</option>
                <option value="Spanish">Español</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>The Griot is weaving the story & workshops...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate 3-Workshop Journey</span>
              </>
            )}
          </button>
        </form>

        {isGenerating && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 space-y-1 animate-pulse">
            <span className="font-bold block">✨ Connecting curriculum disciplines:</span>
            <p className="text-amber-800 leading-relaxed">
              1. Structuring hands-on Geometry challenge with sticks & slates...<br />
              2. Formulating civic debate & speechwriting prompt for the Scribe...<br />
              3. Mapping geographic routes & river trade for the group investigation.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
