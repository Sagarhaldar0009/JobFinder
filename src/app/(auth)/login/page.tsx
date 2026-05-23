import { LoginForm } from "../../../components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">JobFinder</h1>
          <p className="text-gray-500 mt-2">Welcome back</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}