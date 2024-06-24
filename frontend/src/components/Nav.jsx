import { useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";
import { A } from "@solidjs/router";

export default function Nav(props) {
  const location = useLocation();
  const active = (path) =>
    path == location.pathname
      ? "border-green border-dashed"
      : "border-transparent hover:border-green";

  const [dropdownDisplay, setDropdownDisplay] = createSignal(false);
  const [action, setAction] = createSignal("Login");

  // const toggleDropdown = () => {
  //   setDropdownDisplay(!dropdownDisplay());
  // };

  // const class_ = "shadow-md bg-white ml-[0px] appearance-none
  //     h-screen w-[15vw] absolute w-[15%] z-30 focus:hidden block
  //     hover:animation-fade-in
  //   px-[1%] font-black gap-x-2 items-center
  //   ";

  return (
    <nav
      class="shadow-md appearance-none 
    rounded w-full p-3 text-accent leading-tight 
    focus:outline-none focus:shadow-outline 
    dark:bg-slate-800 dark:text-slate-200"
    >
      <div
        class="mt-[5%] w-[100%] 
      h-[10%] mb-[5%] 
      font-sans text-4xl flex flex-col 
      "
      >
        <span>REIAH </span>
        <span
          class="flex bg-green rounded-lg w-[60%] 
          item-center justify-center h-[90%] text-white"
        >
          APP
        </span>
        <div
          class="w-[100%] h-[2px] mt-[2%]
        border-solid border-b-2 border-indigo-600"
        ></div>
      </div>

      <ul
        class="container 
      p-3 text-gray-200 flex flex-col
      items-center justify-between w-[70%] 
      text-2xl gap-2
      "
      >
        <li
          class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6 
          hover:bg-green w-[100%] 
          flex flex-col text-black`}
        >
          <A href="/">Home</A>
        </li>

        <li
          class={`border-b-2 ${active("/induction")} mx-1.5 sm:mx-6 
          flex flex-row gap-2 
          hover:bg-green w-[100%] flex flex-col `}
        >
          <A href="/about">Induction</A>
        </li>
        <li
          class={`border-b-2 ${active("/settings")} mx-1.5 sm:mx-6 
          hover:bg-green w-[100%] 
          flex flex-col`}
        >
          <a href="/">{action()}</a>
        </li>
        <li
          class={`border-b-2 ${active("/settings")} mx-1.5 sm:mx-6 
          hover:bg-green w-[100%] 
          flex flex-col`}
        >
          <a href="/">Settings</a>
        </li>
        {/* <li
          class={`border-b-2 ${active("/settings")} mx-1.5 sm:mx-6 
          hover:bg-green w-[100%] 
          flex flex-col`}
        >
          <a href="/">Dashboard</a>
        </li> */}
      </ul>
    </nav>
  );
}
