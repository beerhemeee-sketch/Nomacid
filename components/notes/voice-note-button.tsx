"use client";

import { useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";
import { createNoteAction } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function VoiceNoteButton() {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      setSupported(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((track) => track.stop());
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700 lg:bottom-6"
      >
        <Mic className="h-4 w-4" />
        Note
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Voice note</h2>
                <p className="text-sm text-slate-500">Богино тэмдэглэл.</p>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant={recording ? "destructive" : "outline"}
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recording ? "Зогсоох" : "Record"}
              </Button>
              {!supported ? <p className="self-center text-sm text-red-500">Audio дэмжихгүй байна.</p> : null}
            </div>

            {audioUrl ? <audio src={audioUrl} controls className="mb-4 w-full" /> : null}

            <form action={createNoteAction} className="space-y-3">
              <input type="hidden" name="type" value={audioUrl ? "audio" : "text"} />
              <Input name="title" placeholder="Гарчиг" required />
              <Select name="destination" defaultValue="Note">
                <option value="Note">Note</option>
                <option value="Мэдлэгийн сан">Мэдлэгийн сан</option>
              </Select>
              <Textarea name="content" placeholder="Нэмэлт тайлбар..." rows={3} />
              <p className="text-xs leading-5 text-slate-400">
                Audio storage дараагийн шатанд холбогдоно. Одоогоор note record хадгална.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Болих
                </Button>
                <Button type="submit" onClick={() => setOpen(false)}>
                  Хадгалах
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
