import { useState } from 'react'
import ErrorMessage from '../components/ui/ErrorMessage'
import FormInput from '../components/ui/FormInput'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { card, ghostButton, input, label as labelClass, narrowPage, primaryButton } from '../utils/styles'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profileImage: user?.profileImage || '',
  })
  const [message, setMessage] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(Boolean(user?.profileImage && !user.profileImage.startsWith('data:')))

  const profileInitial = (form.name || user?.email || 'U').charAt(0).toUpperCase()

  const readProfileImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      return
    }
    if (file.size > 1024 * 1024) {
      setMessage('Profile image must be 1MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setMessage('')
      setForm((current) => ({ ...current, profileImage: reader.result || '' }))
      setShowUrlInput(false)
    }
    reader.onerror = () => setMessage('Could not read that image.')
    reader.readAsDataURL(file)
  }

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
      <form className={`${card} overflow-hidden`} onSubmit={submit}>
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <h2 className="text-base font-black text-slate-950">Account details</h2>
          <p className="mt-1 text-sm text-slate-500">Update your public profile photo and contact information.</p>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:p-6">
        <div className="sm:col-span-2">
          <ErrorMessage message={message} />
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mx-auto grid h-36 w-36 place-items-center overflow-hidden rounded-3xl bg-teal-50 text-5xl font-black text-teal-700 ring-1 ring-teal-100">
            {form.profileImage ? <img className="h-full w-full object-cover" src={form.profileImage} alt={form.name || 'Profile'} /> : <span>{profileInitial}</span>}
          </div>
          <div className="mt-4 grid gap-2">
            <label className={`${primaryButton} cursor-pointer`} htmlFor="profileImageFile">
              Upload photo
              <input id="profileImageFile" className="sr-only" type="file" accept="image/*" onChange={readProfileImage} />
            </label>
            <button type="button" className={ghostButton} onClick={() => setShowUrlInput((current) => !current)}>
              Use image URL
            </button>
            {form.profileImage ? (
              <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" onClick={() => setForm({ ...form, profileImage: '' })}>
                Remove photo
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">JPG, PNG, or WebP up to 1MB.</p>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2">
          {showUrlInput ? (
            <label className={`${labelClass} sm:col-span-2`} htmlFor="profileImage">
              <span>Image URL</span>
              <input
                id="profileImage"
                className={input}
                placeholder="https://example.com/me.jpg"
                value={form.profileImage.startsWith('data:') ? '' : form.profileImage}
                onChange={(event) => setForm({ ...form, profileImage: event.target.value })}
              />
            </label>
          ) : null}
          <FormInput id="name" label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <FormInput id="phone" label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <label className={`${labelClass} sm:col-span-2`} htmlFor="address">
            <span>Address</span>
            <textarea id="address" className={`${input} min-h-28 resize-y`} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className={`${primaryButton} min-w-36`}>Save profile</button>
          </div>
        </div>
        </div>
      </form>
    </section>
  )
}

