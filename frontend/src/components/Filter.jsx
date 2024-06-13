import { createSignal, onCleanup, onMount } from "solid-js";
import filter_img from "/assets/icon/Filter.png";

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
    >
      <button
        class="bg-black rounded-2xl ml-[55%] z-20
        cursor-pointer w-32 h-9 text-white flex 
        items-center justify-center gap-1.5 hover:scale-110 
        duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={toggleFilter}
      >
        <img src={filter_img} alt="filter" />
        <span>Filter</span>
      </button>
      {/* {filterDisplay() && (
        <div class="fixed m-0 px-0 top-[5vh] left-[70vw] w-[30vw] bg-green h-[95vh] z-20 flex flex-col items-center delay-[300ms] animate-fade-in">
          <p>Filter</p>
        </div>
      )} */}
    </div>
  );
};

export default Filter;
