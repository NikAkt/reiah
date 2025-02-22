import { LoginForm, RegisterForm } from "../components/LoginAndRegisterComponent"
import { AuthLayout } from "../layouts/Layout"

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

const RegisterPage = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}

export {
  LoginPage,
  RegisterPage
}
