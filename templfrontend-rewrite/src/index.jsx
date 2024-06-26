/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { Dashboard } from "./pages/Dashboard"
import { Home } from "./pages/Home"
import { Settings } from "./pages/Settings"
import { Map } from "./pages/Map"
import './index.css';
import { store } from "./data/stores";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}


function App(props) {
  return (
    <div data-mode={store.darkModeOn ? "dark" : "light"}>
      {props.children}
    </div>
  );
}


render(
  () => (
    <Router root={App} >
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/map" component={Map} />
    </Router>
  ),
  root,
);
