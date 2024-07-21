import { useSupabase } from "solid-supabase";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

function InputGroup(props) {
  return <div class={`grid gap-2 grid-cols-${props.gs}`}>{props.children}</div>;
}

function LoginForm(props) {
  const supabase = useSupabase();
  const [email, setEmail] = createSignal();
  const [password, setPassword] = createSignal();
  const navigate = useNavigate();
  let passwordRef;
  const loginUser = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email(),
      password: passwordRef.value,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    if (data) {
      navigate("/map");
    }
  };

  const toggleShowPassword = () => {
    if (passwordRef.type === "password") {
      passwordRef.type = "text";
    } else {
      passwordRef.type = "password";
    }
  };

  return (
    <div class="w-2/3">
      <div class="mb-8 dark:text-white">
        <h1 class="text-3xl">Login</h1>
        <p>Login and get back to work</p>
      </div>
      <form onSubmit={(e) => loginUser(e)}>
        <label class="block mb-4">
          <span class="text-accent text-sm mb-2 dark:text-slate-200">
            Email
          </span>
          <input
            class={`shadow appearance-none border ${
              props.Error ? "border-red-500" : ""
            } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
            placeholder="example1234"
            onchange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label class="block mb-4">
          <span class="text-accent text-sm mb-2 dark:text-slate-200">
            Password
          </span>
          <input
            type="password"
            class={`shadow appearance-none border ${
              props.Error ? "border-red-500" : ""
            } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
            placeholder="example1234"
            onchange={(e) => setPassword(e.target.value)}
            ref={(el) => (passwordRef = el)}
          />
          <input type="checkbox" onclick={toggleShowPassword} />
          {"  "}Show Password
        </label>

        <div class="mt-6">
          <button
            class="w-full bg-teal-500 dark:bg-teal-300 hover:bg-green-200 dark:hover:bg-green-950 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign In
          </button>
        </div>
      </form>
      <p class="mt-6 dark:text-white">
        New to reiah?{" "}
        <a
          class="text-teal-500 hover:text-green-200"
          hx-boost="true"
          href="/register"
        >
          Register here
        </a>
      </p>
    </div>
  );
}

function RegisterForm(props) {
  const supabase = useSupabase();
  const [username, setUsername] = createSignal();
  const [email, setEmail] = createSignal();
  const [password, setPassword] = createSignal();
  const [name, setName] = createSignal();
  const [surname, setSurname] = createSignal();
  const navigate = useNavigate("/login");

  const registerUser = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      password: password(),
      // password: passwordRef.value,
      email: email(),
      options: {
        data: {
          username: username(),
          name: name(),
          surname: surname(),
        },
      },
    });

    if (error) {
      console.error(error.message);
      return;
    }

    if (data) {
      navigate("/login");
    }
  };
  return (
    <div class="w-2/3">
      <div class="mb-8 dark:text-white">
        <h1 class="text-3xl">Create An Account</h1>
        <p>Sign up and get started</p>
      </div>
      <form onSubmit={(e) => registerUser(e)}>
        <label class="block mb-4">
          <span class="text-accent text-sm mb-2 dark:text-slate-200">
            Username
          </span>
          <input
            class={`shadow appearance-none border ${
              props.Error ? "border-red-500" : ""
            } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
            onchange={(e) => setUsername(e.target.value)}
          />
        </label>
        <InputGroup gs={2}>
          <label class="block mb-4">
            <span class="text-accent text-sm mb-2 dark:text-slate-200">
              Name
            </span>
            <input
              class={`shadow appearance-none border ${
                props.Error ? "border-red-500" : ""
              } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
              onchange={(e) => setName(e.target.value)}
            />
          </label>
          <label class="block mb-4">
            <span class="text-accent text-sm mb-2 dark:text-slate-200">
              Surname
            </span>
            <input
              class={`shadow appearance-none border ${
                props.Error ? "border-red-500" : ""
              } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
              onchange={(e) => setSurname(e.target.value)}
            />
          </label>
        </InputGroup>
        <label class="block mb-4">
          <span class="text-accent text-sm mb-2 dark:text-slate-200">
            Email
          </span>
          <input
            class={`shadow appearance-none border ${
              props.Error ? "border-red-500" : ""
            } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
            onchange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label class="block mb-4">
          <span class="text-accent text-sm mb-2 dark:text-slate-200">
            Password
          </span>
          <input
            class={`shadow appearance-none border ${
              props.Error ? "border-red-500" : ""
            } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
            onchange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div class="mt-6">
          <button
            class="w-full bg-teal-500 dark:bg-teal-300 hover:bg-green-200 dark:hover:bg-green-950 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Register
          </button>
        </div>
      </form>
      <p class="mt-6 dark:text-white">
        Already have an account with us?{" "}
        <a
          class="text-teal-500 dark:text-teal-300 hover:text-green-200"
          hx-boost="true"
          href="/login"
        >
          Login here
        </a>
      </p>
    </div>
  );
}

export { LoginForm, RegisterForm };
