import { createSignal } from "solid-js";

const UserMenu = () => {
  const [showMenu, setShowMenu] = createSignal(false);

  const handleToggleMenu = () => {
    setShowMenu(!showMenu());
  };

  return (
    <div class="user-menu">
      <div class="username" onClick={handleToggleMenu}>
        Username
      </div>
      {showMenu() && (
        <div class="menu">
          <a href="http://localhost:8000/api/logout" class="logout-button">
            Logout
          </a>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
