import { Router, Routes, Route } from "@solidjs/router";
import { render } from "solid-js/web";
import Induction from "./routes/Induction";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/induction" component={Induction} />
      </Routes>
    </Router>
  );
}

export default App;
