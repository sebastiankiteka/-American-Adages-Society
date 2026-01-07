import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  )
}
