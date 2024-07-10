import { createSignal } from "solid-js";
import { FormInput, InputGroup } from "./Forms";

function SettingsForm({ userId, values, errors }) {
  const [editOn, setEditOn] = createSignal(false);

  const handleSettingsPatch = async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const urlEncodedData = new URLSearchParams(formData).toString();

    try {
      const response = await fetch("/settings/edit" + userId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncodedData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Success:", responseData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form autocomplete="on" onsubmit={handleSettingsPatch}>
      <InputGroup gs={3}>
        <FormInput
          Type="text"
          Label="Name"
          Placeholder="Name"
          Name="name"
          Error={errors.name}
          Disabled={!editOn()}
          Value={values.Name}
        />
        <FormInput
          Type="text"
          Label="Surname"
          Placeholder="Surname"
          Name="surname"
          Error={errors.surname}
          Disabled={!editOn()}
          Value={values.Surname}
        />
        <FormInput
          Type="text"
          Label="Username"
          Placeholder="Username"
          Name="username"
          Error={errors.username}
          Disabled={!editOn()}
          Value={values.Username}
        />
      </InputGroup>
      <InputGroup gs={3}>
        <FormInput
          Type="email"
          Label="Email"
          Placeholder="Email"
          Name="email"
          Error={errors.email}
          Disabled={!editOn()}
          Value={values.Email}
        />
      </InputGroup>


      <div class="mt-6 grid grid-cols-3 gap-2">
        <div class="col-start-3 grid gap-2">
          {editOn() ? (
            <div class="w-full grid grid-cols-2 gap-2">
              <button
                type="submit"
                class="bg-teal-500 dark:bg-teal-300 hover:bg-green-200 dark:hover:bg-green-950 text-white dark:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Save
              </button>
              <button
                onClick={() => setEditOn(false)}
                class="text-center bg-teal-500 dark:bg-teal-300 hover:bg-green-200 dark:hover:bg-green-950 text-white dark:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditOn(true)}
              class="text-center bg-teal-500 dark:bg-teal-300 hover:bg-green-200 dark:hover:bg-green-950 text-white dark:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export { SettingsForm };
