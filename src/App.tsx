import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Focus = "conditioning" | "strength" | "engine" | "skill";
type WorkoutStyle = "hyrox" | "crossfit" | "strength";
type WorkoutType = "AMRAP" | "For Time" | "EMOM" | "Strength";
type TimerMode = Extract<WorkoutType, "AMRAP" | "For Time" | "EMOM">;
type TimerPhase = "idle" | "preparing" | "running" | "paused" | "finished";
type AppTab = "today" | "clock" | "library" | "prs" | "log";
type Equipment =
  | "bodyweight"
  | "dumbbells"
  | "barbell"
  | "kettlebell"
  | "rower"
  | "jump rope"
  | "ski erg"
  | "sled"
  | "wall ball"
  | "box"
  | "pull-up bar";

type Workout = {
  id: string;
  name: string;
  type: WorkoutType;
  timeCapMinutes: number;
  focus: Focus;
  intensity: "moderate" | "hard" | "send it";
  style: WorkoutStyle;
  equipment: Equipment[];
  movements: string[];
  workout: string[];
  coachingCue: string;
  scaling: string;
};

type WorkoutLog = {
  score: string;
  notes: string;
  completed: boolean;
  completedAt?: string;
};

type StrengthUnit = "lb" | "kg";

type StrengthPR = {
  id: string;
  lift: string;
  weight: number;
  unit: StrengthUnit;
  reps: number;
  date: string;
  notes: string;
  createdAt: string;
};

const workouts: Workout[] = [
  {
    id: "barbell-burner",
    name: "Barbell Burner",
    type: "For Time",
    timeCapMinutes: 16,
    focus: "conditioning",
    intensity: "hard",
    style: "crossfit",
    equipment: ["barbell", "jump rope"],
    movements: ["Thrusters", "Double-unders", "Burpees"],
    workout: [
      "21-15-9 thrusters",
      "42-30-18 double-unders",
      "9-6-3 bar-facing burpees",
    ],
    coachingCue:
      "Break the thrusters before your shoulders force you to, then stay smooth on the rope.",
    scaling:
      "Use light thrusters and single-unders at 2x reps if double-unders are inconsistent.",
  },
  {
    id: "engine-room",
    name: "Engine Room",
    type: "AMRAP",
    timeCapMinutes: 20,
    focus: "engine",
    intensity: "moderate",
    style: "hyrox",
    equipment: ["rower", "kettlebell", "bodyweight"],
    movements: ["Rowing", "Kettlebell swings", "Box step-overs"],
    workout: [
      "250 meter row",
      "16 kettlebell swings",
      "12 box step-overs",
      "8 hand-release push-ups",
    ],
    coachingCue:
      "Hold a pace you can repeat after minute 12; this should feel like controlled pressure.",
    scaling:
      "Reduce the row to 200 meters and use Russian swings if overhead volume is too high.",
  },
  {
    id: "dumbbell-density",
    name: "Dumbbell Density",
    type: "EMOM",
    timeCapMinutes: 18,
    focus: "strength",
    intensity: "hard",
    style: "strength",
    equipment: ["dumbbells", "bodyweight"],
    movements: ["Dumbbell front squats", "Strict press", "Sit-ups"],
    workout: [
      "Minute 1: 12 dumbbell front squats",
      "Minute 2: 10 strict dumbbell presses",
      "Minute 3: 14 sit-ups",
      "Repeat for 6 rounds",
    ],
    coachingCue:
      "Choose dumbbells that let you finish the first two rounds with 15 seconds to spare.",
    scaling:
      "Lower reps to 8-8-12 or use one dumbbell in goblet and single-arm press variations.",
  },
  {
    id: "gymnastics-grind",
    name: "Gymnastics Grind",
    type: "AMRAP",
    timeCapMinutes: 15,
    focus: "skill",
    intensity: "hard",
    style: "crossfit",
    equipment: ["bodyweight", "jump rope"],
    movements: ["Pull-ups", "Push-ups", "Air squats", "Double-unders"],
    workout: [
      "5 pull-ups",
      "10 push-ups",
      "15 air squats",
      "30 double-unders",
    ],
    coachingCue:
      "Keep pull-ups small and crisp; the workout is won by avoiding long breaks.",
    scaling:
      "Sub ring rows for pull-ups, knee push-ups for push-ups, and single-unders for doubles.",
  },
  {
    id: "posterior-chain",
    name: "Posterior Chain Primer",
    type: "Strength",
    timeCapMinutes: 22,
    focus: "strength",
    intensity: "moderate",
    style: "strength",
    equipment: ["barbell", "kettlebell"],
    movements: ["Deadlifts", "Kettlebell lunges", "Plank holds"],
    workout: [
      "Every 4 minutes for 5 rounds:",
      "5 deadlifts at challenging load",
      "12 front-rack kettlebell reverse lunges",
      "45 second plank hold",
    ],
    coachingCue:
      "Treat each deadlift set as strength work: brace first, move the bar with intent.",
    scaling:
      "Use 5 rounds of 8 Romanian deadlifts if heavy pulls are not appropriate today.",
  },
  {
    id: "hotel-hustle",
    name: "Hotel Hustle",
    type: "For Time",
    timeCapMinutes: 14,
    focus: "conditioning",
    intensity: "send it",
    style: "crossfit",
    equipment: ["bodyweight"],
    movements: ["Burpees", "Air squats", "Mountain climbers"],
    workout: [
      "10-9-8-7-6-5-4-3-2-1",
      "Burpees",
      "Air squats",
      "After each round: 20 mountain climbers",
    ],
    coachingCue:
      "Move immediately between stations and breathe through the squats to recover.",
    scaling:
      "Step down and step up on burpees, or start at 8 reps instead of 10.",
  },
];

