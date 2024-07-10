import { createEffect, createSignal } from "solid-js";
import { useContext } from "solid-js";
import { CustomUserContext } from "../routeguard";

const UserMenu = () => {
  const [showMenu, setShowMenu] = createSignal(false);
  const { user, logOut } = useContext(CustomUserContext)

  createEffect(() => {
    console.log(user())
  })

  const handleToggleMenu = () => {
    setShowMenu(!showMenu());
  };

  return (
    <div class="user-menu">
      <div class="username" onClick={handleToggleMenu}>
        {user()?.email}
      </div>
      {showMenu() && (
        <div class="menu">
          <button onclick={logOut} class="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
