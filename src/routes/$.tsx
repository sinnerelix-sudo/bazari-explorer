import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

// Catch-all route — defer all routing to the CRA app's BrowserRouter.
// @ts-expect-error — JS module without types
const App = lazy(() => import("@/App.jsx"));

export const Route = createFileRoute("/$")({
  component: SplatRoute,
});

function SplatRoute() {
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
