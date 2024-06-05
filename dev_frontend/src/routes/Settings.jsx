import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { username, setUsername, token, setToken } from "../store"; // Import the global state and setters

const input_style =
  "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
const label_style =
  "block mb-2 text-sm font-medium text-gray-900 dark:text-white";

function Settings() {
  const [formState, setFormState] = createSignal({
    username: "",
    password: "",
  });
  const [message, setMessage] = createSignal("");
  const navigate = useNavigate();

  onMount(async () => {
    const tokenFromSession = sessionStorage.getItem("token");
    const usernameFromSession = sessionStorage.getItem("username");

    if (!tokenFromSession || !usernameFromSession) {
      navigate("/login");
      return;
    }

    setToken(tokenFromSession);
    setUsername(usernameFromSession);

    try {
      const response = await fetch("http://localhost:8000/auth/users/me", {
        headers: {
          Authorization: `Bearer ${tokenFromSession}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }

      const userData = await response.json();
      setFormState({
        username: userData.username,
        password: "",
      });
      setUsername(userData.username); // Set the global user state
    } catch (error) {
      console.error("Error:", error);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = formState();

    try {
      const response = await fetch(
        `http://localhost:8000/users/${username()}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ username: data.username, password: data.password }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const result = await response.json();
      console.log("Success:", result);
      setMessage("Update successful!");
      setUsername(data.username); // Update the global username state
      sessionStorage.setItem("username", data.username); // Update sessionStorage
    } catch (error) {
      console.error("Error:", error);
      setMessage("Update failed. Please try again.");
    }
  };

  return (
    <>
      <section class="w-full max-w-screen-lg p-6">
        <h1 class="text-neutral-100 text-4xl ">Edit Profile</h1>
        <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label class={label_style} for="username">
              Username
            </label>
            <input
              class={input_style}
              name="username"
              type="text"
              onInput={handleChange}
              value={formState().username}
              required
            />
          </div>
          <div>
            <label class={label_style} for="password">
              Password
            </label>
            <input
              class={input_style}
              name="password"
              type="password"
              onInput={handleChange}
              value={formState().password}
              required
            />
          </div>
          <div class="flex justify-end w-full gap-4">
            <button type="submit" class="text-slate-200 bg-green-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-400 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              Update
            </button>
            <button type="button" class="text-slate-950 bg:text-slate-200 bg-rose-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-500 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>
          {message() && <p>{message()}</p>}
        </form>
      </section>
    </>
  );
}

export default Settings;
