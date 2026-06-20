import { input, label as labelClass } from '../../utils/styles'

export default function FormInput({ label, id, error, ...props }) {
  return (
    <label className={labelClass} htmlFor={id}>
      <span>{label}</span>
      <input id={id} className={input} {...props} />
      {error ? <small className="text-red-700">{error}</small> : null}
    </label>
  )
}

