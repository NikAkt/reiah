import { useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";
import filter_img from "/assets/Filter.png";

export default function Nav(props) {
  const location = useLocation();
  const active = (path) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";

  const [dropdownDisplay, setDropdownDisplay] = createSignal(false);

  const toggleDropdown = () => {
    setDropdownDisplay(!dropdownDisplay());
  };

  return (
    <nav class="bg-blue h-[5vh] flex justify-items-center items-center w-screen">
      <ul class="container flex p-3 text-gray-200 flex flex-row items-center justify-center w-[40%] ml-[5vw]">
        <li
          class={`border-b-2 ${active(
            "/"
          )} mx-1.5 sm:mx-6 hover:bg-indigo-600 w-[100%] flex flex-col items-center`}
        >
          <a href="/">Home</a>
        </li>

        <li
          class={`border-b-2 ${active(
            "/induction"
          )} mx-1.5 sm:mx-6 flex flex-row gap-2 hover:bg-indigo-600 w-[100%] flex flex-col items-center`}
        >
          <a href="/induction">Induction</a>
        </li>
        {/* <li
          class={`border-b-2 ${active(
            "/filter"
          )} mx-1.5 sm:mx-6 flex flex-row gap-2 hover:bg-indigo-600 w-[100%] flex flex-row items-center justify-center`}
        >
          <img src={filter_img} alt="filter" />
          <a href="/filter">Filter</a>
        </li> */}

        {/* <li
          class={`border-b-2 ${active(
            "/loginregister"
          )} mx-1.5 sm:mx-6 hover:bg-indigo-600 w-[100%] flex flex-col items-center`}
        >
          <a href="/login" onClick={handleClick}>
            Login / Register
          </a>
        </li> */}
      </ul>
    </nav>
  );
}
