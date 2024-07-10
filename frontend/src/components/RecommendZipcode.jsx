import { createSignal, createEffect, onMount } from "solid-js";

// Debounce function to limit API calls
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const RecommendZipcode = (props) => {
  return (
    <div
      class="absolute z-30 w-[500px] h-[500px] left-[20vw] top-[10vh]
     border-solid border-2 border-black bg-white"
    >
      Hello! Let us recommend the ideal zipcode for you!
      <div class="relative w-[95%] h-full border-2 border-solid border-teal-500 m-auto"></div>
    </div>
  );
};

export default RecommendZipcode;
