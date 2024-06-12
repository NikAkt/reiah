import { createSignal } from "solid-js";
import LoginContent from "./LoginContent";
import SignUpContent from "./SignUpContent";

const LoginRegister = () => {
  const [action, setAction] = createSignal("Login");
  const [loginBoardDisplay, setLoginBoardDisplay] = createSignal(false);
  const handleClick = () => {
    setLoginBoardDisplay((prev) => !prev);
  };

  return (
    <div class="fixed z-20 w-32 h-[100vh] flex flex-col items-center gap-0.5 w-screen mt-[0.2vh]">
      <button
        class="bg-black rounded-2xl cursor-pointer ml-[80%]
        w-32 h-9 text-white flex items-center justify-center gap-1.5 
        hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={handleClick}
      >
        <span>Login / Register</span>
      </button>
      {loginBoardDisplay() && (
        <div class="w-[519px] h-[661px] place-content-center bg-blue/90 h-[60vh] z-20 rounded-2xl flex flex-col items-center mt-[5vh]  delay-[300ms] animate-fade-down">
          <div class="h-[60vh] items-center flex flex-col mt-[5%]">
            <div class="text-3xl text-white">Welcome To Reiah</div>
            <div class="flex flex-row items-center mb-[5%] mt-[5%] text-2xl gap-3">
              <div
                class={`${
                  action() === "Login" && "border-b-4 border-white"
                } text-white`}
              >
                Login
              </div>
              <div
                class={`${
                  action() === "Signup" && "border-b-4 border-white"
                } text-white`}
              >
                Sign Up
              </div>
            </div>
            {action() === "Login" ? <LoginContent /> : <SignUpContent />}
            <div class="mt-[50px]">
              <button class="bg-black cursor-pointer rounded-2xl cursor-pointer w-32 h-9 text-white flex items-center justify-center gap-1.5 hover:-translate-y-1 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
