import logo from "../logo.svg";
import { createSignal } from "solid-js";
import { setUsername, setToken } from "../store"; // Import global state setters
import { useNavigate } from "@solidjs/router"; // Import useNavigate for navigation

function LoginForm() {
  const [formState, setFormState] = createSignal({
    username: "",
    password: "",
  });
  const [message, setMessage] = createSignal("");
  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState(), [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = formState();
    setFormState({
      username: "",
      password: "",
    });

    try {
      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const result = await response.json();
      console.log("Success:", result);
      setMessage("Login successful!");
      setUsername(data.username); // Set global username state
      setToken(result.access_token); // Set global token state
      sessionStorage.setItem("username", data.username); // Store username in sessionStorage
      sessionStorage.setItem("token", result.access_token); // Store token in sessionStorage
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Error:", error);
      setMessage("Login failed. Please try again.");
    }
  };

  return (
    <>
      <a
        href="#"
        class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
      >
        <img class="w-8 h-8 mr-2" alt="logo" src={logo}></img>
        Summer Project
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Username
              </label>
              <input
                type="text"
                name="username"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Your username"
                onInput={handleChange}
                value={formState().username}
                required
              />
            </div>
            <div>
              <label
                for="password"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onInput={handleChange}
                value={formState().password}
                required
              />
            </div>
            <div class="flex items-center justify-between">
              <a
                href="#"
                class="text-sm font-medium text-primary-400 hover:underline dark:text-primary-500"
              >
                Forgot password?
              </a>
              <a
                href="/register"
                class="text-sm font-medium text-primary-400 hover:underline dark:text-primary-500"
              >
                Register
              </a>
            </div>
            <button
              type="submit"
              class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Sign in
            </button>
            {message() && <p>{message()}</p>}
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginForm;