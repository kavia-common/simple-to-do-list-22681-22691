"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Task,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getApiBaseUrl,
} from "@/lib/api";

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message?: unknown }).message) : "Failed to load tasks";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [tasks]);

  async function onAddTask() {
    const title = newTitle.trim();
    const description = newDescription.trim();
    if (!title) return;

    // Optimistic create
    const tempId = `temp-${Date.now()}`;
    const optimistic: Task = {
      id: tempId,
      title,
      description: description || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [optimistic, ...prev]);
    setNewTitle("");
    setNewDescription("");

    try {
      const created = await createTask({
        title: optimistic.title,
        description: optimistic.description,
        completed: false,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? created : t))
      );
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message?: unknown }).message) : "Failed to create task";
      setError(msg);
      // revert
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  }

  async function onToggle(t: Task) {
    // optimistic toggle
    const nextCompleted = !t.completed;
    setTasks((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, completed: nextCompleted } : x))
    );
    try {
      const updated = await toggleTaskCompletion(t.id, nextCompleted);
      setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message?: unknown }).message) : "Failed to update task";
      setError(msg);
      // revert UI
      setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, completed: t.completed } : x)));
    }
  }

  function startEdit(t: Task) {
    setEditingId(t.id);
    setEditingTitle(t.title);
    setEditingDescription(t.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
  }

  async function saveEdit(id: string) {
    const title = editingTitle.trim();
    const description = editingDescription.trim();

    if (!title) {
      setError("Title cannot be empty");
      return;
    }

    const prev = tasks.find((t) => t.id === id);
    if (!prev) return;

    // optimistic edit
    const next: Task = { ...prev, title, description: description || undefined };
    setTasks((p) => p.map((t) => (t.id === id ? next : t)));
    setEditingId(null);

    try {
      const updated = await updateTask(id, {
        title: next.title,
        description: next.description,
        completed: next.completed,
      });
      setTasks((p) => p.map((t) => (t.id === id ? updated : t)));
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message?: unknown }).message) : "Failed to save task";
      setError(msg);
      // revert
      setTasks((p) => p.map((t) => (t.id === id ? (prev as Task) : t)));
    }
  }

  async function onDelete(id: string) {
    const prev = tasks;
    // optimistic remove
    setTasks((p) => p.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message?: unknown }).message) : "Failed to delete task";
      setError(msg);
      setTasks(prev);
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <span className="brand-badge" aria-hidden />
            <span>Ocean Tasks</span>
          </div>
          <div className="small mono">
            API: {getApiBaseUrl()}
          </div>
        </div>
      </nav>

      <main className="container space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Your Tasks</h1>
            <p className="small">Create, organize, and complete your work.</p>
          </div>
          <div className="chips" role="tablist" aria-label="Task filters">
            <button
              className={`chip ${filter === "all" ? "active" : ""}`}
              role="tab"
              aria-selected={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All <span className="badge badge-success">{counts.total}</span>
            </button>
            <button
              className={`chip ${filter === "active" ? "active" : ""}`}
              role="tab"
              aria-selected={filter === "active"}
              onClick={() => setFilter("active")}
            >
              Active <span className="badge">{counts.active}</span>
            </button>
            <button
              className={`chip ${filter === "completed" ? "active" : ""}`}
              role="tab"
              aria-selected={filter === "completed"}
              onClick={() => setFilter("completed")}
            >
              Completed <span className="badge">{counts.completed}</span>
            </button>
          </div>
        </header>

        {/* Add Task Card */}
        <section className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              className="input"
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="New task title"
            />
            <input
              className="input"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              aria-label="New task description"
            />
            <button
              className="btn btn-primary"
              onClick={onAddTask}
              aria-label="Add task"
              disabled={!newTitle.trim()}
            >
              Add Task
            </button>
          </div>
          <p className="small mt-2">
            Pro tip: Keep titles concise. Use description for details.
          </p>
        </section>

        {/* Error and Loading */}
        {error && (
          <div className="card p-3 border border-red-200" role="alert" aria-live="assertive">
            <div className="badge badge-error">Error</div>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}
        {loading && (
          <div className="card p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        )}

        {/* Task List */}
        {!loading && filtered.length === 0 && (
          <section className="card p-6 text-center">
            <p className="text-gray-600">No tasks to show for this filter.</p>
          </section>
        )}

        <section className="space-y-2">
          {filtered.map((t) => {
            const isEditing = editingId === t.id;
            return (
              <div
                key={t.id}
                className={`task-row ${t.completed ? "completed" : ""}`}
              >
                {/* Checkbox */}
                <button
                  className={`checkbox ${t.completed ? "checked" : ""}`}
                  aria-label={t.completed ? "Mark as active" : "Mark as completed"}
                  onClick={() => onToggle(t)}
                  title="Toggle complete"
                >
                  {t.completed ? "✓" : ""}
                </button>

                {/* Content */}
                <div className="min-w-0">
                  {!isEditing ? (
                    <>
                      <div className="task-title truncate">
                        {t.title}
                      </div>
                      {t.description && (
                        <div className="task-desc truncate">{t.description}</div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2">
                      <input
                        className="input"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        aria-label="Edit title"
                      />
                      <input
                        className="input"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        aria-label="Edit description"
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => saveEdit(t.id)}
                        aria-label="Save changes"
                      >
                        Save
                      </button>
                      <button className="btn btn-ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <button className="btn btn-ghost" onClick={() => startEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      <span style={{ color: "var(--color-error)" }}>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      <footer className="footer">
        <span>Built with Next.js 15 • Ocean Professional theme</span>
      </footer>
    </div>
  );
}
