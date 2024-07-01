import { createSignal } from "solid-js";
import { FormInput, InputGroup } from "./Forms";

/**
 * @typedef {Object} SettingsFormValues
 * @property {string} Username - The username.
 * @property {string} Email - The email address.
 * @property {string} Name - The first name.
 * @property {string} Surname - The surname.
 */

/**
 * Validates the settings form values.
 * @param {SettingsFormValues} values - The settings form values to validate.
 * @returns {Object<string, string>} - An object containing validation error messages.
 */
function validateSettingsFormValues(values) {
  const errors = {};
  if (values.Name.length < 1) {
    errors.name = "Name must be greater than one character";
  }
  if (values.Surname.length < 1) {
    errors.surname = "Surname must be greater than one character";
  }
  if (values.Username.length < 1) {
    errors.username = "Username must be greater than one character";
  }
  if (!isValidEmail(values.Email)) {
    errors.email = "Please enter a valid email address";
  }
  return errors;
}

/**
 * @param {Object} props
 * @param {boolean} props.editOn() - Indicates whether the form is in edit mode.
 * @param {string} props.userId - The user ID.
 * @param {SettingsFormValues} props.values - The form values.
 * @param {Object<string, string>} props.errors - The validation errors.
 */
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

export { SettingsForm, validateSettingsFormValues };
