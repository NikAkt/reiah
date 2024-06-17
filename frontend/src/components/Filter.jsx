import { createSignal, onCleanup, onMount } from "solid-js";
import filter_img from "/assets/icon/Filter.png";
import MapFilter from "./MapFilter";

const Filter = () => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);

  const toggleFilter = () => {
    setFilterDisplay(!filterDisplay());
  };

  return (
    <div
      class="absolute z-30 w-32 flex flex-col 
    items-center gap-0.5 mt-[11vh] ml-[42vw]
    border-solid border-2 border-indigo-600"
      justify-center
    >
      <button
        class="bg-black rounded-2xl  z-20
        cursor-pointer w-32 h-9 text-white flex 
        items-center justify-center gap-1.5 hover:scale-110 
        duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={toggleFilter}
      >
        <img src={filter_img} alt="filter" />
        <span>Filter</span>
      </button>
      {filterDisplay() && (
        <div
          class="m-0 px-0 mt-[-2vh] left-[70vw] w-[30vw] bg-white h-[80vh] 
        z-20 flex flex-col items-center delay-[300ms] animate-fade-down overflow-y-auto"
        >
          <p>Filter</p>
          <div class="w-[90%] flex flex-col h-[100%] items-center">
            <p>Map Filter</p>
            <MapFilter />
            <p>Home value</p>
            <div id="price_plot"></div>
            <p>Median Income</p>
            <div id="median_income_plot"></div>
            <p>Borough</p>
            <p>Neighbourhood</p>
            <p>Zip Code</p>
            <p>Amenities</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
