import React, { useState } from "react";
// import "./Filter.css";
import filter_img from "../../assets/Filter.png";

const Filter = () => {
  const [dropdownDisplay, setDropdownDisplay] = useState("none");
  const showDropdown = () => {
    setDropdownDisplay((prevDropdownDisplay) =>
      prevDropdownDisplay === "" ? "hidden" : ""
    );
  };
  return (
    <div className="absolute z-20 border-dashed border-2 border-indigo-600 w-32 h-[90vh] ml-[65vw] mt-[1.5vh] flex flex-col items-center gap-0.5">
      <button
        className="bg-blue rounded-2xl cursor-pointer w-32 h-9 text-white flex items-center justify-center gap-1.5 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={showDropdown}
      >
        <img src={filter_img} alt="filter" />
        <span>Filter</span>
      </button>
      <div
        className={`w-[20vw] bg-white h-[85vh] z-20 rounded-2xl flex flex-col items-center ${dropdownDisplay}`}
      >
        <p>Filter Dropdown</p>
      </div>
    </div>
  );
};

export default Filter;
