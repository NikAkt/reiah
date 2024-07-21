const NewFilter = ({
  setFilteredZipCodes,
  showFilterBoard,
  setShowFilterBoard,
  map,
}) => {
  return (
    <div
      class={`absolute z-40 h-full bg-white
    items-center transform left-[45vw] w-[55vw] border-black
 gap-0.5 justify-center text-black transition-transform duration-500 scale-100 ${
   showFilterBoard() ? "block" : "hidden"
 }`}
    >
      Hello
    </div>
  );
};

export default NewFilter;
