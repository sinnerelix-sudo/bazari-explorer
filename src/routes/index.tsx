import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// CRA app loaded only on the client (uses BrowserRouter, react-router-dom v7,
// browser-only APIs like ServiceWorker, window, etc.)
// @ts-expect-error — JS module without types
const App = lazy(() => import("@/App.js"));

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
