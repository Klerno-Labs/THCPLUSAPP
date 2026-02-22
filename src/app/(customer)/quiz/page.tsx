"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Moon,
  Sun,
  Zap,
  Heart,
  Leaf,
  Flame,
  Cookie,
  Droplets,
  Gauge,
  Clock,
  Coffee,
  Sunset,
  MoonStar,
  Infinity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────
interface QuizOption {
  label: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

// ─── Questions Data ─────────────────────────────────────
const questions: QuizQuestion[] = [
  {
    id: "effect",
    question: "What effect are you looking for?",
    subtitle: "Choose the vibe that matches your mood",
    options: [
      {
        label: "Relax & Unwind",
        value: "relax",
        icon: <Moon className="h-6 w-6" />,
        description: "Melt away stress and tension",
      },
      {
        label: "Energy & Focus",
        value: "energy",
        icon: <Zap className="h-6 w-6" />,
        description: "Stay productive and creative",
      },
      {
        label: "Balanced & Social",
        value: "balanced",
        icon: <Sun className="h-6 w-6" />,
        description: "Perfect for hanging out",
      },
      {
        label: "Pain Relief",
        value: "pain",
        icon: <Heart className="h-6 w-6" />,
        description: "Soothe aches and discomfort",
      },
    ],
  },
  {
    id: "experience",
    question: "How experienced are you?",
    subtitle: "This helps us recommend the right potency",
    options: [
      {
        label: "New to Cannabis",
        value: "beginner",
        icon: <Leaf className="h-6 w-6" />,
        description: "Just getting started",
      },
      {
        label: "Casual User",
        value: "casual",
        icon: <Coffee className="h-6 w-6" />,
        description: "Enjoy it from time to time",
      },
      {
        label: "Experienced",
        value: "experienced",
        icon: <Flame className="h-6 w-6" />,
        description: "Know what I like",
      },
      {
        label: "Connoisseur",
        value: "connoisseur",
        icon: <Sparkles className="h-6 w-6" />,
        description: "I appreciate the finer details",
      },
    ],
  },
  {
    id: "method",
    question: "Preferred method?",
    subtitle: "How do you like to enjoy your products?",
    options: [
      {
        label: "Flower",
        value: "flower",
        icon: <Leaf className="h-6 w-6" />,
        description: "Classic buds to smoke or vape",
      },
      {
        label: "Pre-rolls",
        value: "pre-rolls",
        icon: <Flame className="h-6 w-6" />,
        description: "Ready to light and enjoy",
      },
      {
        label: "Edibles",
        value: "edibles",
        icon: <Cookie className="h-6 w-6" />,
        description: "Tasty treats with lasting effects",
      },
      {
        label: "Concentrates",
        value: "concentrates",
        icon: <Droplets className="h-6 w-6" />,
        description: "Potent extracts and dabs",
      },
    ],
  },
  {
    id: "thc",
    question: "THC preference?",
    subtitle: "What potency level suits you best?",
    options: [
      {
        label: "Low (under 15%)",
        value: "low",
        icon: <Gauge className="h-6 w-6" />,
        description: "Mild and mellow",
      },
      {
        label: "Medium (15-25%)",
        value: "medium",
        icon: <Gauge className="h-6 w-6" />,
        description: "The sweet spot for most",
      },
      {
        label: "High (25%+)",
        value: "high",
        icon: <Gauge className="h-6 w-6" />,
        description: "Maximum potency",
      },
      {
        label: "No Preference",
        value: "any",
        icon: <Infinity className="h-6 w-6" />,
        description: "Open to anything",
      },
    ],
  },
  {
    id: "time",
    question: "When do you usually use?",
    subtitle: "Timing matters for the right recommendation",
    options: [
      {
        label: "Morning",
        value: "morning",
        icon: <Coffee className="h-6 w-6" />,
        description: "Start the day right",
      },
      {
        label: "Afternoon",
        value: "afternoon",
        icon: <Sunset className="h-6 w-6" />,
        description: "Midday wind-down",
      },
      {
        label: "Evening",
        value: "evening",
        icon: <MoonStar className="h-6 w-6" />,
        description: "Nighttime relaxation",
      },
      {
        label: "Anytime",
        value: "anytime",
        icon: <Clock className="h-6 w-6" />,
        description: "Whenever the mood strikes",
      },
    ],
  },
];

// ─── Recommendation Logic ───────────────────────────────
interface QuizResult {
  strainType: "INDICA" | "SATIVA" | "HYBRID";
  strainLabel: string;
  strainDescription: string;
  categorySlug: string;
  categoryLabel: string;
  thcNote: string;
}

function getRecommendation(answers: Record<string, string>): QuizResult {
  // Map effect to strain type
  const effectToStrain: Record<string, "INDICA" | "SATIVA" | "HYBRID"> = {
    relax: "INDICA",
    energy: "SATIVA",
    balanced: "HYBRID",
    pain: "INDICA",
  };

  // Time of day can influence recommendation
  const timeAdjust: Record<string, "INDICA" | "SATIVA" | "HYBRID" | null> = {
    morning: "SATIVA",
    afternoon: "HYBRID",
    evening: "INDICA",
    anytime: null,
  };

  let strainType = effectToStrain[answers.effect] || "HYBRID";

  // If time strongly suggests a different type and the user chose balanced, adjust
  const timeHint = timeAdjust[answers.time];
  if (timeHint && answers.effect === "balanced") {
    strainType = timeHint;
  }

  // Map method to category slug
  const methodToSlug: Record<string, string> = {
    flower: "flower",
    "pre-rolls": "pre-rolls",
    edibles: "edibles",
    concentrates: "concentrates",
  };

  const methodToLabel: Record<string, string> = {
    flower: "Flower",
    "pre-rolls": "Pre-Rolls",
    edibles: "Edibles",
    concentrates: "Concentrates",
  };

  const categorySlug = methodToSlug[answers.method] || "flower";
  const categoryLabel = methodToLabel[answers.method] || "Flower";

  // Strain descriptions
  const strainDescriptions: Record<string, { label: string; description: string }> = {
    INDICA: {
      label: "Indica",
      description:
        "Known for deep body relaxation and calming effects. Perfect for unwinding after a long day, relieving tension, and promoting restful sleep. Indica strains typically deliver a soothing, full-body experience.",
    },
    SATIVA: {
      label: "Sativa",
      description:
        "Renowned for uplifting cerebral effects and creative energy. Great for daytime use, social gatherings, and staying productive. Sativa strains tend to boost mood and focus.",
    },
    HYBRID: {
      label: "Hybrid",
      description:
        "The best of both worlds, offering balanced effects that combine relaxation with uplifting qualities. Hybrids are versatile and suitable for any time of day.",
    },
  };

  // THC note based on experience
  const experienceToThcNote: Record<string, string> = {
    beginner:
      "As a newcomer, we recommend starting with lower THC products (under 15%) and working your way up.",
    casual:
      "A medium THC range (15-22%) should be your sweet spot for a comfortable experience.",
    experienced:
      "You can comfortably enjoy products in the 20-28% THC range for a satisfying session.",
    connoisseur:
      "Go for the top-shelf selections with the highest potency and terpene profiles available.",
  };

  const strainInfo = strainDescriptions[strainType];

  return {
    strainType,
    strainLabel: strainInfo.label,
    strainDescription: strainInfo.description,
    categorySlug,
    categoryLabel,
    thcNote: experienceToThcNote[answers.experience] || "",
  };
}

// ─── Strain color map ───────────────────────────────────
const strainColors: Record<string, string> = {
  INDICA: "from-purple-600 to-purple-800",
  SATIVA: "from-amber-500 to-amber-700",
  HYBRID: "from-emerald-500 to-emerald-700",
};

const strainBorderColors: Record<string, string> = {
  INDICA: "border-purple-500/30",
  SATIVA: "border-amber-500/30",
  HYBRID: "border-emerald-500/30",
};

const strainTextColors: Record<string, string> = {
  INDICA: "text-purple-300",
  SATIVA: "text-amber-300",
  HYBRID: "text-emerald-300",
};

// ─── Component ──────────────────────────────────────────
export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [showResults, setShowResults] = useState(false);

