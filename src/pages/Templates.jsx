import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabaseClient";

const CATEGORIES = ["Fake Invoice", "Password Reset", "Urgent Request", "Smishing", "Fake Login"];

/* ---------- Quick-start presets ---------- */
const PRESETS = {
  "Fake Invoice": {
    subject: "[Action Required] Unpaid Invoice {{invoice_number}} due {{due_date}}",
    html: `
      <p>Hello {{name}},</p>
      <p>Our records show <strong>Invoice {{invoice_number}}</strong> for {{company}} remains unpaid and is due on <strong>{{due_date}}</strong>.</p>
      <p>Please review the invoice and complete payment using the secure link below:</p>
      <p><a href="{{action_link}}" target="_blank" rel="noopener">View Invoice</a></p>
      <p>If you have already paid, kindly disregard this message.</p>
      <p>Regards,<br>{{company}} Billing</p>
    `.trim(),
    text: `Hello {{name}}, Invoice {{invoice_number}} for {{company}} is due on {{due_date}}. View: {{action_link}}`,
  },
  "Password Reset": {
    subject: "Password Reset Request for {{company}} account",
    html: `
      <p>Hello {{name}},</p>
      <p>We received a request to reset your password. If this was you, use the link below within 30 minutes:</p>
      <p><a href="{{action_link}}" target="_blank" rel="noopener">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Security Team<br>{{company}}</p>
    `.trim(),
    text: `Reset your {{company}} password: {{action_link}} (expires in 30 minutes). If not you, ignore.`,
  },
  "Urgent Request": {
    subject: "URGENT: Immediate action required",
    html: `
      <p>Hi {{name}},</p>
      <p>This is urgent. I need you to review the attached document and confirm today.</p>
      <p>Use this link: <a href="{{action_link}}" target="_blank" rel="noopener">Open Document</a></p>
      <p>— {{manager_name}}</p>
    `.trim(),
    text: `Hi {{name}}, urgent — review & confirm today: {{action_link}} — {{manager_name}}`,
  },
  "Smishing": {
    subject: "",
    html: "",
    text: `{{company}}: Your account was flagged. Verify now: {{action_link}}`,
  },
  "Fake Login": {
    subject: "New sign-in detected — verify your account",
    html: `
      <p>Hello {{name}},</p>
      <p>We detected a new sign-in on your account. For your security, please verify this activity:</p>
      <p><a href="{{action_link}}" target="_blank" rel="noopener">Verify Activity</a></p>
      <p>If this wasn't you, we recommend changing your password immediately.</p>
      <p>{{company}} Security</p>
    `.trim(),
    text: `New sign-in on your {{company}} account. Verify: {{action_link}}`,
  },
};

const MERGE_TAGS = [
  "{{name}}",
  "{{email}}",
  "{{company}}",
  "{{department}}",
  "{{invoice_number}}",
  "{{due_date}}",
  "{{amount}}",
  "{{manager_name}}",
  "{{action_link}}",
];

