const LoadingAnimation = () => {
  return (
    <div
      class="absolute w-screen h-screen bg-[#e6e2fd]/40 z-100 flex flex-col items-center
    "
    >
      <div
        class="bg-teal-500 w-1/5 h-[1vh] absolute rounded-lg
      left-0 animate-slide "
      ></div>
      <h1 class="mt-[2vh]">Loading... </h1>
    </div>
  );
};

export { LoadingAnimation };
