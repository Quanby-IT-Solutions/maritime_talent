import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guest Registration',
  description: 'Register as a guest for Maritime Quest',
};

export default function GuestRegistrationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Guest Registration</h1>
        <p className="text-center text-gray-600 mb-6">
          Guest registration page content
        </p>
        {/* Add your registration form here */}
      </div>
    </div>
  );
}