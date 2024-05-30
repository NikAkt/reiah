const input_style =
  "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
const label_style =
  "block mb-2 text-sm font-medium text-gray-900 dark:text-white";

const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Updating");
};

function Settings() {
  return (
    <>
      <section class="w-full max-w-screen-lg p-6">
        <h1 class="text-neutral-100 text-4xl ">Edit Profile</h1>
        <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <label class={label_style} for="username">
            Username
          </label>
          <input class={input_style} name="username" type="text"></input>

          <label class={label_style} for="email">
            email
          </label>
          <input class={input_style} name="email" type="email"></input>

          <label class={label_style} for="old_password">
            Enter Your Old Password
          </label>
          <input
            class={input_style}
            name="old_password"
            type="password"
          ></input>

          <label class={label_style} for="new_password">
            New Password
          </label>
          <input
            class={input_style}
            name="new_password"
            type="password"
          ></input>

          <label class={label_style} for="new_password_confirm">
            Confirm New Password
          </label>
          <input
            class={input_style}
            name="new_password_confirm"
            type="password"
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
      </section>
    </>
  );
}

export default Settings;
