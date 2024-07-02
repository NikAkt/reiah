/**
 * @typedef {Object} InputAttributes
 * @property {string} Type - The type of the input (e.g., "text", "password").
 * @property {string} Label - The label text for the input.
 * @property {string} Placeholder - The placeholder text for the input.
 * @property {string} Name - The name attribute of the input.
 * @property {string} Error - The error message to display if there is an error.
 * @property {boolean} Disabled - Indicates whether the input is disabled.
 * @property {string} Value - The value of the input.
 */

/**
 * @param {InputAttributes} props
 */
function FormInput(props) {
  return (
    <label class="block mb-4">
      <span class="text-accent text-sm mb-2 dark:text-slate-200">
        {props.Label}
      </span>
      <input
        disabled={props.Disabled}
        class={`shadow appearance-none border ${
          props.Error ? "border-red-500" : ""
        } rounded w-full p-3 text-accent leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-800 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-900`}
        type={props.Type}
        placeholder={props.Placeholder}
        name={props.Name}
        value={props.Value}
      />
      {props.Error && <p class="text-red-500 text-xs italic">{props.Error}</p>}
    </label>
  );
}

/**
 * @param {Object} props
 * @param {number} props.gs - Number of grid columns
 */
function InputGroup(props) {
  return <div class={`grid gap-2 grid-cols-${props.gs}`}>{props.children}</div>;
}

export { FormInput, InputGroup };
