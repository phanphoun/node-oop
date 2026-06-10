import { useState } from 'react'
import ErrorMessage from '../components/ui/ErrorMessage'
import FormInput from '../components/ui/FormInput'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { card, input, label as labelClass, narrowPage, primaryButton } from '../utils/styles'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      await updateProfile(form)
      setMessage('Profile updated.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className={narrowPage}>
      <PageHeader eyebrow={user?.role} title="Profile" description="Keep your contact details current for orders and notifications." />
      <form className={`${card} grid gap-4 p-6 sm:grid-cols-2`} onSubmit={submit}>
        <ErrorMessage message={message} />
        <FormInput id="name" label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <FormInput id="phone" label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <label className={`${labelClass} sm:col-span-2`} htmlFor="address">
          <span>Address</span>
          <textarea id="address" className={input} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </label>
        <button type="submit" className={primaryButton}>Save profile</button>
      </form>
    </section>
  )
}

