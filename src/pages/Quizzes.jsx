import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "../lib/supabaseClient";

export default function Quizzes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [openEditor, setOpenEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openTaker, setOpenTaker] = useState(false);
  const [current, setCurrent] = useState(null);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      r.title?.toLowerCase().includes(s) ||
      r.thumb_url?.toLowerCase().includes(s)
    );
  }, [rows, q]);

  function onAddQuiz() {
    setEditing(null);
    setOpenEditor(true);
  }

  function onEditQuiz(row) {
    setEditing(row);
    setOpenEditor(true);
  }

  async function onDeleteQuiz(id) {
    if (!confirm("Delete this quiz?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) return alert(error.message);
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function onStartQuiz(row) {
    setCurrent(row);
    setOpenTaker(true);
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb + header */}
      <div className="flex items-center justify-between">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>Home</li>
            <li>Quiz</li>
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <div className="join">
            <input
              className="input input-bordered input-sm join-item w-64"
              placeholder="Search..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <button className="btn btn-sm join-item">Filter</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <span className="loading loading-spinner loading-lg" />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <QuizCard
              key={r.id}
              quiz={r}
              onEdit={() => onEditQuiz(r)}
              onDelete={() => onDeleteQuiz(r.id)}
              onStart={() => onStartQuiz(r)}
            />
          ))}

          {/* Add Quiz card */}
          <button
            className="card bg-base-100 shadow border-dashed border-2 hover:border-primary hover:text-primary transition-colors aspect-video"
            onClick={onAddQuiz}
          >
            <div className="card-body items-center justify-center">
              <div className="text-5xl">+</div>
              <div className="mt-2 text-lg font-semibold">Add Quiz</div>
            </div>
          </button>
        </div>
      )}

      {/* Editor modal */}
      {openEditor && (
        <QuizEditorModal
          initial={editing}
          onClose={() => setOpenEditor(false)}
          onSaved={async () => { setOpenEditor(false); await refresh(); }}
        />
      )}

      {/* Taker modal */}
      {openTaker && current && (
        <QuizTakerModal
          quiz={current}
          onClose={() => { setOpenTaker(false); setCurrent(null); }}
        />
      )}
    </div>
  );
}

