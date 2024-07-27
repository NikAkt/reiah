const MarkerLegend = ({
  hideProperty,
  setHideProperty,
  hideAmenities,
  setHideAmenities,
}) => {
  return (
    <div class="flex flex-col px-2 py-2 rounded-lg justify-center items-center">
      <div class="flex justify-center items-center gap-2 w-full">
        <button
          class={`rounded-md 
        bg-[#ffffff] border-2 border-solid border-black px-2 ${
          hideProperty() ? "opacity-40" : ""
        }`}
          onClick={() => {
            setHideProperty((prev) => !prev);
          }}
        >
          $Price
        </button>
        <span class={`${hideProperty() ? "opacity-40" : ""}`}>
          {" "}
          Property Sold
        </span>
      </div>
      <div class="flex justify-center items-center w-full gap-10">
        <button
          class={`rounded-full 
        bg-[#0145ac] w-[10px] h-[10px] ${hideAmenities() ? "opacity-40" : ""}`}
          onClick={() => {
            setHideAmenities((prev) => !prev);
          }}
        ></button>
        <span
          class={`
          ${hideAmenities() ? "opacity-40" : ""}
        `}
        >
          Amenity
        </span>
      </div>
    </div>
  );
};

export default MarkerLegend;
