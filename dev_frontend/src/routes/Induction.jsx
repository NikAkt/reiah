import { createSignal } from "solid-js";

export default function Induction() {
  const [name, setName] = createSignal("");
  const [purpose, setPurpose] = createSignal("");

  const handleClick = (value) => {
    setPurpose(value);
  };

  return (
    <div>
      <h1 class="text-6xl text-white">Welcome to Our Real Estate App</h1>
      <p class="text-xl text-white">Please enter your name to get started:</p>
      <input
        type="text"
        value={name()}
        onInput={(e) => setName(e.target.value)}
        class="border-2 border-gray-300 p-2 rounded-md"
      />
      <p class="text-xl text-white">Hello, {name()}!</p>
      <p class="text-xl text-white">
        What are you planning to use our website for?
      </p>
      <div class="flex space-x-4">
        <div
          onClick={() => handleClick("Buy a house")}
          class="border-2 border-gray-300 p-2 rounded-md cursor-pointer"
        >
          Buy a house
        </div>
        <div
          onClick={() => handleClick("Open a Business")}
          class="border-2 border-gray-300 p-2 rounded-md cursor-pointer"
        >
          Open a Business
        </div>
      </div>
      {purpose() && <p class="text-xl text-white">You selected: {purpose()}</p>}
    </div>
  );
}
