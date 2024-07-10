import { createEffect, createSignal } from "solid-js";
import { useSupabase } from 'solid-supabase';
import { useNavigate } from "@solidjs/router";
import { createContext } from "solid-js";

export const CustomUserContext = createContext();

export const RouteGuard = (props) => {
  const [user, setUser] = createSignal()
  const navigate = useNavigate();
  const supabase = useSupabase()

  const getLoggedUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user)
    if (!user) {
      navigate("/login", { replace: true });
    }
  }

  const logOut = async () => {
    let { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message)
      return
    }
    setUser({})
    navigate("/login", { replace: true })
  }

  createEffect(() => {
    getLoggedUser();
  })

  return (
    <CustomUserContext.Provider value={{ user, logOut }}>
      {props.children}
    </CustomUserContext.Provider>
  )
}
