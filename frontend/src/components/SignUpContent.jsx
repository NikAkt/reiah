import { createSignal } from "solid-js";

const SignUpContent = () => {
  const [invalid, setInvalid] = createSignal[false];
  return (
    <form action="">
      <input
        type="text"
        name="userName"
        id="userName"
        placeholder="*User Name"
        required
        class="w-[364px] h-[45px] rounded-2xl pl-[10%]"
      />
      <input
        type="email"
        name=""
        id=""
        placeholder="*Email"
        required
        class="w-[364px] h-[45px] rounded-2xl pl-[10%]"
      />
      <input
        type="password"
        name="password"
        id="password"
        placeholder="*Password"
        required
        class="w-[364px] h-[45px] rounded-2xl pl-[10%]"
      />
      {invalid && <div class="mt-[-10%]">The username already existed!</div>}
    </form>
  );
};

export default SignUpContent;