const workoutStyleOptions: Array<{
  value: WorkoutStyle;
  label: string;
  description: string;
}> = [
  {
    value: "hyrox",
    label: "Hyrox",
    description: "Running, carries, ergs, and station work.",
  },
  {
    value: "crossfit",
    label: "CrossFit",
    description: "Mixed modal WODs with classic couplets and chippers.",
  },
  {
    value: "strength",
    label: "Strength",
    description: "Lifting-focused sessions with simple accessories.",
  },
];

const libraryEquipmentOptions: Array<{ value: Equipment; label: string }> = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "rower", label: "Rower" },
  { value: "jump rope", label: "Jump rope" },
  { value: "ski erg", label: "Ski erg" },
  { value: "sled", label: "Sled" },
  { value: "wall ball", label: "Wall ball" },
  { value: "box", label: "Box" },
  { value: "pull-up bar", label: "Pull-up bar" },
];

const timerModes: Array<{
  value: TimerMode;
  label: string;
  description: string;
}> = [
  {
    value: "AMRAP",
    label: "AMRAP",
    description: "Countdown for as many rounds and reps as possible.",
  },
  {
    value: "EMOM",
    label: "EMOM",
    description: "Minute-by-minute intervals with a full clock cap.",
  },
  {
    value: "For Time",
    label: "For Time",
    description: "Stopwatch for completing the work before the cap.",
  },
];

const appTabs: Array<{ value: AppTab; label: string; description: string }> = [
  { value: "today", label: "Today", description: "WOD briefing" },
  { value: "clock", label: "Clock", description: "Workout timers" },
  { value: "library", label: "Library", description: "Find workouts" },
  { value: "prs", label: "PRs", description: "Strength records" },
  { value: "log", label: "Log", description: "Score and notes" },
];

const strengthLiftOptions = [
  "Bench Press",
  "Back Squat",
  "Deadlift",
  "Clean",
  "Clean and Jerk",
  "Snatch",
  "Overhead Squat",
  "Front Squat",
  "Strict Press",
  "Push Press",
  "Thruster",
] as const;

const prepDurationSeconds = 10;
const logStorageKey = "wod-forge-log";
const strengthRecordsStorageKey = "wod-forge-strength-prs";

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getWorkoutTimerMode(workoutType: WorkoutType): TimerMode {
  return workoutType === "AMRAP" ||
    workoutType === "EMOM" ||
    workoutType === "For Time"
    ? workoutType
    : "For Time";
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);

  return start;
}

function getInitialLog(): Record<string, WorkoutLog> {
  try {
    const savedLog = window.localStorage.getItem(logStorageKey);
    const parsedLog = savedLog ? JSON.parse(savedLog) : {};
    const todayKey = getDateKey(new Date());

    return Object.fromEntries(
      Object.entries(parsedLog as Record<string, WorkoutLog>).map(
        ([workoutId, log]) => [
          workoutId,
          log.completed && !log.completedAt
            ? { ...log, completedAt: todayKey }
            : log,
        ],
      ),
    );
  } catch {
    return {};
  }
}

function getInitialStrengthRecords(): StrengthPR[] {
  try {
    const savedRecords = window.localStorage.getItem(strengthRecordsStorageKey);
    return savedRecords ? JSON.parse(savedRecords) : [];
  } catch {
    return [];
  }
}

function normalizeWeightToPounds(weight: number, unit: StrengthUnit) {
  return unit === "kg" ? weight * 2.20462 : weight;
}

function formatStrengthWeight(record: StrengthPR) {
  return `${record.weight} ${record.unit}`;
}

