import { Router, Route } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

import "./app.css";
import Home from "./routes/home";
import About from "./routes/about";

export default function App() {
  return (
    <Router
    // root={(props) => (
    //   <div>
    //     <Route path="/" component={Home} />
    //     <Route path="/hello-world" component={<div>Hello world!</div>} />
    //   </div>
    // )}
    >
      <Route path="/" component={Home} />
      <Route path="/landing_page" component={About} />
      <FileRoutes />
    </Router>
  );
}
