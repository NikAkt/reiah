import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

import "./app.css";
import Home from "./routes/home";

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="m-0 px-0 flex flex-col">
          <Home />
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
