import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { songService } from '../services/songService';
import { Song, SongQuestion } from '../types';
import { Button } from '../components/Button';

type RawOption =
  | string
  | {
      label?: string;
      value?: string;
      score?: number;
    };

type NormalizedOption = {
  label: string;
  value: string;
  score: number;
};

type StoredAnswer = {
  label: string;
  value: string;
  score: number;
};

function normalizeOption(option: RawOption, index: number): NormalizedOption {
  if (typeof option === 'string') {
    return {
      label: option,
      value: option,
      score: index + 1
    };
  }

  const label = option?.label || option?.value || `Opción ${index + 1}`;
  const value = option?.value || option?.label || `option_${index + 1}`;
  const score = typeof option?.score === 'number' ? option.score : index + 1;

  return {
    label,
    value,
    score
  };
}

function getQuestionOptions(question: SongQuestion): NormalizedOption[] {
  const rawOptions = Array.isArray(question.options)
    ? (question.options as unknown as RawOption[])
    : [];

  return rawOptions.map((option, index) => normalizeOption(option, index));
}

export function SongTest() {
  const { slug } = useParams<{ slug: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [questions, setQuestions] = useState<SongQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>({});
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) fetchTestData();
  }, [slug]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { song, questions } = await songService.getSongWithQuestionsBySlug(slug!);

      if (!questions || questions.length === 0) {
        throw new Error('Esta canción no tiene preguntas configuradas aún.');
      }

      setSong(song);
      setQuestions(questions);
    } catch (err: any) {
      console.error('Error fetching test data:', err);
      setError(err?.message || 'Error al cargar el test.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: NormalizedOption) => {
    const currentQuestion = questions[currentQuestionIndex];

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        label: option.label,
        value: option.value,
        score: option.score
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    return questions.reduce((totalScore, question) => {
      const selectedAnswer = answers[question.id];

      if (!selectedAnswer) {
        return totalScore;
      }

      if (typeof selectedAnswer.score === 'number') {
        return totalScore + selectedAnswer.score;
      }

      const weightMap = question.weight_map as Record<string, number> | undefined;
      const fallbackScore = weightMap?.[selectedAnswer.value] || 0;

      return totalScore + fallbackScore;
    }, 0);
  };

  const calculateMaxScore = () => {
    return questions.reduce((maxScore, question) => {
      const options = getQuestionOptions(question);

      if (options.length === 0) {
        return maxScore;
      }

      const questionMaxScore = Math.max(...options.map(option => option.score || 0));
      return maxScore + questionMaxScore;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#140F12]">
        <div className="atmosphere-luxury" />
        <Loader2 className="animate-spin text-[#C8A96B]/40" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#140F12] text-center p-6">
        <div className="atmosphere-luxury" />
        <p className="text-2xl font-serif italic text-[#F3EBDD]/40 mb-8 max-w-md">"{error}"</p>
        <Button
          onClick={() => navigate(`/songs/${slug}`)}
          variant="outline"
          className="border-[#C8A96B]/20 text-[#C8A96B]"
        >
          Volver al Detalle
        </Button>
      </div>
    );
  }

  if (isFinished && song) {
    const totalScore = calculateScore();
    const maxScore = calculateMaxScore();

    return (
      <div className="min-h-screen flex flex-col bg-[#140F12] relative overflow-hidden">
        <div className="atmosphere-luxury" />
        <div className="halo-light" />

        <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col items-center gap-6">
              <CheckCircle2 className="text-[#C8A96B]" size={60} strokeWidth={1} />
              <div className="space-y-2">
                <span className="text-[10px] tracking-[0.5em] uppercase text-[#C8A96B] font-bold">
                  Cata Completada
                </span>
                <h1 className="text-5xl md:text-6xl font-serif italic text-[#F3EBDD] tracking-tighter">
                  {song.title}
                </h1>
              </div>
            </div>

            <div className="glass p-12 space-y-10 relative overflow-hidden bg-[#C8A96B]/[0.02]">
              <div className="glossy-overlay opacity-30" />
              <Sparkles className="text-[#C8A96B]/20 absolute -top-10 -right-10" size={200} />

              <div className="space-y-4">
                <span className="text-[11px] tracking-[0.5em] uppercase text-[#F3EBDD]/40 font-bold">
                  Intensidad Emocional Detectada
                </span>
                <div className="text-7xl font-serif italic text-[#C8A96B]">{totalScore}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#F3EBDD]/20 font-bold">
                  Sobre un total de {maxScore} unidades
                </div>
              </div>

              <div className="h-px w-full bg-white/5" />

              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96B] font-bold">
                    Lectura Sommelier
                  </span>
                  <p className="text-xl font-serif italic text-[#F3EBDD]/80 leading-relaxed">
                    "{song.sommelier_phrase}"
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/40 font-bold">
                    Herida Primordial
                  </span>
                  <p className="text-[#F3EBDD]/60 font-serif italic">
                    {song.core_wound}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/library')}
              className="w-full bg-[#C8A96B] text-[#140F12] font-bold tracking-[0.3em] text-[10px]"
            >
              VOLVER A LA CAVA
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = currentQuestion ? getQuestionOptions(currentQuestion) : [];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#140F12] relative overflow-hidden text-[#F3EBDD]">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-20 relative z-10 flex flex-col">
        <header className="flex justify-between items-center mb-20">
          <button
            onClick={() => navigate(`/songs/${slug}`)}
            className="flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-[#F3EBDD]/40 hover:text-[#C8A96B] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Abandonar
          </button>

          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96B] font-bold">
              Pregunta {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#C8A96B]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="flex-grow flex flex-col justify-center gap-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h2 className="text-4xl md:text-5xl font-serif italic leading-tight tracking-tight">
                {currentQuestion.question_text}
              </h2>

              <div className="grid gap-4">
                {currentOptions.map((option, index) => {
                  const isSelected = selectedAnswer?.value === option.value;

                  return (
                    <button
                      key={`${currentQuestion.id}-${option.value}-${index}`}
                      onClick={() => handleSelectOption(option)}
                      className={`group relative text-left p-8 glass border transition-all duration-500 overflow-hidden ${
                        isSelected
                          ? 'bg-[#C8A96B] border-[#C8A96B] text-[#140F12]'
                          : 'bg-white/[0.02] border-white/5 hover:border-[#C8A96B]/30'
                      }`}
                    >
                      {!selectedAnswer && (
                        <div className="glossy-overlay opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}

                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xl font-serif italic">{option.label}</span>
                        {isSelected && <CheckCircle2 size={24} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <footer className="flex justify-end pt-8">
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`min-w-[200px] border-[#C8A96B] ${
                !selectedAnswer
                  ? 'opacity-30'
                  : 'bg-[#C8A96B] text-[#140F12] hover:bg-[#F3EBDD]'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'FINALIZAR CATA' : 'SIGUIENTE'}
            </Button>
          </footer>
        </div>
      </main>
    </div>
  );
}