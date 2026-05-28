"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import type { ScheduleState } from "@/types/schedule";
import { firebaseAuth, firestore, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { getPersistableSchedule, useScheduleStore } from "@/store/schedule-store";

type SyncStatus = "disabled" | "signed-out" | "loading" | "synced" | "saving" | "error";

export function useFirebaseSync() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SyncStatus>(isFirebaseConfigured ? "loading" : "disabled");
  const [error, setError] = useState<string | null>(null);
  const importData = useScheduleStore((state) => state.importData);
  const reset = useScheduleStore((state) => state.reset);
  const hydratedRef = useRef(false);
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    window.localStorage.removeItem("dailysync-store");

    if (!firebaseAuth || !firestore) {
      setStatus("disabled");
      return;
    }

    return onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setStatus(currentUser ? "loading" : "signed-out");
      hydratedRef.current = false;
      if (!currentUser) reset();
    });
  }, [reset]);

  useEffect(() => {
    if (!user || !firestore) return;

    const ref = doc(firestore, "users", user.uid, "schedules", "default");

    getDoc(ref)
      .then((snapshot) => {
        if (snapshot.exists()) {
          applyingRemoteRef.current = true;
          importData(snapshot.data().schedule as ScheduleState);
          queueMicrotask(() => {
            applyingRemoteRef.current = false;
            hydratedRef.current = true;
            setStatus("synced");
          });
          return;
        }

        hydratedRef.current = true;
        setStatus("saving");
        return setDoc(ref, { schedule: getPersistableSchedule(useScheduleStore.getState()), updatedAt: serverTimestamp() }, { merge: true }).then(() => setStatus("synced"));
      })
      .catch((syncError: unknown) => {
        setError(syncError instanceof Error ? syncError.message : "동기화 중 오류가 발생했습니다.");
        setStatus("error");
      });

    return onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists() || !hydratedRef.current) return;
        const remote = snapshot.data().schedule as ScheduleState | undefined;
        if (!remote) return;
        applyingRemoteRef.current = true;
        importData(remote);
        queueMicrotask(() => {
          applyingRemoteRef.current = false;
          setStatus("synced");
        });
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setStatus("error");
      }
    );
  }, [importData, user]);

  useEffect(() => {
    if (!user || !firestore) return;
    const ref = doc(firestore, "users", user.uid, "schedules", "default");

    return useScheduleStore.subscribe((state) => {
      if (!hydratedRef.current || applyingRemoteRef.current) return;
      setStatus("saving");
      setDoc(ref, { schedule: getPersistableSchedule(state), updatedAt: serverTimestamp() }, { merge: true })
        .then(() => setStatus("synced"))
        .catch((syncError: unknown) => {
          setError(syncError instanceof Error ? syncError.message : "저장 중 오류가 발생했습니다.");
          setStatus("error");
        });
    });
  }, [user]);

  async function signIn() {
    if (!firebaseAuth) return;
    setError(null);
    setStatus("loading");
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "로그인에 실패했습니다.");
      setStatus("error");
    }
  }

  async function logout() {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    reset();
  }

  return {
    user,
    status,
    error,
    configured: isFirebaseConfigured,
    signIn,
    logout
  };
}
