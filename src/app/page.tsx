import { FeeForm } from "@/components/FeeForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl px-4">
        <FeeForm />
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} EDUS. All rights reserved.
      </footer>
    </div>
  );
}
