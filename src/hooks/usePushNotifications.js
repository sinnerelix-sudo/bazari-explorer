import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState("default");
  const [subscription, setSubscription] = useState(null);
  const [supported, setSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then((reg) => {
      setSwRegistration(reg);
      reg.pushManager.getSubscription().then((sub) => {
        setSubscription(sub);
      });
    });
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || !swRegistration || !VAPID_PUBLIC_KEY) return false;

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      // Subscribe
      const sub = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      setSubscription(sub);

      // Send subscription to backend
      if (user) {
        await axios.post(`${API}/push/subscribe`, {
          subscription: sub.toJSON(),
        }, { withCredentials: true });
      }

      return true;
    } catch (err) {
      console.error("Push subscribe failed:", err);
      return false;
    }
  }, [supported, swRegistration, user]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      setSubscription(null);
      if (user) {
        await axios.post(`${API}/push/unsubscribe`, {}, { withCredentials: true });
      }
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, [subscription, user]);

  return { supported, permission, subscription, subscribe, unsubscribe };
}
