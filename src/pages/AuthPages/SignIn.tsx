import PageMeta from "../../components/common/PageMeta";
// import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="flex items-center justify-center w-full h-screen px-6 py-6 bg-white dark:bg-gray-900 sm:p-0">
        <SignInForm />
      </div>
    </>
  );
}
