const LoginContent = () => {
  return (
    <form action="" class="items-center flex flex-col gap-[60px] mt-[5vh]">
      <input
        type="text"
        name="userName"
        id="userName"
        placeholder="*User Name"
        required
        class="w-[364px] h-[45px] rounded-2xl pl-[10%]"
      />
      {/* <input
        type="email"
        name=""
        id=""
        placeholder="*Email"
        required
        class="w-[364px] h-[45px] rounded-2xl pl-[10%]"
      /> */}
      <input
        type="password"
        name="password"
        id="password"
        placeholder="*Password"
        required
        class="w-[364px] h-[45px] rounded-2xl pl-[10%]"
      />
      <div class="flex flex-row space-x-20 mt-[-10%]">
        <div>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            value="rememberMe"
          />
          <label for="rememberMe" class="text-white">
            Remember Me
          </label>
        </div>
        <a class="text-white cursor-pointer hover:text-green border-b-2 border-white">
          Forget Password?
        </a>
      </div>
    </form>
  );
};

export default LoginContent;
