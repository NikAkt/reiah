import { createSignal, onMount } from "solid-js";
import { token } from "../store"; // Import global state (this is initially null)

const input_style =
  "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
const label_style =
  "block mb-2 text-sm font-medium text-gray-900 dark:text-white";

function Settings() {
  const [formState, setFormState] = createSignal({
    username: "",
    email: "",
  });
  const [message, setMessage] = createSignal("");

  onMount(async () => {
    if (token()) {
      const response = await fetch("http://localhost:8000/auth/users/me", {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        setFormState({
          username: user.username,
          email: user.email,
        });
      } else {
        setMessage("Failed to fetch user details.");
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState(), [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = formState();
    setMessage("");

    try {
      const response = await fetch(`http://localhost:8000/users/${data.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const result = await response.json();
      console.log("Success:", result);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to update profile.");
    }
  };

  return (
    <>
      <section class="w-full max-w-screen-lg p-6">
        <h1 class="text-neutral-100 text-4xl ">Edit Profile</h1>
        <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
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
            disabled
          ></input>

          <label class={label_style} for="email">
            Email
          </label>
          <input
            class={input_style}
            name="email"
            type="email"
            onInput={handleChange}
            value={formState().email}
          ></input>

          <div class="flex justify-end w-full gap-4">
            <button
              type="submit"
              class="text-slate-200 bg-green-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-400 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Update
            </button>
            <button class="text-slate-950 bg:text-slate-200 bg-rose-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-500 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              Cancel
            </button>
          </div>
        </form>
        {message() && <p>{message()}</p>}
      </section>
    </>
  );
}

export default Settings;