/* ---------- Card ---------- */
function QuizCard({ quiz, onEdit, onDelete, onStart }) {
  return (
    <div className="card bg-base-100 shadow border overflow-hidden">
      <figure className="aspect-video bg-base-200">
        {quiz.thumb_url ? (
          <img src={quiz.thumb_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center opacity-60">No image</div>
        )}
      </figure>
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-xl leading-tight">{quiz.title}</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-xs" title="Edit" onClick={onEdit}>✎</button>
            <button className="btn btn-ghost btn-xs" title="Delete" onClick={onDelete}>🗑️</button>
          </div>
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={onStart}>Start</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Editor Modal (enforces exactly 10 questions) ---------- */
function QuizEditorModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const {
    register, handleSubmit, control, reset, watch, formState: { isSubmitting }
  } = useForm({
    defaultValues: isEdit ? {
      title: initial.title,
      thumb_url: initial.thumb_url || "",
      questions: fromConfig(initial.config_json),
    } : {
      title: "",
      thumb_url: "",
      questions: makeBlankQuestions(10),
    }
  });

  const { fields, update } = useFieldArray({ control, name: "questions" });
  const questions = watch("questions");

  // Always keep 10 items (pad if fewer)
  useEffect(() => {
    if (questions.length !== 10) {
      reset(v => ({ ...v, questions: makeBlankQuestions(10, v.questions) }));
    }
  }, [questions.length, reset]);

  async function onSubmit(values) {
    const config = toConfig(values.questions);
    const payload = { title: values.title, thumb_url: values.thumb_url, config_json: config };

    if (isEdit) {
      const { error } = await supabase.from("quizzes").update(payload).eq("id", initial.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("quizzes").insert(payload);
      if (error) return alert(error.message);
    }
    onSaved();
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-5xl">
        <h3 className="font-bold text-lg">{isEdit ? "Edit Quiz" : "Add Quiz"}</h3>

        <form className="space-y-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Title</span></label>
              <input className="input input-bordered" placeholder="Security Awareness Quiz" {...register("title", { required: true })} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Thumbnail URL</span></label>
              <input className="input input-bordered" placeholder="https://…" {...register("thumb_url")} />
            </div>
          </div>

          <div className="alert bg-base-200">
            <span className="font-semibold mr-2">Questions</span>
            <span className="opacity-70">(Exactly 10; each with 4 options and one correct answer)</span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {fields.map((f, idx) => (
              <div key={f.id} className="card bg-base-100 border">
                <div className="card-body p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Q{idx + 1}</div>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={() => update(idx, makeBlankQuestions(1)[0])}
                      title="Clear this question"
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    className="input input-bordered"
                    placeholder="Question text..."
                    {...register(`questions.${idx}.text`, { required: true })}
                  />
                  <div className="grid md:grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <input
                        key={i}
                        className="input input-bordered"
                        placeholder={`Option ${i + 1}`}
                        {...register(`questions.${idx}.options.${i}`, { required: true })}
                      />
                    ))}
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Correct option (1-4)</span></label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      className="input input-bordered w-28"
                      {...register(`questions.${idx}.answer`, { valueAsNumber: true, min: 1, max: 4, required: true })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className={`btn btn-primary ${isSubmitting ? "btn-disabled" : ""}`} type="submit">
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}

/* ---------- Taker Modal ---------- */
function QuizTakerModal({ quiz, onClose }) {
  const cfg = fromConfig(quiz.config_json);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { answers: Array(10).fill(null) }
  });
  const answers = watch("answers");

  async function onSubmit(values) {
    const score = grade(cfg, values.answers);
    // Save attempt
    await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      score,
      submitted_at: new Date().toISOString(),
    });
    alert(`Score: ${score}/10`);
    onClose();
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-5xl">
        <h3 className="font-bold text-lg">{quiz.title}</h3>
        <form className="space-y-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {cfg.map((q, idx) => (
              <div key={idx} className="card bg-base-100 border">
                <div className="card-body p-4">
                  <div className="font-semibold mb-2">Q{idx + 1}. {q.text}</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="cursor-pointer flex items-center gap-2 p-2 rounded hover:bg-base-200">
                        <input
                          type="radio"
                          className="radio"
                          value={i}
                          {...register(`answers.${idx}`, { required: true })}
                          checked={String(answers?.[idx]) === String(i)}
                          onChange={()=>{}}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" type="submit">Submit</button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}

/* ---------- helpers ---------- */

// Empty question(s); optionally seed from existing array
function makeBlankQuestions(n, existing = []) {
  const out = [...existing];
  while (out.length < 10 && out.length < n + (existing?.length || 0)) {
    out.push({ text: "", options: ["", "", "", ""], answer: 1 });
  }
  // If caller asked for exactly n and existing was empty:
  if (existing.length === 0 && n) {
    return Array.from({ length: n }, () => ({ text: "", options: ["", "", "", ""], answer: 1 }));
  }
  return out;
}

// Convert config_json -> questions array
function fromConfig(cfg) {
  if (!cfg) return makeBlankQuestions(10);
  try {
    const parsed = typeof cfg === "string" ? JSON.parse(cfg) : cfg;
    // normalize
    const q = (parsed?.questions || parsed || []).slice(0, 10).map((x) => ({
      text: x.text || "",
      options: (x.options || ["", "", "", ""]).slice(0, 4).concat(Array(4).fill("")).slice(0, 4),
      answer: Number(x.answer || 1),
    }));
    while (q.length < 10) q.push({ text: "", options: ["", "", "", ""], answer: 1 });
    return q;
  } catch {
    return makeBlankQuestions(10);
  }
}

// Convert questions array -> config_json shape
function toConfig(questions) {
  return { questions: questions.map(q => ({
    text: String(q.text || ""),
    options: (q.options || ["", "", "", ""]).slice(0, 4),
    answer: Number(q.answer || 1),
  })) };
}

// Simple grading: answers is array of option indexes (0-3)
function grade(questions, answers) {
  let score = 0;
  for (let i = 0; i < 10; i++) {
    const correctIdx = Number(questions[i]?.answer ?? 1) - 1; // stored 1-4
    const picked = Number(answers?.[i]);
    if (picked === correctIdx) score++;
  }
  return score;
}
