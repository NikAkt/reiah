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
  const borough = ["Bronx", "Manhattan", "Brooklyn", "Queens", "Staten Island"];
  const neighbourhood_type = [
    "Quiet residential",
    "Balanced mix",
    "Lively urban",
    "No preference",
  ];
  const income = [
    "Under $50,000",
    "$50,000-$100,000",
    "$100,000-$150,000",
    "$150,000-$200,000",
    "Over $200,000",
  ];

  const business_environment = [
    "Mostly residential",
    "Mix of residential and commercial",
    "Bustling commercial area",
    "No preference",
  ];

  const amenity = [
    "Parks and recreation",
    "Shopping and restaurants",
    "Schools and education",
    "Public transportation",
    "Cultural attractions",
  ];

  return (
    <div
      class="absolute z-30 w-[500px] h-[500px] left-[20vw] top-[10vh]
     border-solid border-2 border-black bg-white"
    >
      Hello! Let us recommend the ideal zipcode for you! Give us your
      preferrences.
      <div class="relative w-[95%] h-full border-2 border-solid border-teal-500 m-auto"></div>
    </div>
  );
};

export default RecommendZipcode;
