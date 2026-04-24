import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

// CRA app loaded only on the client (uses BrowserRouter, react-router-dom v7,
// browser-only APIs like ServiceWorker, window, etc.)
// @ts-expect-error — JS module without types
const App = lazy(() => import("@/App.jsx"));

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
