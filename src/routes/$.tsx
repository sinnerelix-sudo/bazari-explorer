import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Catch-all route — defer all routing to the CRA app's BrowserRouter.
const App = lazy(() => import("@/App.js"));

export const Route = createFileRoute("/$")({
  component: SplatRoute,
});

function SplatRoute() {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
