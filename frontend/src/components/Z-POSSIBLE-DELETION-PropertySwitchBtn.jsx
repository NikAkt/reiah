const PropertySwitchBtn = () => {
  return (
    <div class="absolute z-30 flex flex-row gap-2 top-[2vh] left-[23vw]">
      <button
        class="bg-black rounded-2xl  z-20 
        cursor-pointer w-32 h-9 text-white flex 
        items-center justify-center gap-1.5 hover:scale-110 
        duration-300 active:bg-violet-700 focus:outline-none 
        focus:ring focus:ring-violet-300"
      >
        <span>Commercial</span>
      </button>

      <button
        class="bg-white rounded-2xl  z-20
        cursor-pointer w-32 h-9 text-black flex 
        items-center justify-center gap-1.5 hover:scale-110 
        duration-300 active:bg-violet-700 focus:outline-none 
        focus:ring focus:ring-violet-300"
      >
        <span>Residential</span>
      </button>
    </div>
  );
};

export default PropertySwitchBtn;