const generatedWorkoutTemplates: Workout[] = [
  {
    id: "hyrox-engine-builder",
    name: "Hyrox Engine Builder",
    type: "For Time",
    timeCapMinutes: 28,
    focus: "engine",
    intensity: "hard",
    style: "hyrox",
    equipment: ["rower", "sled", "wall ball", "kettlebell"],
    movements: ["Row", "Sled push", "Farmers carry", "Wall balls"],
    workout: [
      "800 meter run",
      "750 meter row",
      "40 meter sled push",
      "100 meter farmers carry",
      "50 wall balls",
    ],
    coachingCue: "Keep the run controlled so the stations stay unbroken or close to it.",
    scaling: "Generated Hyrox-style station workout.",
  },
  {
    id: "crossfit-classic-mix",
    name: "CrossFit Classic Mix",
    type: "AMRAP",
    timeCapMinutes: 18,
    focus: "conditioning",
    intensity: "hard",
    style: "crossfit",
    equipment: ["barbell", "pull-up bar", "jump rope"],
    movements: ["Power cleans", "Pull-ups", "Double-unders"],
    workout: [
      "8 power cleans",
      "10 pull-ups",
      "40 double-unders",
      "12 burpees",
    ],
    coachingCue: "Pick small sets early and keep transitions tight.",
    scaling: "Generated CrossFit-style mixed modal workout.",
  },
  {
    id: "strength-total-builder",
    name: "Strength Total Builder",
    type: "Strength",
    timeCapMinutes: 30,
    focus: "strength",
    intensity: "moderate",
    style: "strength",
    equipment: ["barbell", "dumbbells", "box"],
    movements: ["Back squat", "Dumbbell rows", "Box step-ups"],
    workout: [
      "Every 5 minutes for 5 rounds:",
      "5 back squats",
      "10 dumbbell rows per side",
      "12 box step-ups",
    ],
    coachingCue: "Move with quality and add load only when every rep looks the same.",
    scaling: "Generated strength-focused session.",
  },
];

const movementSubstitutions: Array<{
  equipment: Equipment;
  patterns: string[];
  replacement: string;
  movement: string;
}> = [
  { equipment: "rower", patterns: ["row"], replacement: "run", movement: "Run" },
  { equipment: "ski erg", patterns: ["ski erg"], replacement: "run", movement: "Run" },
  { equipment: "sled", patterns: ["sled push", "sled pull"], replacement: "bear crawl", movement: "Bear crawl" },
  { equipment: "wall ball", patterns: ["wall balls", "wall ball"], replacement: "squat jumps", movement: "Squat jumps" },
  { equipment: "kettlebell", patterns: ["kettlebell", "farmers carry"], replacement: "backpack", movement: "Loaded backpack work" },
  { equipment: "barbell", patterns: ["power cleans", "back squats", "back squat", "barbell"], replacement: "dumbbell", movement: "Dumbbell variation" },
  { equipment: "dumbbells", patterns: ["dumbbell", "dumbbells"], replacement: "backpack", movement: "Backpack variation" },
  { equipment: "jump rope", patterns: ["double-unders", "single-unders", "jump rope"], replacement: "line hops", movement: "Line hops" },
  { equipment: "pull-up bar", patterns: ["pull-ups", "pull-up"], replacement: "bent-over backpack rows", movement: "Bent-over backpack rows" },
  { equipment: "box", patterns: ["box step-ups", "box step-overs", "box"], replacement: "reverse lunges", movement: "Reverse lunges" },
];

function adaptWorkoutToEquipment(
  template: Workout,
  availableEquipment: Equipment[],
): Workout {
  const missingEquipment = template.equipment.filter(
    (item) => item !== "bodyweight" && !availableEquipment.includes(item),
  );
  const substitutions = movementSubstitutions.filter((substitution) =>
    missingEquipment.includes(substitution.equipment),
  );

  if (substitutions.length === 0) {
    return template;
  }

  function adaptText(value: string) {
    return substitutions.reduce((currentValue, substitution) => {
      return substitution.patterns.reduce((nextValue, pattern) => {
        return nextValue.replace(new RegExp(pattern, "gi"), substitution.replacement);
      }, currentValue);
    }, value);
  }

  const movementSet = new Set(template.movements.map(adaptText));
  substitutions.forEach((substitution) => movementSet.add(substitution.movement));

  return {
    ...template,
    id: `${template.id}-adapted-${Date.now()}`,
    name: `${template.name} (Adapted)`,
    equipment: template.equipment.filter((item) => availableEquipment.includes(item)),
    movements: Array.from(movementSet),
    workout: template.workout.map(adaptText),
    scaling: `Auto-adapted for missing equipment: ${missingEquipment.join(", ")}.`,
  };
}

