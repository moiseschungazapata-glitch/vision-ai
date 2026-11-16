"use client";

import { useEffect, useState } from "react";
import { DEFAULT_VISION_STATE, loadVisionState, saveVisionState } from "@/services/vision-local-repository";
import type { CameraRecord, EventRecord, ReportRecord, UiSettings, UserProfile, VisionState } from "@/types/vision";

export function useVisionStore() {
  const [state, setState] = useState<VisionState>(DEFAULT_VISION_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadVisionState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveVisionState(state);
  }, [ready, state]);

  const addCamera = (camera: CameraRecord) => setState(current => ({ ...current, cameras: [camera, ...current.cameras] }));
  const updateEvent = (id: string, patch: Partial<EventRecord>) => setState(current => ({
    ...current,
    events: current.events.map(event => event.id === id ? { ...event, ...patch } : event),
  }));
  const addReport = (report: ReportRecord) => setState(current => ({ ...current, reports: [report, ...current.reports] }));
  const updateSettings = (settings: UiSettings) => setState(current => ({ ...current, settings }));
  const updateProfile = (profile: UserProfile) => setState(current => ({ ...current, profile }));
  const reset = () => setState(DEFAULT_VISION_STATE);

  return { ...state, ready, addCamera, updateEvent, addReport, updateSettings, updateProfile, reset };
}