export default function Templates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [q, setQ] = useState("");

  // Create form
  const {
    register: regCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    setValue: setCreate,
    watch: watchCreate,
    formState: { isSubmitting: creating },
  } = useForm();

  // Edit form
  const {
    register: regEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
    setValue: setEdit,
    watch: watchEdit,
    formState: { isSubmitting: updating },
  } = useForm();

  const createText = watchCreate("body_text") || "";
  const createHtml = watchCreate("body_html") || "";
  const editText = watchEdit("body_text") || "";
  const editHtml = watchEdit("body_html") || "";

  const applyPresetToCreate = useMemo(
    () => (name) => {
      const p = PRESETS[name];
      if (!p) return;
      const isSms = name === "Smishing";
      resetCreate({
        name: `${name} - ${new Date().toLocaleDateString()}`,
        category: name,
        subject: p.subject || "",
        body_html: isSms ? "" : p.html,
        body_text: p.text,
        is_sms: isSms,
      });
      // focus text area if SMS preset
      if (isSms) setTimeout(() => document.querySelector('[name="body_text"]')?.focus(), 0);
    },
    [resetCreate]
  );

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
    if (error) alert(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(v) {
    const { error } = await supabase.from("templates").insert({
      name: v.name,
      category: v.category,
      subject: v.subject || null,
      body_html: v.body_html || null,
      body_text: v.body_text || null,
      is_sms: !!v.is_sms,
    });
    if (error) return alert(error.message);
    await refresh();
    resetCreate();
    setOpenCreate(false);
  }

  function openEditModal(t) {
    setCurrent(t);
    resetEdit({
      name: t.name,
      category: t.category,
      subject: t.subject || "",
      body_html: t.body_html || "",
      body_text: t.body_text || "",
      is_sms: !!t.is_sms,
    });
    setOpenEdit(true);
  }

  async function onUpdate(v) {
    if (!current) return;
    const { error } = await supabase
      .from("templates")
      .update({
        name: v.name,
        category: v.category,
        subject: v.subject || null,
        body_html: v.body_html || null,
        body_text: v.body_text || null,
        is_sms: !!v.is_sms,
      })
      .eq("id", current.id);
    if (error) return alert(error.message);
    await refresh();
    setOpenEdit(false);
  }

  async function onDelete(id) {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) return alert(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function insertAtCursor(field, text) {
    const el = document.querySelector(`[name="${field}"]`);
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function onToggleSmsCreate(e) {
    if (!e.target.checked) return;
    setCreate("body_html", "");
    setTimeout(() => document.querySelector('[name="body_text"]')?.focus(), 0);
  }

  function onToggleSmsEdit(e) {
    if (!e.target.checked) return;
    setEdit("body_html", "");
    setTimeout(() => document.querySelector('dialog.modal.modal-open [name="body_text"]')?.focus(), 0);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(s) ||
        r.category?.toLowerCase().includes(s) ||
        r.subject?.toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Email & SMS Templates</h1>
        <div className="flex items-center gap-2">
          <input
            className="input input-bordered input-sm w-64"
            placeholder="Search name / category / subject..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={() => setOpenCreate(true)}>
            New Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <span className="loading loading-spinner loading-lg" />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="card bg-base-100 shadow md:col-span-3">
              <div className="card-body items-center text-center">
                <h2 className="card-title">No templates</h2>
                <p className="opacity-70">Create your first template to get started.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setOpenCreate(true)}>
                  New Template
                </button>
              </div>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="card-title">{t.name}</h2>
                      <p className="opacity-70">
                        {t.category}
                        {t.is_sms ? " • SMS" : ""}
                      </p>
                    </div>
                    <span className="badge badge-ghost">#{t.id}</span>
                  </div>

                  {t.subject && (
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Subject:</span> {t.subject}
                    </p>
                  )}

                  <div className="card-actions justify-end pt-2">
                    <button className="btn btn-outline btn-xs" onClick={() => openEditModal(t)}>
                      Edit
                    </button>
                    <button className="btn btn-outline btn-xs" onClick={() => window.alert(previewText(t))}>
                      Preview
                    </button>
                    <button className="btn btn-error btn-xs" onClick={() => onDelete(t.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {openCreate && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-2">New Template</h3>

            <PresetPicker onPick={applyPresetToCreate} />

            <form className="space-y-3 mt-3" onSubmit={handleCreate(onCreate)}>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    className="input input-bordered"
                    placeholder="Invoice Reminder - Oct"
                    {...regCreate("name", { required: true })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select className="select select-bordered" {...regCreate("category", { required: true })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Subject</span>
                </label>
                <input className="input input-bordered" placeholder="[Action Required] ..." {...regCreate("subject")} />
              </div>

              <MergeTags onInsert={(t) => insertAtCursor("body_text", t)} />

              <div className="grid lg:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Body (HTML)</span>
                  </label>
                  <textarea
                    name="body_html"
                    className="textarea textarea-bordered h-56 font-mono"
                    placeholder="<p>Hello {{name}}, ...</p>"
                    {...regCreate("body_html")}
                  />
                  <small className="opacity-60">
                    Use merge tags like <code>{'{{name}}'}</code>, <code>{'{{company}}'}</code>,{" "}
                    <code>{'{{action_link}}'}</code>
                  </small>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Body (Text) / SMS</span>
                  </label>
                  <textarea
                    name="body_text"
                    className="textarea textarea-bordered h-56 font-mono"
                    placeholder="Hello {{name}}, ..."
                    {...regCreate("body_text")}
                  />
                  <SmsCounter text={createText} />
                </div>
              </div>

              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox" {...regCreate("is_sms")} onChange={onToggleSmsCreate} />
                <span className="label-text">This is an SMS (Smishing) template</span>
              </label>

              <HtmlPreview html={createHtml} />

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setOpenCreate(false)}>
                  Cancel
                </button>
                <button className={`btn btn-primary ${creating ? "btn-disabled" : ""}`} type="submit">
                  {creating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onSubmit={() => setOpenCreate(false)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Edit Modal */}
      {openEdit && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-2">Edit Template</h3>
            <form className="space-y-3" onSubmit={handleEdit(onUpdate)}>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input className="input input-bordered" {...regEdit("name", { required: true })} />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select className="select select-bordered" {...regEdit("category", { required: true })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Subject</span>
                </label>
                <input className="input input-bordered" {...regEdit("subject")} />
              </div>

              <div className="grid lg:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Body (HTML)</span>
                  </label>
                  <textarea
                    name="body_html"
                    className="textarea textarea-bordered h-56 font-mono"
                    placeholder="<p>Hello {{name}}, ...</p>"
                    {...regEdit("body_html")}
                  />
                  <small className="opacity-60">
                    Use merge tags like <code>{'{{name}}'}</code>, <code>{'{{company}}'}</code>,{" "}
                    <code>{'{{action_link}}'}</code>
                  </small>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Body (Text) / SMS</span>
                  </label>
                  <textarea
                    name="body_text"
                    className="textarea textarea-bordered h-56 font-mono"
                    placeholder="Hello {{name}}, ..."
                    {...regEdit("body_text")}
                  />
                  <SmsCounter text={editText} />
                </div>
              </div>

              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox" {...regEdit("is_sms")} onChange={onToggleSmsEdit} />
                <span className="label-text">This is an SMS (Smishing) template</span>
              </label>

              <HtmlPreview html={editHtml} />

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setOpenEdit(false)}>
                  Cancel
                </button>
                <button className={`btn btn-primary ${updating ? "btn-disabled" : ""}`} type="submit">
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onSubmit={() => setOpenEdit(false)}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

/* ---------- Small helpers ---------- */

function PresetPicker({ onPick }) {
  return (
    <div className="alert bg-base-200">
      <div>
        <span className="font-semibold mr-2">Quick start:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} type="button" className="btn btn-xs mr-2 mb-1" onClick={() => onPick(k)}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function MergeTags({ onInsert }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm opacity-70">Insert tag:</span>
      {MERGE_TAGS.map((t) => (
        <button key={t} type="button" className="btn btn-xs" onClick={() => onInsert(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

function HtmlPreview({ html }) {
  if (!html?.trim()) return null;
  return (
    <div className="mt-2">
      <div className="mb-1 text-sm opacity-70">Preview</div>
      <div className="rounded border bg-base-200">
        <iframe
          title="preview"
          className="w-full h-60 rounded"
          sandbox="allow-same-origin"
          srcDoc={`<!doctype html><html><head><meta charset="utf-8" /></head><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding:16px">${html}</body></html>`}
        />
      </div>
    </div>
  );
}

function SmsCounter({ text }) {
  if (!text) return null;
  const len = [...text].length;
  const segs = Math.max(1, Math.ceil(len / 160));
  return (
    <div className="mt-1 text-xs opacity-70">
      SMS length: {len} chars · ~{segs} segment{segs > 1 ? "s" : ""}
    </div>
  );
}

function previewText(t) {
  return [
    `Name: ${t.name}`,
    `Category: ${t.category}${t.is_sms ? " • SMS" : ""}`,
    t.subject ? `Subject: ${t.subject}` : null,
    t.body_text ? `\nText:\n${t.body_text}` : null,
    t.body_html ? `\nHTML:\n${t.body_html}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
