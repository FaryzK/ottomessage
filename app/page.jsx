import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">
        Welcome to OttoMessage
      </h1>
      <p className="text-xl mb-8">
        Schedule and automate your WhatsApp group messages
      </p>
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Up
        </Link>
      </div>
    </main>
  )
} 