import { createSignal } from "solid-js";
import filter_img from "../assets/Filter.png";

const Filter = () => {
  const [dropdownDisplay, setDropdownDisplay] = createSignal(false);

  const toggleDropdown = () => {
    setDropdownDisplay(!dropdownDisplay());
  };

  return (
    <div class="absolute z-20 border-dashed border-2 border-indigo-600 w-32 h-[90vh] ml-[65vw] mt-[1.5vh] flex flex-col items-center gap-0.5">
      <button
        class="bg-blue rounded-2xl cursor-pointer w-32 h-9 text-white flex items-center justify-center gap-1.5 hover:-translate-y-1 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={toggleDropdown}
      >
        <img src={filter_img} alt="filter" />
        <span>Filter</span>
      </button>
      {dropdownDisplay() && (
        <div class="w-[20vw] bg-white h-[85vh] z-20 rounded-2xl flex flex-col items-center mt-2 delay-[300ms] animate-fade-down">
          <p>Filter Dropdown</p>
        </div>
      )}
    </div>
  );
};

export default Filter;
