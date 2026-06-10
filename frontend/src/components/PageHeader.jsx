import { eyebrow as eyebrowClass, h1, muted } from '../utils/styles'

export default function PageHeader({ eyebrow, title, description, action, meta }) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
        <h1 className={h1}>{title}</h1>
        {description ? <p className={`${muted} mt-1.5 max-w-2xl text-sm sm:text-base`}>{description}</p> : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}
