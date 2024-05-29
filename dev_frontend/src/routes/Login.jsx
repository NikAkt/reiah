import { createSignal } from "solid-js";

function LoginForm() {
  const [formState, setFormState] = createSignal({
    username: "",
    password: "",
  });
  const [message, setMessage] = createSignal("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState(), [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = formState();
    setFormState({
      username: "",
      password: "",
    });

    try {
      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const result = await response.json();
      console.log("Success:", result);
      sessionStorage.setItem("token", result.access_token);
      setMessage("Login successful!");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Login failed. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            oninput={handleChange}
            value={formState().username}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            oninput={handleChange}
            value={formState().password}
          />
        </div>
        <button type="submit">Login</button>
        {message() && <p>{message()}</p>}
      </form>
    </>
  );
}

export default LoginForm;
