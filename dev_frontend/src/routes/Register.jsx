// src/routes/Register.jsx
import { createSignal } from 'solid-js';

function Register() {
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [message, setMessage] = createSignal('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    const userData = {
      username: username(),
      email: email(),
      password: password(),
    };

    try {
      const response = await fetch('http://localhost:8000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail}`);
        return;
      }

      const data = await response.json();
      setMessage(`Success! User registered with ID: ${data.id}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit}>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Username:</label>
          <input
            type="text"
            value={username()}
            onInput={(e) => setUsername(e.target.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Password:</label>
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Register
        </button>
      </form>
      {message() && (
        <div
          class={`mt-4 p-2 rounded-md ${
            message().startsWith('Success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message()}
        </div>
      )}
    </div>
  );
}

export default Register;
