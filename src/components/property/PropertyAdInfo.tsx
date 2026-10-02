import { HiOutlineCheck, HiOutlineListBullet, HiOutlinePhoto } from 'react-icons/hi2';
import { STEP_ICON_CLS } from './PropertyBadges';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue';

interface Props {
  title: string;
  onTitle: (v: string) => void;
  titleError?: string;
  description: string;
  onDescription: (v: string) => void;
}

/** "Ad Information" — the listing title and description. */
export default function PropertyAdInfo({ title, onTitle, titleError, description, onDescription }: Props) {
  return (
    <section className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-16">
      {/* Sidebar / section header */}
      <div className="flex shrink-0 flex-col items-start pt-1 md:w-48">
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <HiOutlineListBullet className="h-7 w-7 text-brand-blue" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-blue text-white">
            <HiOutlineCheck className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
        <h3 className="text-base font-bold leading-tight text-slate-900">Ad Information</h3>
      </div>

      {/* Form steps */}
      <div className="max-w-2xl flex-1 space-y-7">
        {/* Title */}
        <div className="flex items-start gap-4">
          <div className={`${STEP_ICON_CLS} text-sm font-bold`}>T</div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="ad-title">
              Title
            </label>
            <input
              id="ad-title"
              value={title}
              onChange={(e) => onTitle(e.target.value)}
              placeholder="Enter property title e.g. Beautiful House in DHA Phase 5"
              className={inputCls}
              style={titleError ? { borderColor: '#FCA5A5' } : undefined}
            />
            {titleError && (
              <p className="mt-1 text-[11px] font-medium text-red-600">{titleError}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlinePhoto className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="ad-desc">
              Description
            </label>
            <textarea
              id="ad-desc"
              rows={4}
              value={description}
              onChange={(e) => onDescription(e.target.value)}
              placeholder="Describe your property, it's features, area it is in etc."
              className={`${inputCls} resize-y`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}