  const totalQuestions = questions.length;
  const progress = showResults
    ? 100
    : ((currentStep) / totalQuestions) * 100;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Auto-advance after a brief delay for visual feedback
    setTimeout(() => {
      if (currentStep < totalQuestions - 1) {
        setDirection(1);
        setCurrentStep((prev) => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResults(false);
    setDirection(1);
  };

  const result = showResults ? getRecommendation(answers) : null;

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[#090F09]">
      {/* Header */}
      <div className="border-b border-emerald-900/30 bg-gradient-to-b from-emerald-950/20 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Strain Finder Quiz
              </h1>
              <p className="text-sm text-zinc-400">
                Discover your perfect match in 5 quick questions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {showResults
              ? "Results"
              : `Question ${currentStep + 1} of ${totalQuestions}`}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#111A11]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="relative min-h-[480px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {!showResults ? (
              <motion.div
                key={`question-${currentStep}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    {questions[currentStep].question}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    {questions[currentStep].subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {questions[currentStep].options.map((option) => {
                    const isSelected =
                      answers[questions[currentStep].id] === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        onClick={() =>
                          handleSelect(
                            questions[currentStep].id,
                            option.value
                          )
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex min-h-[88px] items-center gap-4 rounded-xl border p-4 text-left transition-all sm:min-h-[100px]",
                          isSelected
                            ? "border-emerald-500 bg-emerald-900/30 ring-1 ring-emerald-500/30"
                            : "border-emerald-900/30 bg-[#111A11] hover:border-emerald-700/40 hover:bg-[#152015]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-900/30 text-emerald-400"
                          )}
                        >
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {option.label}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {option.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              result && (
                <motion.div
                  key="results"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full"
                >
                  {/* Results card */}
                  <div className="mb-6 text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2,
                      }}
                      className={cn(
                        "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
                        strainColors[result.strainType]
                      )}
                    >
                      <Leaf className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-white sm:text-3xl"
                    >
                      Your Perfect Match:{" "}
                      <span className={strainTextColors[result.strainType]}>
                        {result.strainLabel}
                      </span>
                    </motion.h2>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={cn(
                      "mb-6 rounded-2xl border bg-[#111A11] p-6",
                      strainBorderColors[result.strainType]
                    )}
                  >
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {result.strainDescription}
                    </p>
                    {result.thcNote && (
                      <div className="mt-4 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3">
                        <p className="text-xs font-medium text-[#D4AF37]">
                          Potency Tip
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                          {result.thcNote}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <Link
                      href={`/products?category=${result.categorySlug}`}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-center font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-glow active:scale-[0.98]"
                    >
                      View {result.categoryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/products?category=${result.categorySlug}`}
                      className={cn(
                        "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-3 text-center font-semibold text-white transition-all hover:bg-white/5 active:scale-[0.98]",
                        strainBorderColors[result.strainType]
                      )}
                    >
                      Browse All {result.strainLabel} Strains
                    </Link>
                  </motion.div>

                  {/* Summary of answers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 rounded-2xl border border-emerald-900/30 bg-[#111A11] p-5"
                  >
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Your Answers
                    </h3>
                    <div className="space-y-2">
                      {questions.map((q) => {
                        const selected = q.options.find(
                          (o) => o.value === answers[q.id]
                        );
                        return (
                          <div
                            key={q.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-zinc-500">{q.question}</span>
                            <span className="font-medium text-zinc-300">
                              {selected?.label || "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Retake */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 text-center"
                  >
                    <button
                      onClick={handleReset}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Retake Quiz
                    </button>
                  </motion.div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!showResults && currentStep > 0 && (
          <div className="mt-4 flex justify-start">
            <button
              onClick={handleBack}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
