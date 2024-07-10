import { SettingsForm } from "../components/SettingsForm";
import { DashboardView } from "../layouts/Layout";
import UserMenu from "../components/UserMenu"; // Import UserMenu component

const initialValues = {
  Username: "john_doe",
  Email: "john@example.com",
  Name: "John",
  Surname: "Doe",
};

export const Settings = () => {
  return (
    <DashboardView sortableIsOn={false}>
      <div class="absolute top-0 right-0 p-4">
        <UserMenu /> {/* Include UserMenu component */}
      </div>
      <div class="p-8 shadow-md rounded bg-white dark:bg-slate-800 col-span-3">
        <header>
          <h1 class="text-2xl dark:text-white">User Settings</h1>
        </header>
        <main class="mt-4">
          <SettingsForm
            editOn={true}
            userId="123"
            values={initialValues}
            errors={{}}
          />
        </main>
      </div>
    </DashboardView>
  );
};