function App() {
  const [selectedWorkoutStyle, setSelectedWorkoutStyle] =
    useState<WorkoutStyle>("crossfit");
  const [availableLibraryEquipment, setAvailableLibraryEquipment] = useState<
    Equipment[]
  >(["bodyweight", "dumbbells", "rower"]);
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState(workouts[0].id);
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [logs, setLogs] = useState<Record<string, WorkoutLog>>(getInitialLog);
  const [strengthRecords, setStrengthRecords] = useState<StrengthPR[]>(
    getInitialStrengthRecords,
  );
  const [selectedStrengthLift, setSelectedStrengthLift] = useState<string>(
    strengthLiftOptions[0],
  );
  const [strengthWeight, setStrengthWeight] = useState("");
  const [strengthUnit, setStrengthUnit] = useState<StrengthUnit>("lb");
  const [strengthReps, setStrengthReps] = useState("1");
  const [strengthDate, setStrengthDate] = useState(getDateKey(new Date()));
  const [strengthNotes, setStrengthNotes] = useState("");
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("idle");
  const [activeTimerMode, setActiveTimerMode] = useState<TimerMode>(
    getWorkoutTimerMode(workouts[0].type),
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(prepDurationSeconds);
  const [customDurationMinutes, setCustomDurationMinutes] = useState(
    workouts[0].timeCapMinutes,
  );
  const [emomIntervalMinutes, setEmomIntervalMinutes] = useState(1);
  const activeWorkout = generatedWorkout ??
    workouts.find((workout) => workout.id === activeWorkoutId) ??
    workouts[0];

  const styleWorkouts = useMemo(() => {
    return workouts.filter((workout) => workout.style === selectedWorkoutStyle);
  }, [selectedWorkoutStyle]);

  const currentLog = logs[activeWorkout.id] ?? {
    completed: false,
    notes: "",
    score: "",
  };
  const completedWorkouts = Object.entries(logs)
    .filter(([, entry]) => entry.completed && entry.completedAt)
    .map(([workoutId, entry]) => ({
      log: entry,
      workout: workouts.find((workout) => workout.id === workoutId),
      workoutId,
    }));
  const completionsByDate = completedWorkouts.reduce<Record<string, typeof completedWorkouts>>(
    (dates, entry) => {
      const completedAt = entry.log.completedAt;

      if (!completedAt) {
        return dates;
      }

      return {
        ...dates,
        [completedAt]: [...(dates[completedAt] ?? []), entry],
      };
    },
    {},
  );
  const todayKey = getDateKey(new Date());
  const weekStart = getStartOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return date;
  });
  const workoutsCompletedThisWeek = completedWorkouts.filter(({ log }) => {
    if (!log.completedAt) {
      return false;
    }

    const completedDate = new Date(`${log.completedAt}T00:00:00`);
    return completedDate >= weekStart && completedDate <= weekEnd;
  });
  const completedCount = completedWorkouts.length;
  const sortedStrengthRecords = [...strengthRecords].sort((a, b) => {
    const dateSort = b.date.localeCompare(a.date);
    return dateSort === 0 ? b.createdAt.localeCompare(a.createdAt) : dateSort;
  });
  const selectedStrengthRecords = sortedStrengthRecords.filter(
    (record) => record.lift === selectedStrengthLift,
  );
  const heaviestStrengthRecordByLift = strengthRecords.reduce<
    Record<string, StrengthPR>
  >((records, record) => {
    const currentRecord = records[record.lift];
    const currentWeight = currentRecord
      ? normalizeWeightToPounds(currentRecord.weight, currentRecord.unit)
      : 0;
    const recordWeight = normalizeWeightToPounds(record.weight, record.unit);

    if (!currentRecord || recordWeight > currentWeight) {
      return {
        ...records,
        [record.lift]: record,
      };
    }

    return records;
  }, {});
  const strengthRecordCount = strengthRecords.length;
  const availableEquipmentCount = new Set(
    [...workouts, ...generatedWorkoutTemplates].flatMap((workout) => workout.equipment),
  ).size;
  const sanitizedDurationMinutes = Math.max(1, customDurationMinutes);
  const sanitizedEmomIntervalMinutes = Math.max(1, emomIntervalMinutes);
  const workoutDurationSeconds = sanitizedDurationMinutes * 60;
  const emomIntervalSeconds = sanitizedEmomIntervalMinutes * 60;
  const remainingSeconds = Math.max(workoutDurationSeconds - elapsedSeconds, 0);
  const timerHasFinished = timerPhase === "finished";
  const isClockMode = timerPhase !== "idle";
  const totalEmomIntervals = Math.ceil(
    workoutDurationSeconds / emomIntervalSeconds,
  );
  const emomCurrentInterval = Math.min(
    Math.floor(elapsedSeconds / emomIntervalSeconds) + 1,
    totalEmomIntervals,
  );
  const emomIntervalRemaining =
    timerHasFinished || elapsedSeconds === workoutDurationSeconds
      ? 0
      : emomIntervalSeconds - (elapsedSeconds % emomIntervalSeconds);
  const activeClockDisplay =
    activeTimerMode === "For Time"
      ? formatTime(elapsedSeconds)
      : activeTimerMode === "EMOM"
        ? formatTime(emomIntervalRemaining)
        : formatTime(remainingSeconds);
  const timerDisplay =
    timerPhase === "preparing" ? formatTime(prepSecondsLeft) : activeClockDisplay;
  const timerLabel =
    timerPhase === "preparing"
      ? "Get ready"
      : activeTimerMode === "For Time"
        ? "Elapsed time"
        : activeTimerMode === "EMOM"
          ? "Next interval starts in"
          : "Time remaining";
  const timerStatus =
    timerPhase === "preparing"
      ? "Your workout starts after the 10 second prep countdown."
      : timerHasFinished
        ? currentLog.completed
          ? "Workout saved to your log."
          : "Time cap reached. Stop to save this workout."
        : timerPhase === "paused"
          ? "Clock paused. Resume when you are ready."
          : activeTimerMode === "For Time"
            ? `Finish the work before the ${sanitizedDurationMinutes}:00 cap.`
            : activeTimerMode === "EMOM"
              ? `Interval ${emomCurrentInterval} of ${totalEmomIntervals} (${sanitizedEmomIntervalMinutes} min each).`
              : "Keep accumulating rounds and reps until the clock expires.";

  useEffect(() => {
    window.localStorage.setItem(logStorageKey, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    window.localStorage.setItem(
      strengthRecordsStorageKey,
      JSON.stringify(strengthRecords),
    );
  }, [strengthRecords]);

  useEffect(() => {
    setActiveTimerMode(getWorkoutTimerMode(activeWorkout.type));
    setTimerPhase("idle");
    setElapsedSeconds(0);
    setPrepSecondsLeft(prepDurationSeconds);
    setCustomDurationMinutes(activeWorkout.timeCapMinutes);
    setEmomIntervalMinutes(1);
  }, [activeWorkout.id, activeWorkout.type, activeWorkout.timeCapMinutes]);

  useEffect(() => {
    if (timerPhase !== "preparing") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPrepSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          setTimerPhase("running");
          return prepDurationSeconds;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerPhase]);

  useEffect(() => {
    if (timerPhase !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => {
        const nextSeconds = Math.min(currentSeconds + 1, workoutDurationSeconds);

        if (nextSeconds >= workoutDurationSeconds) {
          setTimerPhase("finished");
        }

        return nextSeconds;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerPhase, workoutDurationSeconds]);

  function chooseWorkout(workoutId: string) {
    setGeneratedWorkout(null);
    setActiveWorkoutId(workoutId);
    setActiveTab("today");
  }

  function toggleLibraryEquipment(equipment: Equipment) {
    setAvailableLibraryEquipment((currentEquipment) =>
      currentEquipment.includes(equipment)
        ? currentEquipment.filter((item) => item !== equipment)
        : [...currentEquipment, equipment],
    );
  }

  function generateWorkoutFromStyle() {
    const templates = generatedWorkoutTemplates.filter(
      (workout) => workout.style === selectedWorkoutStyle,
    );
    const sourceWorkouts = templates.length > 0 ? templates : styleWorkouts;
    const template = sourceWorkouts[Math.floor(Math.random() * sourceWorkouts.length)];
    const nextWorkout = adaptWorkoutToEquipment(
      template,
      availableLibraryEquipment,
    );

    setGeneratedWorkout(nextWorkout);
    setActiveWorkoutId(nextWorkout.id);
    setActiveTimerMode(getWorkoutTimerMode(nextWorkout.type));
    setCustomDurationMinutes(nextWorkout.timeCapMinutes);
    resetTimer();
    setActiveTab("today");
  }

  function resetTimer() {
    setTimerPhase("idle");
    setElapsedSeconds(0);
    setPrepSecondsLeft(prepDurationSeconds);
  }

  function handleStartPauseTimer() {
    if (timerPhase === "running") {
      setTimerPhase("paused");
      return;
    }

    if (timerPhase === "paused") {
      setTimerPhase("running");
      return;
    }

    setElapsedSeconds(0);
    setPrepSecondsLeft(prepDurationSeconds);
    setTimerPhase("preparing");
  }

  function stopAndSaveWorkout() {
    const completedAt = getDateKey(new Date());
    const fallbackScore =
      activeTimerMode === "For Time"
        ? `Stopped at ${formatTime(elapsedSeconds)}`
        : `${formatTime(elapsedSeconds)} elapsed`;

    setTimerPhase("finished");
    setPrepSecondsLeft(prepDurationSeconds);
    setLogs((currentLogs) => {
      const existingLog = currentLogs[activeWorkout.id] ?? currentLog;

      return {
        ...currentLogs,
        [activeWorkout.id]: {
          ...existingLog,
          completed: true,
          completedAt,
          score: existingLog.score || fallbackScore,
        },
      };
    });
  }

  function updateDurationMinutes(nextDuration: number) {
    setCustomDurationMinutes(Math.max(1, nextDuration));
    resetTimer();
  }

  function updateEmomIntervalMinutes(nextInterval: number) {
    setEmomIntervalMinutes(Math.max(1, nextInterval));
    resetTimer();
  }

  function selectTimerMode(mode: TimerMode) {
    setActiveTimerMode(mode);
    resetTimer();
  }

  function addStrengthRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedWeight = Number(strengthWeight);
    const parsedReps = Number(strengthReps);

    if (!parsedWeight || parsedWeight <= 0 || !parsedReps || parsedReps <= 0) {
      return;
    }

    const nextRecord: StrengthPR = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      lift: selectedStrengthLift,
      weight: parsedWeight,
      unit: strengthUnit,
      reps: parsedReps,
      date: strengthDate || getDateKey(new Date()),
      notes: strengthNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    setStrengthRecords((currentRecords) => [nextRecord, ...currentRecords]);
    setStrengthWeight("");
    setStrengthReps("1");
    setStrengthNotes("");
    setStrengthDate(getDateKey(new Date()));
  }

  function deleteStrengthRecord(recordId: string) {
    setStrengthRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId),
    );
  }

  function updateWorkoutLog(nextLog: Partial<WorkoutLog>) {
    setLogs((currentLogs) => {
      const existingLog = currentLogs[activeWorkout.id] ?? currentLog;
      const nextEntry = {
        ...existingLog,
        ...nextLog,
      };

      if (nextLog.completed === true && !nextEntry.completedAt) {
        nextEntry.completedAt = getDateKey(new Date());
      }

      if (nextLog.completed === false) {
        delete nextEntry.completedAt;
      }

      return {
        ...currentLogs,
        [activeWorkout.id]: nextEntry,
      };
    });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">CrossFit-style training planner</p>
          <h1>Wod Forge</h1>
          <p className="hero__lede">
            Build a WOD, run the right clock, and keep your training notes in
            one mobile-ready app.
          </p>
        </div>

        <div className="week-card" aria-label="Weekly training calendar">
          <div className="week-card__header">
            <div>
              <span className="hero-card__label">This week</span>
              <strong>{workoutsCompletedThisWeek.length} workouts done</strong>
            </div>
            <small>
              {getDateKey(weekStart)} to {getDateKey(weekEnd)}
            </small>
          </div>

          <div className="week-grid">
            {weekDays.map((date) => {
              const dateKey = getDateKey(date);
              const dayCompletions = completionsByDate[dateKey] ?? [];

              return (
                <div
                  className={`week-day${dateKey === todayKey ? " is-today" : ""}${
                    dayCompletions.length > 0 ? " has-workout" : ""
                  }`}
                  key={dateKey}
                >
                  <span>
                    {date.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <strong>{date.getDate()}</strong>
                  {dayCompletions.length > 0 && <small>{dayCompletions.length}</small>}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <nav className="tab-nav" aria-label="Primary app sections">
        {appTabs.map((tab) => (
          <button
            className={`tab-button${activeTab === tab.value ? " is-active" : ""}`}
            id={`${tab.value}-tab`}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            <strong>{tab.label}</strong>
            <span>{tab.description}</span>
          </button>
        ))}
      </nav>

      {activeTab === "today" && (
        <section className="tab-panel tab-panel--home" aria-labelledby="today-tab">
          <article className="hero__content">
            <p className="eyebrow">Today&apos;s workout</p>
            <h2>Forge your next WOD with intent.</h2>
            <p className="hero__lede">
              Review the selected workout, check your week at a glance, then
              jump to the clock when you are ready to train.
            </p>
            <div className="hero__actions">
              <button
                className="button button--ghost"
                onClick={() => setActiveTab("library")}
                type="button"
              >
                Choose workout
              </button>
              <button
                className="button button--secondary"
                onClick={() => setActiveTab("clock")}
                type="button"
              >
                Open clock
              </button>
            </div>
          </article>
        </section>
      )}

      {activeTab === "clock" && (
        <section className="tab-panel tab-panel--narrow" aria-labelledby="clock-tab">
          <article className={`timer-card${isClockMode ? " timer-card--focus" : ""}`}>
            <p className="eyebrow">WOD clock</p>
            <h2>{activeWorkout.name}</h2>

            {!isClockMode && (
              <>
                <div className="timer-modes" aria-label="Timer mode">
                  {timerModes.map((mode) => (
                    <button
                      className={`timer-mode${
                        activeTimerMode === mode.value ? " is-active" : ""
                      }`}
                      key={mode.value}
                      onClick={() => selectTimerMode(mode.value)}
                      type="button"
                    >
                      <strong>{mode.label}</strong>
                      <span>{mode.description}</span>
                    </button>
                  ))}
                </div>

                <div className="timer-settings">
                  <label>
                    Total time
                    <input
                      min="1"
                      type="number"
                      value={customDurationMinutes}
                      onChange={(event) =>
                        updateDurationMinutes(Number(event.target.value))
                      }
                    />
                    <small>minutes</small>
                  </label>

                  {activeTimerMode === "EMOM" && (
                    <label>
                      EMOM interval
                      <select
                        value={emomIntervalMinutes}
                        onChange={(event) =>
                          updateEmomIntervalMinutes(Number(event.target.value))
                        }
                      >
                        {[1, 2, 3, 4, 5].map((minutes) => (
                          <option key={minutes} value={minutes}>
                            {minutes} min
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </>
            )}

            <div className="clock-face">
              <p className="timer-label">{timerLabel}</p>
              <div className="timer" aria-live="polite">
                {timerDisplay}
              </div>
              <div className="timer-details">
                <span>{timerStatus}</span>
                <span>Elapsed {formatTime(elapsedSeconds)}</span>
                {activeTimerMode !== "For Time" && (
                  <span>Remaining {formatTime(remainingSeconds)}</span>
                )}
              </div>
            </div>

            <div className="timer-actions">
              {!isClockMode ? (
                <button
                  className="button button--primary"
                  onClick={handleStartPauseTimer}
                  type="button"
                >
                  Start
                </button>
              ) : timerHasFinished ? (
                currentLog.completed ? (
                  <button
                    className="button button--primary"
                    onClick={resetTimer}
                    type="button"
                  >
                    Set up next clock
                  </button>
                ) : (
                  <>
                    <button
                      className="button button--danger"
                      onClick={stopAndSaveWorkout}
                      type="button"
                    >
                      Stop
                    </button>
                    <button
                      className="button button--ghost"
                      onClick={resetTimer}
                      type="button"
                    >
                      Reset without saving
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    className="button button--primary"
                    disabled={timerPhase === "preparing"}
                    onClick={handleStartPauseTimer}
                    type="button"
                  >
                    {timerPhase === "paused" ? "Resume" : "Pause"}
                  </button>
                  <button
                    className="button button--danger"
                    onClick={stopAndSaveWorkout}
                    type="button"
                  >
                    Stop
                  </button>
                </>
              )}
            </div>
          </article>
        </section>
      )}

      {activeTab === "library" && (
        <section className="tab-panel" id="library" aria-labelledby="library-tab">
          <article className="library-builder">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Workout library</p>
                <h2>Generate a workout</h2>
              </div>
            </div>

            <div className="style-grid" aria-label="Workout style">
              {workoutStyleOptions.map((style) => (
                <button
                  className={`style-card${
                    selectedWorkoutStyle === style.value ? " is-active" : ""
                  }`}
                  key={style.value}
                  onClick={() => setSelectedWorkoutStyle(style.value)}
                  type="button"
                >
                  <strong>{style.label}</strong>
                  <span>{style.description}</span>
                </button>
              ))}
            </div>

            <div className="equipment-picker">
              <div>
                <p className="eyebrow">Available equipment</p>
                <h3>Tap what you have</h3>
                <p>
                  If equipment is missing, Wod Forge automatically swaps those
                  movements for available alternatives.
                </p>
              </div>
              <div className="equipment-chip-grid">
                {libraryEquipmentOptions.map((equipment) => (
                  <button
                    className={`equipment-chip${
                      availableLibraryEquipment.includes(equipment.value)
                        ? " is-active"
                        : ""
                    }`}
                    key={equipment.value}
                    onClick={() => toggleLibraryEquipment(equipment.value)}
                    type="button"
                  >
                    {equipment.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="button button--primary"
              onClick={generateWorkoutFromStyle}
              type="button"
            >
              Generate {workoutStyleOptions.find((style) => style.value === selectedWorkoutStyle)?.label} workout
            </button>
          </article>

          <section className="library">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Recommended workouts</p>
                <h2>{styleWorkouts.length} ready-made options</h2>
              </div>
            </div>

            <div className="library-grid">
              {styleWorkouts.map((workout) => (
                <button
                  className={`library-card${
                    workout.id === activeWorkout.id ? " is-active" : ""
                  }`}
                  key={workout.id}
                  onClick={() => chooseWorkout(workout.id)}
                  type="button"
                >
                  <span>{workout.style}</span>
                  <strong>{workout.name}</strong>
                  <small>
                    {workout.timeCapMinutes} min · {workout.type}
                  </small>
                  <small>{workout.movements.join(" / ")}</small>
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {activeTab === "prs" && (
        <section className="tab-panel tab-panel--narrow" aria-labelledby="prs-tab">
          <article className="pr-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Strength PRs</p>
                <h2>Record your lifts</h2>
              </div>
              <span className="pr-count">{strengthRecordCount} saved</span>
            </div>

            <div className="movement-grid" aria-label="Strength movements">
              {strengthLiftOptions.map((lift) => (
                <button
                  className={`movement-tile${
                    selectedStrengthLift === lift ? " is-active" : ""
                  }`}
                  key={lift}
                  onClick={() => setSelectedStrengthLift(lift)}
                  type="button"
                >
                  {lift}
                </button>
              ))}
            </div>

            <div className="pr-detail-header">
              <div>
                <p className="eyebrow">Selected movement</p>
                <h3>{selectedStrengthLift}</h3>
              </div>
              {heaviestStrengthRecordByLift[selectedStrengthLift] && (
                <span className="pr-best-badge">
                  🏆 {formatStrengthWeight(heaviestStrengthRecordByLift[selectedStrengthLift])}
                </span>
              )}
            </div>

            <form className="pr-form" onSubmit={addStrengthRecord}>
              <div className="pr-form-row">
                <label>
                  Weight
                  <input
                    min="0"
                    inputMode="decimal"
                    step="0.5"
                    type="number"
                    value={strengthWeight}
                    onChange={(event) => setStrengthWeight(event.target.value)}
                    placeholder="315"
                  />
                </label>
                <label>
                  Unit
                  <select
                    value={strengthUnit}
                    onChange={(event) =>
                      setStrengthUnit(event.target.value as StrengthUnit)
                    }
                  >
                    <option value="lb">lb</option>
                    <option value="kg">kg</option>
                  </select>
                </label>
              </div>

              <div className="pr-form-row">
                <label>
                  Reps
                  <input
                    min="1"
                    inputMode="numeric"
                    type="number"
                    value={strengthReps}
                    onChange={(event) => setStrengthReps(event.target.value)}
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={strengthDate}
                    onChange={(event) => setStrengthDate(event.target.value)}
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  value={strengthNotes}
                  onChange={(event) => setStrengthNotes(event.target.value)}
                  placeholder="How did it move? Any setup cues?"
                />
              </label>

              <button className="button button--primary" type="submit">
                Save {selectedStrengthLift} PR
              </button>
            </form>

            <div className="pr-history">
              <h3>{selectedStrengthLift} history</h3>
              {selectedStrengthRecords.length === 0 ? (
                <p>No {selectedStrengthLift} PRs saved yet.</p>
              ) : (
                selectedStrengthRecords.map((record) => {
                  const isHeaviest =
                    heaviestStrengthRecordByLift[record.lift]?.id === record.id;

                  return (
                    <div
                      className={`pr-record${isHeaviest ? " is-heaviest" : ""}`}
                      key={record.id}
                    >
                      <div className="pr-record-main">
                        <strong>
                          {isHeaviest ? "🏆 " : ""}
                          {record.lift}
                        </strong>
                        <span>
                          {formatStrengthWeight(record)} x {record.reps}
                        </span>
                        {record.notes && <small>{record.notes}</small>}
                      </div>
                      <div className="pr-record-meta">
                        <span>{record.date}</span>
                        {isHeaviest && <small>Heaviest for {record.lift}</small>}
                      </div>
                      <button
                        className="pr-delete-link"
                        onClick={() => deleteStrengthRecord(record.id)}
                        type="button"
                      >
                        Remove record
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>
      )}

      {activeTab === "log" && (
        <section className="tab-panel tab-panel--narrow" aria-labelledby="log-tab">
          <article className="log-card">
            <p className="eyebrow">Training log</p>
            <h2>{activeWorkout.name}</h2>
            <label>
              Score
              <input
                value={currentLog.score}
                onChange={(event) =>
                  updateWorkoutLog({ score: event.target.value })
                }
                placeholder="Rounds, reps, time, or load"
              />
            </label>
            <label>
              Notes
              <textarea
                value={currentLog.notes}
                onChange={(event) =>
                  updateWorkoutLog({ notes: event.target.value })
                }
                placeholder="How did it feel? What will you adjust next time?"
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={currentLog.completed}
                onChange={(event) =>
                  updateWorkoutLog({ completed: event.target.checked })
                }
              />
              Mark workout complete
            </label>
            {currentLog.completedAt && (
              <p className="completion-note">
                Synced to calendar for {currentLog.completedAt}.
              </p>
            )}
          </article>
        </section>
      )}
    </main>
  );
}

export default App;
