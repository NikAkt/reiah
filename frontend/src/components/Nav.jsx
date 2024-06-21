import { useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";

export default function Nav(props) {
  const location = useLocation();
  const active = (path) =>
    path == location.pathname
      ? "border-green border-dashed"
      : "border-transparent hover:border-green";

  const [dropdownDisplay, setDropdownDisplay] = createSignal(false);

  const toggleDropdown = () => {
    setDropdownDisplay(!dropdownDisplay());
  };

  return (
    <nav
      class="bg-white ml-[0px] 
      h-screen w-[15vw] 
    px-[1%] font-black gap-x-2 items-center
    "
    >
      <div
        class="mt-[5%] w-[100%] 
      h-[10%] mb-[5%] 
      font-sans text-4xl flex flex-col 
      border-solid border-b-2 border-indigo-600"
      >
        REIAH{" "}
        <span
          class="flex bg-green rounded-lg w-[60%] 
          item-center justify-center ml-[3%] h-[90%] text-white"
        >
          HUB
        </span>
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
          <a href="/">Home</a>
        </li>

        <li
          class={`border-b-2 ${active("/induction")} mx-1.5 sm:mx-6 
          flex flex-row gap-2 
          hover:bg-green w-[100%] flex flex-col `}
        >
          <a href="/induction">Induction</a>
        </li>
        <li
          class={`border-b-2 ${active("/settings")} mx-1.5 sm:mx-6 
          hover:bg-green w-[100%] 
          flex flex-col`}
        >
          <a href="/">Login / Register</a>
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
