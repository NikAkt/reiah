import { FormInput, InputGroup } from "./Forms";

/**
 * @typedef {Object} LoginFormValues
 * @property {string} Username - The username.
 * @property {string} Password - The password.
 */

/**
 * Validates the login form values.
 * @param {LoginFormValues} values - The login form values to validate.
 * @returns {Object<string, string>} - An object containing validation error messages.
 */
function validateLoginFormValues(values) {
  const errors = {};
  if (values.Username.length < 1) {
    errors.username = "Username must be greater than one character";
  }
  if (values.Password.length < 1) {
    errors.password = "Password must be greater than one character";
  }
  return errors;
}

/**
 * @param {Object} props
 * @param {boolean} props.invalid - Indicates whether the login attempt was invalid.
 */
function LoginForm({ invalid }) {
  return (
    <div class="w-2/3">
      <div class="mb-8 dark:text-white">
        <h1 class="text-3xl">Login</h1>
        <p>Login and get back to work</p>
      </div>
      <form hx-boost="true" action="/login" method="POST">
        <FormInput
          Type="text"
          Label="Username"
          Placeholder="example1234"
          Name="username"
          Error=""
          Disabled={false}
          Value=""
        />
        <FormInput
          Type="password"
          Label="Password"
          Placeholder="********"
          Name="password"
          Error=""
          Disabled={false}
          Value=""
        />
        <div class="mt-6">
          <button
            class="w-full bg-teal-500 dark:bg-teal-300 hover:bg-green-200 dark:hover:bg-green-950 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign In
          </button>
        </div>
      </form>
      {invalid && (
        <div class="mt-6 text-red-400 dark:text-red-200">
          Failed to login invalid credentials
        </div>
      )}
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

/**
 * @typedef {Object} RegisterFormValues
 * @property {string} Username - The username.
 * @property {string} Password - The password.
 */

/**
 * Validates the register form values.
 * @param {RegisterFormValues} values - The register form values to validate.
 * @returns {Object<string, string>} - An object containing validation error messages.
 */
function validateRegisterFormValues(values) {
  const errors = {};
  if (values.Username.length < 1) {
    errors.username = "Username must be greater than one character";
  }
  if (values.Password.length < 1) {
    errors.password = "Password must be greater than one character";
  }
  return errors;
}

/**
 * @param {Object} props
 * @param {boolean} props.success - Indicates whether the registration was successful.
 */
function RegisterForm() {
  return (
    <div class="w-2/3">
      <div class="mb-8 dark:text-white">
        <h1 class="text-3xl">Create An Account</h1>
        <p>Sign up and get started</p>
      </div>
      <form hx-boost="true" action="/register" method="POST">
        <FormInput
          Type="text"
          Label="Username"
          Placeholder="example1234"
          Name="username"
          Error=""
          Disabled={false}
          Value=""
        />
        <InputGroup gs={2}>
          <FormInput
            Type="text"
            Label="Name"
            Placeholder="john"
            Name="name"
            Error=""
            Disabled={false}
            Value=""
          />
          <FormInput
            Type="text"
            Label="Surname"
            Placeholder="doe"
            Name="surname"
            Error=""
            Disabled={false}
            Value=""
          />
        </InputGroup>
        <FormInput
          Type="email"
          Label="Email"
          Placeholder="johndoe@example.com"
          Name="email"
          Error=""
          Disabled={false}
          Value=""
        />
        <InputGroup gs={2}>
          <FormInput
            Type="password"
            Label="Password"
            Placeholder="********"
            Name="password"
            Error=""
            Disabled={false}
            Value=""
          />
          <FormInput
            Type="password"
            Label="Confirm Password"
            Placeholder="********"
            Name="confirmpassword"
            Error=""
            Disabled={false}
            Value=""
          />
        </InputGroup>
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

export {
  validateLoginFormValues,
  LoginForm,
  validateRegisterFormValues,
  RegisterForm,
};
