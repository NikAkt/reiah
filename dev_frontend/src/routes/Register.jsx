import { createSignal } from "solid-js";

function Register() {
  const [formState, setFormState] = createSignal({
    username: "",
    email: "",
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
      email: "",
      password: "",
    });

    try {
      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const result = await response.json();
      console.log("Success:", result);
      setMessage("Registration successful!");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Registration failed. Please try again.");
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
          <label>Email</label>
          <input
            type="email"
            name="email"
            oninput={handleChange}
            value={formState().email}
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
        <button type="submit">Register</button>
        {message() && <p>{message()}</p>}
      </form>
    </>
  );
}

export default Register;
