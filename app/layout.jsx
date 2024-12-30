import './globals.css'
import { AuthProvider } from '../lib/context/AuthContext'

export const metadata = {
  title: 'OttoMessage',
  description: 'WhatsApp Group Message Scheduling App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 