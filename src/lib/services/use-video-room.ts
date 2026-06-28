"use client";

import { useCallback, useEffect, useState } from "react";
import { integrations, isRealVideoEnabled } from "./config";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface VideoParticipant {
  id: string;
  name: string;
  isLocal: boolean;
  micOn: boolean;
  cameraOn: boolean;
}

export interface UseVideoRoomOptions {
  roomId: string;
  identity: string;
  counterpartName: string;
}

export interface VideoRoom {
  provider: string;
  live: boolean;
  state: ConnectionState;
  local: VideoParticipant;
  remote: VideoParticipant;
  toggleMic: () => void;
  toggleCamera: () => void;
}

/**
 * Live-session video room.
 *
 * The stub simulates the connection lifecycle (connecting → connected) and
 * tracks local mic/camera state so the UI is fully interactive. When a real
 * provider (LiveKit/Daily) is configured via env, this hook is where the SDK
 * room would be created and its tracks wired to the same return shape.
 */
export function useVideoRoom({
  roomId,
  identity,
  counterpartName,
}: UseVideoRoomOptions): VideoRoom {
  const [state, setState] = useState<ConnectionState>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    // Simulate the connecting → connected lifecycle. A real provider would
    // resolve this from SDK room events instead of a timer.
    const timer = setTimeout(() => setState("connected"), 1400);
    return () => clearTimeout(timer);
  }, [roomId]);

  const toggleMic = useCallback(() => setMicOn((v) => !v), []);
  const toggleCamera = useCallback(() => setCameraOn((v) => !v), []);

  return {
    provider: integrations.video.provider,
    live: isRealVideoEnabled,
    state,
    local: {
      id: "local",
      name: identity,
      isLocal: true,
      micOn,
      cameraOn,
    },
    remote: {
      id: "remote",
      name: counterpartName,
      isLocal: false,
      micOn: true,
      cameraOn: true,
    },
    toggleMic,
    toggleCamera,
  };
}
