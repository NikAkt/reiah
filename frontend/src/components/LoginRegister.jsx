import { createSignal } from "solid-js";

const LoginRegister = () => {
  const [loginBoardDisplay, setLoginBoardDisplay] = createSignal(false);

  const toggleDropdown = () => {
    setLoginBoardDisplay(!loginBoardDisplay());
  };
  return (
    <div class="absolute z-20 border-dashed border-2 border-indigo-600 w-32 h-[90vh] ml-[75vw] mt-[1.5vh] flex flex-col items-center gap-0.5">
      <button
        class="bg-black rounded-2xl cursor-pointer w-32 h-9 text-white flex items-center justify-center gap-1.5 hover:-translate-y-1 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={toggleDropdown}
      >
        <span>Login / Register</span>
      </button>
      {loginBoardDisplay() && (
        <div class="w-[30vw] bg-white h-[60vh] z-20 rounded-2xl flex flex-col items-center mt-[10vh] ml-[-55vw] delay-[300ms] animate-fade-down bg-gradient-to-t from-green to-blue">
          <p>Login Board</p>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
