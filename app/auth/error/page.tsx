export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-red-600">
          Authentication Error
        </h2>
        <p className="text-gray-500 mt-2">
          The link may have expired. Please try registering again.
        </p>
        <a
          href="/register"
          className="mt-4 inline-block text-indigo-500 hover:underline"
        >
          Back to Register
        </a>
      </div>
    </div>
  );
}
