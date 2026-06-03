import { useEffect, useMemo, useState } from "react";

type Focus = "conditioning" | "strength" | "engine" | "skill";
type WorkoutType = "AMRAP" | "For Time" | "EMOM" | "Strength";
type TimerMode = Extract<WorkoutType, "AMRAP" | "For Time" | "EMOM">;
type TimerPhase = "idle" | "preparing" | "running" | "paused" | "finished";
type AppTab = "today" | "clock" | "library" | "log";
type Equipment =
  | "bodyweight"
  | "dumbbells"
  | "barbell"
  | "kettlebell"
  | "rower"
  | "jump rope";

type Workout = {
  id: string;
  name: string;
  type: WorkoutType;
  timeCapMinutes: number;
  focus: Focus;
  intensity: "moderate" | "hard" | "send it";
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
};

const workouts: Workout[] = [
  {
    id: "barbell-burner",
    name: "Barbell Burner",
    type: "For Time",
    timeCapMinutes: 16,
    focus: "conditioning",
    intensity: "hard",
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

const focusOptions: Array<{ value: Focus | "any"; label: string }> = [
  { value: "any", label: "Any focus" },
  { value: "conditioning", label: "Conditioning" },
  { value: "strength", label: "Strength" },
  { value: "engine", label: "Engine" },
  { value: "skill", label: "Skill" },
];

const equipmentOptions: Array<{ value: Equipment | "any"; label: string }> = [
  { value: "any", label: "Any equipment" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "rower", label: "Rower" },
  { value: "jump rope", label: "Jump rope" },
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
  { value: "log", label: "Log", description: "Score and notes" },
];

const prepDurationSeconds = 10;
const logStorageKey = "wod-forge-log";

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

function getInitialLog(): Record<string, WorkoutLog> {
  try {
    const savedLog = window.localStorage.getItem(logStorageKey);
    return savedLog ? JSON.parse(savedLog) : {};
  } catch {
    return {};
  }
}

function App() {
  const [selectedFocus, setSelectedFocus] = useState<Focus | "any">("any");
  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | "any">("any");
  const [activeWorkoutId, setActiveWorkoutId] = useState(workouts[0].id);
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [logs, setLogs] = useState<Record<string, WorkoutLog>>(getInitialLog);
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
  const activeWorkout = workouts.find((workout) => workout.id === activeWorkoutId)
    ?? workouts[0];

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const focusMatch =
        selectedFocus === "any" || workout.focus === selectedFocus;
      const equipmentMatch =
        selectedEquipment === "any" ||
        workout.equipment.includes(selectedEquipment);

      return focusMatch && equipmentMatch;
    });
  }, [selectedEquipment, selectedFocus]);

  const currentLog = logs[activeWorkout.id] ?? {
    completed: false,
    notes: "",
    score: "",
  };

  const completedCount = Object.values(logs).filter(
    (entry) => entry.completed,
  ).length;
  const availableEquipmentCount = new Set(
    workouts.flatMap((workout) => workout.equipment),
  ).size;
  const sanitizedDurationMinutes = Math.max(1, customDurationMinutes);
  const sanitizedEmomIntervalMinutes = Math.max(1, emomIntervalMinutes);
  const workoutDurationSeconds = sanitizedDurationMinutes * 60;
  const emomIntervalSeconds = sanitizedEmomIntervalMinutes * 60;
  const remainingSeconds = Math.max(workoutDurationSeconds - elapsedSeconds, 0);
  const timerHasFinished = timerPhase === "finished";
  const isTimerActive = timerPhase === "preparing" || timerPhase === "running";
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
        ? "Time cap reached"
        : activeTimerMode === "For Time"
          ? `Finish the work before the ${sanitizedDurationMinutes}:00 cap.`
          : activeTimerMode === "EMOM"
            ? `Interval ${emomCurrentInterval} of ${totalEmomIntervals} (${sanitizedEmomIntervalMinutes} min each).`
            : "Keep accumulating rounds and reps until the clock expires.";

  useEffect(() => {
    window.localStorage.setItem(logStorageKey, JSON.stringify(logs));
  }, [logs]);

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

        <div className="hero-card" aria-label="Training summary">
          <span className="hero-card__label">Today&apos;s pick</span>
          <strong>{activeWorkout.name}</strong>
          <span>{activeWorkout.type}</span>
          <div className="metric-grid">
            <div>
              <span>{workouts.length}</span>
              <small>WODs</small>
            </div>
            <div>
              <span>{completedCount}</span>
              <small>Logged</small>
            </div>
            <div>
              <span>{availableEquipmentCount}</span>
              <small>Gear types</small>
            </div>
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
        <section className="tab-panel" aria-labelledby="today-tab">
          <article className="hero__content">
            <p className="eyebrow">Today&apos;s workout</p>
            <h2>Forge your next WOD with intent.</h2>
            <p className="hero__lede">
              Generate a fresh session, review the plan, then jump to the clock
              tab when you are ready to train.
            </p>
            <div className="hero__actions">
              <button
                className="button button--primary"
                onClick={generateWorkout}
                type="button"
              >
                Generate WOD
              </button>
              <button
                className="button button--ghost"
                onClick={() => setActiveTab("library")}
                type="button"
              >
                Browse library
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

          <article className="workout-panel">
            <div className="section-heading">
              <p className="eyebrow">Workout briefing</p>
              <h2>{activeWorkout.name}</h2>
            </div>

            <div className="tag-row">
              <span>{activeWorkout.type}</span>
              <span>{activeWorkout.focus}</span>
              <span>{activeWorkout.intensity}</span>
              <span>{activeWorkout.timeCapMinutes} min cap</span>
            </div>

            <ol className="workout-steps">
              {activeWorkout.workout.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className="coach-note">
              <h3>Coach&apos;s cue</h3>
              <p>{activeWorkout.coachingCue}</p>
            </div>

            <div className="coach-note coach-note--muted">
              <h3>Scaling option</h3>
              <p>{activeWorkout.scaling}</p>
            </div>

            <div className="equipment-list">
              {activeWorkout.equipment.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "clock" && (
        <section className="tab-panel tab-panel--narrow" aria-labelledby="clock-tab">
          <article className="timer-card">
            <p className="eyebrow">WOD clock</p>
            <h2>{activeWorkout.name}</h2>
            <div className="timer-modes" aria-label="Timer mode">
              {timerModes.map((mode) => (
                <button
                  className={`timer-mode${
                    activeTimerMode === mode.value ? " is-active" : ""
                  }`}
                  disabled={isTimerActive}
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
            <div className="timer-actions">
              <button
                className="button button--primary"
                disabled={timerHasFinished || timerPhase === "preparing"}
                onClick={handleStartPauseTimer}
                type="button"
              >
                {timerPhase === "running" ? "Pause" : "Start"}
              </button>
              <button
                className="button button--ghost"
                onClick={resetTimer}
                type="button"
              >
                Reset
              </button>
            </div>
          </article>
        </section>
      )}

      {activeTab === "library" && (
        <section className="tab-panel" id="library" aria-labelledby="library-tab">
          <section className="controls" aria-label="Workout filters">
            <label>
              Focus
              <select
                value={selectedFocus}
                onChange={(event) =>
                  setSelectedFocus(event.target.value as Focus | "any")
                }
              >
                {focusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Equipment
              <select
                value={selectedEquipment}
                onChange={(event) =>
                  setSelectedEquipment(event.target.value as Equipment | "any")
                }
              >
                {equipmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button button--secondary"
              onClick={generateWorkout}
              type="button"
            >
              Random from filters
            </button>
          </section>

          <section className="library">
            <div className="section-heading">
              <p className="eyebrow">Workout library</p>
              <h2>{filteredWorkouts.length || workouts.length} workouts ready</h2>
            </div>

            <div className="library-grid">
              {(filteredWorkouts.length > 0 ? filteredWorkouts : workouts).map(
                (workout) => (
                  <button
                    className={`library-card${
                      workout.id === activeWorkout.id ? " is-active" : ""
                    }`}
                    key={workout.id}
                    onClick={() => chooseWorkout(workout.id)}
                    type="button"
                  >
                    <span>{workout.type}</span>
                    <strong>{workout.name}</strong>
                    <small>
                      {workout.timeCapMinutes} min · {workout.focus}
                    </small>
                    <small>{workout.movements.join(" / ")}</small>
                  </button>
                ),
              )}
            </div>
          </section>
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
          </article>
        </section>
      )}
    </main>
  );
}

export default App;
