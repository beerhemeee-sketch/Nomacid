"use client";

import { useEffect, useMemo, useState } from "react";
import { Mic, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { priorityLabels, statusLabels, taskCategories } from "@/lib/labels";
import type { Profile, TeacherGroup } from "@/lib/types";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

type Draft = {
  title: string;
  description: string;
  category: string;
  priority: string;
  due_date: string;
  teacherIds: string[];
};

function dateString(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function inferDraft(text: string, teachers: Profile[]): Draft {
  const lower = text.toLowerCase();
  const category =
    lower.includes("10-р төв") || lower.includes("10р төв")
      ? "10-р төв"
      : lower.includes("рийл") || lower.includes("reel")
        ? "Рийл хийх"
        : lower.includes("контент")
          ? "Контент"
          : lower.includes("сургалт")
            ? "Сургалт"
            : "Бусад";
  const priority = lower.includes("яаралтай")
    ? "urgent"
    : lower.includes("өндөр")
      ? "high"
      : "normal";
  const due_date = lower.includes("маргааш")
    ? dateString(1)
    : lower.includes("өнөөдөр")
      ? dateString(0)
      : "";
  const teacherIds = teachers
    .filter((teacher) => {
      const name = (teacher.full_name || "").toLowerCase();
      const shortName = name.replace("багш", "").trim();
      return name && (lower.includes(name) || lower.includes(shortName));
    })
    .map((teacher) => teacher.id);

  return {
    title: text.split(/[.!?。]/)[0]?.trim().slice(0, 90) || "",
    description: text,
    category,
    priority,
    due_date,
    teacherIds
  };
}

export function TaskCreateForm({
  teachers,
  groups,
  action
}: {
  teachers: Profile[];
  groups: TeacherGroup[];
  action: (formData: FormData) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    title: "",
    description: "",
    category: "Бусад",
    priority: "normal",
    due_date: "",
    teacherIds: []
  });
  const [voiceText, setVoiceText] = useState("");
  const [listening, setListening] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const selectedTeachers = useMemo(
    () => new Set(draft.teacherIds),
    [draft.teacherIds]
  );

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    setSpeechSupported(
      Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
    );
  }, []);

  function applyDraft(text: string) {
    const next = inferDraft(text, teachers);
    setDraft(next);
    setVoiceText(text);
  }

  function startVoice() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setFallbackOpen(true);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "mn-MN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      applyDraft(transcript);
    };
    recognition.start();
  }

  return (
    <form action={action} className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeader className="mb-0">
            <CardTitle>Шинэ ажил</CardTitle>
            <CardDescription>Гол мэдээллээ л бөглөнө.</CardDescription>
          </CardHeader>
          <div className="flex gap-2">
            <Button type="button" onClick={startVoice} variant="outline">
              <Mic className="h-4 w-4" />
              {listening ? "Сонсож байна" : "Voice"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setFallbackOpen((open) => !open)}>
              <Wand2 className="h-4 w-4" />
              Draft
            </Button>
          </div>
        </div>

        {!speechSupported || fallbackOpen ? (
          <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-4">
            <Textarea
              value={voiceText}
              onChange={(event) => setVoiceText(event.target.value)}
              placeholder="Жишээ: Маргааш Ариун багш 10-р төвийн бэлтгэл шалгах яаралтай ажил..."
            />
            <Button type="button" variant="outline" onClick={() => applyDraft(voiceText)}>
              Draft үүсгэх
            </Button>
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Ажлын нэр</span>
            <Input
              name="title"
              required
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Тайлбар</span>
            <Textarea
              name="description"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              rows={4}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Ажлын төрөл</span>
              <Select
                name="category"
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              >
                {taskCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Яаралтай эсэх</span>
              <Select
                name="priority"
                value={draft.priority}
                onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
              >
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Дуусах хугацаа</span>
              <Input
                name="due_date"
                type="date"
                value={draft.due_date}
                onChange={(event) => setDraft({ ...draft, due_date: event.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Төлөв</span>
              <Select name="status" defaultValue="new">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <details className="rounded-3xl bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">Нэмэлт</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Эхлэх огноо</span>
                <Input name="start_date" type="date" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Дараалал</span>
                <Input name="sequence_order" type="number" defaultValue={0} />
              </label>
            </div>
          </details>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Хариуцагч</CardTitle>
          <CardDescription>Багш эсвэл баг сонгоно.</CardDescription>
        </CardHeader>
        {groups.length ? (
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            {groups.map((group) => (
              <label key={group.id} className="flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                <input name="group_ids" value={group.id} type="checkbox" className="h-4 w-4" />
                {group.name}
              </label>
            ))}
          </div>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          {teachers.map((teacher) => (
            <label
              key={teacher.id}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <input
                name="teacher_ids"
                value={teacher.id}
                type="checkbox"
                checked={selectedTeachers.has(teacher.id)}
                onChange={(event) => {
                  setDraft({
                    ...draft,
                    teacherIds: event.target.checked
                      ? [...draft.teacherIds, teacher.id]
                      : draft.teacherIds.filter((id) => id !== teacher.id)
                  });
                }}
                className="h-4 w-4"
              />
              {teacher.full_name || teacher.id}
            </label>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Үүсгэх</Button>
      </div>
    </form>
  );
}
