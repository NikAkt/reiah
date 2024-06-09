import { createSignal } from "solid-js";

export default function Induction() {
  const [name, setName] = createSignal('');

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
    </div>
  );
}