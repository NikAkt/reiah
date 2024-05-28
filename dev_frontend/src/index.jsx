/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import { Route, Router, useNavigate } from "@solidjs/router";
import Home from "./routes/Home";
import Nav from "./components/Navbar";
import Login from "./routes/Login";
import { createEffect } from "solid-js";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

const Layout = (props) => {
  return (
    <>
      <header>
        <Nav />
      </header>
      <section class="bg-gray-50 dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          {props.children}
        </div>
      </section>
    </>
  );
};

const RouteGuard = (props) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  createEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  });

  return <>{props.children}</>;
};

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/app" component={RouteGuard}>
        <Route
          path="/"
          component={() => (
            <>
              <h1 class="text-6xl text-white">welcome</h1>
            </>
          )}
        />
      </Route>
      <Route
        path="*404"
        component={() => (
          <>
            <div>
              <h1 class="text-6xl text-white"> 404</h1>
              <a
                href="/"
                class="text-base text-white underline hover:text-blue-600"
              >
                Return to Safety
              </a>
            </div>
          </>
        )}
      />
    </Router>
  ),
  root,
);
