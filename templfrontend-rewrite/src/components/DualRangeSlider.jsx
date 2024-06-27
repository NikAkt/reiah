function DualRangeSlider({ data }) {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  return (
    <div class="flex flex-col w-full my-2" id="slider_container">
      <div id="sliders_control" class="relative min-h-[50px] w-[100%]">
        <div class="w-[100%] h-[1px] bg-[#C6C6C6]"></div>
        <input
          type="range"
          id="fromSlider"
          value={minVal}
          min={minVal}
          max={maxVal}
          class="
              absolute w-full appearance-none bg-gray-400 pointer-events-none
              h-0 z-10
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:w-6 
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#C6C6C6]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:bg-gray-100
              [&::-webkit-slider-thumb]:active:shadow-[inset_0_0_3px_#387bbe,0_0_9px_#387bbe]
              [&::-moz-range-thumb]:appearance-none 
              [&::-moz-range-thumb]:pointer-events-auto
              [&::-moz-range-thumb]:w-6 
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:bg-black
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:shadow-[0_0_0_1px_#C6C6C6]
              [&::-moz-range-thumb]:cursor-pointer
            "
        />
        <input
          type="range"
          id="toSlider"
          value={maxVal}
          min={minVal}
          max={maxVal}
          class="
              absolute w-full appearance-none bg-gray-400 pointer-events-none
              h-0 z-10
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#C6C6C6]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:bg-gray-100
              [&::-webkit-slider-thumb]:active:shadow-[inset_0_0_3px_#387bbe,0_0_9px_#387bbe]
              [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
              [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:shadow-[0_0_0_1px_#C6C6C6]
              [&::-moz-range-thumb]:cursor-pointer
            "
        />
      </div>
      <div
        id="form_control"
        class="relative flex justify-between text-2xl text-[#635a5a] mt-4"
      >
        <div id="minimum_vol" class="flex flex-col w-1/4">
          <label htmlFor="minimum_vol" class="mb-2">
            Minimum
          </label>
          <input
            type="number"
            placeholder={`${minVal}`}
            class="text-[#8a8383] w-12 h-8 text-xl border-none"
          />
        </div>
        <div id="maximum_vol" class="flex flex-col w-1/4">
          <label htmlFor="maximum_vol" class="mb-2">
            Maximum
          </label>
          <input
            type="number"
            placeholder={`${maxVal}`}
            class="text-[#8a8383] w-12 h-8 text-xl border-none"
          />
        </div>
      </div>
    </div>
  );
}

export { DualRangeSlider };