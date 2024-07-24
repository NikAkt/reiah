/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { createSignal } from "solid-js";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Map } from "./pages/Map";
import { RegisterPage, LoginPage } from "./pages/Auth";
import { store } from "./data/stores";
import { ErrorPage } from "./components/ErrorPage";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider } from "solid-supabase";
import { RouteGuard } from "./routeguard";
import { InductionPage } from "./pages/Induction";

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_KEY
// );

const supabase = createClient(
  "https://ythbzdzanxaevlriiewc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aGJ6ZHphbnhhZXZscmlpZXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA1NDI5OTIsImV4cCI6MjAzNjExODk5Mn0.z5IILiOoTJBU26Yg2MRgnWmMFl1VLMV5dkPsFOtM1Bg"
);

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

const [favorite, setFavorite] = createSignal([]);
const [mapObject, setMapObject] = createSignal(null);

function App(props) {
  return (
    <div data-mode={store.darkModeOn ? "dark" : "light"}>{props.children}</div>
  );
}

render(
  () => (
    <SupabaseProvider client={supabase}>
      <Router root={App}>
        <Route path="/register" component={RegisterPage} />
        <Route path="/login" component={LoginPage} setFavorite={favorite} />
        <Route path="/induction" component={InductionPage} />
        <Route path="/error" component={ErrorPage} />
        <Route path="/" component={() => <Home />} />
        <Route component={RouteGuard}>
          <Route
            path="/map"
            component={() => (
              <Map
                setFavorite={setFavorite}
                favorite={favorite}
                mapObject={mapObject}
                setMapObject={setMapObject}
              />
            )}
          />
          <Route path="/settings" component={Settings} />

          <Route
            path="/dashboard"
            component={() => <Dashboard favorite={favorite} />}
          />
        </Route>
      </Router>
    </SupabaseProvider>
  ),
  root
);
