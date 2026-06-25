import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { CheckCircle, Circle, Moon, Sun, X } from "lucide-react";
import { createWindrunner } from "windrunner";

const STORAGE_KEY = "windrunner-todo-app-v1";
const STORAGE_THEME = "windrunner-todo-theme";
const initialTasks = [
  { id: 1, label: "Install Windrunner", done: true },
  { id: 2, label: "Build the Vite React todo app", done: false },
  { id: 3, label: "Experiment with utility classes", done: false },
];

const STATUS_LABELS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = window.localStorage.getItem(STORAGE_THEME);
    return savedTheme === "light" ? "light" : "dark";
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks(initialTasks);
      }
    }
  }, []);

  useEffect(() => {
    const runtime = createWindrunner({
      autoStart: false,
      id: "windrunner-todo-runtime",
      preflight: true,
      onReady: () => {
        document.documentElement.style.opacity = "1";
      },
    });

    runtime.start();
    return () => runtime.disconnect();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_THEME, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "active") return !task.done;
        if (filter === "completed") return task.done;
        return true;
      }),
    [tasks, filter]
  );

  const statusCount = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => !task.done).length,
      completed: tasks.filter((task) => task.done).length,
    }),
    [tasks]
  );

  const addTask = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setTasks((current) => [
      ...current,
      { id: Date.now(), label: text.trim(), done: false },
    ]);
    setText("");
  };

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((current) => current.filter((task) => !task.done));
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 opacity-90 transition-opacity duration-700 dark:from-violet-900 dark:via-fuchsia-700 dark:to-sky-700 dark:opacity-95" />
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl bg-slate-300/50 transition-colors duration-500 dark:bg-white/10" />
      <div className="absolute right-10 top-28 h-80 w-80 rounded-full blur-3xl bg-slate-400/40 transition-colors duration-500 dark:bg-sky-500/20" />

      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/95">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 text-slate-950 transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100">
            <span className="text-sm tracking-[0.35em] text-slate-300">TODO</span>
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-950 transition hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-violet-400 dark:hover:text-white"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="px-6 py-8 sm:p-10">
            <form className="space-y-4" onSubmit={addTask}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-[2rem] border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/50 transition dark:border-slate-800/70 dark:bg-slate-950/90 dark:shadow-slate-950/30">
                  <input
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Currently typing"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-200/50 transition hover:brightness-95 dark:bg-violet-500 dark:text-white dark:shadow-violet-500/20"
                >
                  Add item
                </button>
              </div>
            </form>

            <div className="mt-8 overflow-hidden space-y-3 rounded-[1.8rem] border border-slate-200 bg-white p-1 transition-colors duration-500 dark:border-slate-800/70 dark:bg-slate-950/95">
              {filteredTasks.length === 0 ? (
                <div className="rounded-[1.6rem] bg-slate-100 px-8 py-8 text-center text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
                  No items here yet.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 rounded-[1.6rem] bg-slate-50 px-5 py-4 shadow-sm transition hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-900/95"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition ${task.done ? "border-violet-400 bg-violet-500/15 text-violet-300" : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"}`}
                      >
                        {task.done ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <div>
                        <p className={`text-base font-medium ${task.done ? "text-slate-500 line-through" : "text-slate-950 dark:text-white"}`}>
                          {task.label}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-rose-500 hover:text-rose-500 dark:border-slate-800/70 dark:bg-slate-950/90 dark:text-slate-300 dark:hover:border-rose-500 dark:hover:text-rose-300"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[1.8rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <span>{statusCount.active} items left</span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {STATUS_LABELS.map((status) => (
                  <button
                    key={status.key}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === status.key ? "bg-violet-500 text-white shadow-sm shadow-violet-500/20" : "bg-slate-200/70 text-slate-700 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}
                    onClick={() => setFilter(status.key)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={clearCompleted}
                className="rounded-full border border-slate-200 bg-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-white"
              >
                Clear completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
