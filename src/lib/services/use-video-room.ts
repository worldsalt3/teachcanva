"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RemoteTrack,
  Room,
  LocalTrackPublication,
  RemoteParticipant,
} from "livekit-client";
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
  /** True once a remote participant has actually joined (live mode only). */
  remoteConnected: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  /** Callback refs: pass to <video> elements to render the real tracks. */
  attachLocalVideo: (el: HTMLVideoElement | null) => void;
  attachRemoteVideo: (el: HTMLVideoElement | null) => void;
  /** Access token + server URL when a real provider is configured. */
  token: string | null;
  serverUrl: string | null;
}

/**
 * Live-session video room.
 *
 * With LiveKit configured (NEXT_PUBLIC_VIDEO_PROVIDER=livekit) this connects
 * a real Room: mints a token from /api/video/token, publishes camera + mic,
 * and exposes callback refs that attach the local/remote video tracks to
 * <video> elements. Without a provider, the stub simulates the connection
 * lifecycle so the UI stays fully interactive.
 */
export function useVideoRoom({
  roomId,
  identity,
  counterpartName,
}: UseVideoRoomOptions): VideoRoom {
  const [state, setState] = useState<ConnectionState>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const localElRef = useRef<HTMLVideoElement | null>(null);
  const remoteElRef = useRef<HTMLVideoElement | null>(null);
  const audioEls = useRef<HTMLMediaElement[]>([]);

  const attachLocalTrack = useCallback(() => {
    const room = roomRef.current;
    const el = localElRef.current;
    if (!room || !el) return;
    for (const pub of room.localParticipant.videoTrackPublications.values()) {
      pub.track?.attach(el);
    }
  }, []);

  const attachRemoteTrack = useCallback((track: RemoteTrack) => {
    if (track.kind === "video") {
      if (remoteElRef.current) track.attach(remoteElRef.current);
    } else if (track.kind === "audio") {
      const el = track.attach();
      el.style.display = "none";
      document.body.appendChild(el);
      audioEls.current.push(el);
    }
  }, []);

  // Stub lifecycle: simulate connecting → connected.
  useEffect(() => {
    if (isRealVideoEnabled) return;
    const timer = setTimeout(() => setState("connected"), 1400);
    return () => clearTimeout(timer);
  }, [roomId]);

  // Real lifecycle: token → LiveKit Room → publish mic/camera.
  useEffect(() => {
    if (!isRealVideoEnabled) return;
    let cancelled = false;
    let room: Room | null = null;

    const connect = async () => {
      const res = await fetch("/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomId, identity, name: identity }),
      });
      if (!res.ok || cancelled) return;
      const { token: jwt, url } = (await res.json()) as {
        token: string;
        url: string;
      };
      if (cancelled) return;
      setToken(jwt);
      setServerUrl(url);

      const { Room: LiveKitRoom, RoomEvent } = await import("livekit-client");
      if (cancelled) return;

      room = new LiveKitRoom({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room
        .on(RoomEvent.Reconnecting, () => setState("reconnecting"))
        .on(RoomEvent.Reconnected, () => setState("connected"))
        .on(RoomEvent.Disconnected, () => setState("disconnected"))
        .on(RoomEvent.ParticipantConnected, () => setRemoteConnected(true))
        .on(RoomEvent.ParticipantDisconnected, () => setRemoteConnected(false))
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) =>
          attachRemoteTrack(track),
        )
        .on(
          RoomEvent.TrackMuted,
          (pub, participant: { isLocal: boolean } | RemoteParticipant) => {
            if (participant.isLocal) return;
            if (pub.kind === "audio") setRemoteMicOn(false);
            else setRemoteCameraOn(false);
          },
        )
        .on(RoomEvent.TrackUnmuted, (pub, participant) => {
          if (participant.isLocal) return;
          if (pub.kind === "audio") setRemoteMicOn(true);
          else setRemoteCameraOn(true);
        })
        .on(RoomEvent.LocalTrackPublished, (pub: LocalTrackPublication) => {
          if (pub.kind === "video" && localElRef.current) {
            pub.track?.attach(localElRef.current);
          }
        });

      try {
        await room.connect(url, jwt);
        if (cancelled) return;
        setState("connected");
        setRemoteConnected(room.remoteParticipants.size > 0);
        // Attach any tracks that were already published before we joined.
        for (const participant of room.remoteParticipants.values()) {
          for (const pub of participant.trackPublications.values()) {
            if (pub.track) attachRemoteTrack(pub.track as RemoteTrack);
          }
        }
      } catch {
        if (!cancelled) setState("disconnected");
        return;
      }

      try {
        await room.localParticipant.enableCameraAndMicrophone();
        attachLocalTrack();
      } catch {
        // Permissions denied — stay in the room audio/video-less.
        if (!cancelled) {
          setMicOn(false);
          setCameraOn(false);
        }
      }
    };

    void connect().catch(() => {
      if (!cancelled) setState("disconnected");
    });

    return () => {
      cancelled = true;
      roomRef.current = null;
      for (const el of audioEls.current) el.remove();
      audioEls.current = [];
      void room?.disconnect();
    };
  }, [roomId, identity, attachLocalTrack, attachRemoteTrack]);

  const attachLocalVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      localElRef.current = el;
      if (el) attachLocalTrack();
    },
    [attachLocalTrack],
  );

  const attachRemoteVideo = useCallback((el: HTMLVideoElement | null) => {
    remoteElRef.current = el;
    const room = roomRef.current;
    if (!el || !room) return;
    for (const participant of room.remoteParticipants.values()) {
      for (const pub of participant.videoTrackPublications.values()) {
        pub.track?.attach(el);
      }
    }
  }, []);

  const toggleMic = useCallback(() => {
    setMicOn((v) => {
      const next = !v;
      void roomRef.current?.localParticipant.setMicrophoneEnabled(next);
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraOn((v) => {
      const next = !v;
      void roomRef.current?.localParticipant.setCameraEnabled(next);
      return next;
    });
  }, []);

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
      micOn: isRealVideoEnabled ? remoteMicOn : true,
      cameraOn: isRealVideoEnabled ? remoteCameraOn : true,
    },
    remoteConnected: isRealVideoEnabled ? remoteConnected : true,
    toggleMic,
    toggleCamera,
    attachLocalVideo,
    attachRemoteVideo,
    token,
    serverUrl,
  };
}
