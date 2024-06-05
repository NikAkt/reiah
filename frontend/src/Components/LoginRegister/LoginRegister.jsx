import React from "react";

const LoginRegister = () => {
  return (
    <div className="absolute z-20 border-dashed border-2 border-indigo-600 w-32 h-[90vh] ml-[80vw] mt-[1.5vh] flex flex-col items-center gap-0.5">
      <button className="bg-blue rounded-2xl cursor-pointer w-32 h-9  text-white flex items-center justify-center gap-1.5 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">
        Login/Register
      </button>
      <div className="">
        <p className="">Login Board</p>
      </div>
    </div>
  );
};

export default LoginRegister;
