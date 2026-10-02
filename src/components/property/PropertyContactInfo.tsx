import {
  HiOutlineCheck,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineDevicePhoneMobile,
  HiOutlineChevronDown,
} from 'react-icons/hi2';
import { STEP_ICON_CLS } from './PropertyBadges';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue';

const dialCls =
  'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition hover:bg-slate-100';

interface Props {
  email: string;
  onEmail: (v: string) => void;
  emailError?: string;
  mobiles: string[];
  onMobiles: (v: string[]) => void;
  landline: string;
  onLandline: (v: string) => void;
}

/** "Contact Information" — email, one or more mobiles, and an optional landline. */
export default function PropertyContactInfo({
  email,
  onEmail,
  emailError,
  mobiles,
  onMobiles,
  landline,
  onLandline,
}: Props) {
  const setMobile = (index: number, value: string) =>
    onMobiles(mobiles.map((m, i) => (i === index ? value : m)));

  return (
    <section className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-16">
      {/* Sidebar / section header */}
      <div className="flex shrink-0 flex-col items-start pt-1 md:w-48">
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <HiOutlinePhone className="h-7 w-7 text-brand-blue" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-blue text-white">
            <HiOutlineCheck className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
        <h3 className="text-base font-bold leading-tight text-slate-900">
          Contact
          <br className="hidden md:inline" /> Information
        </h3>
      </div>

      <div className="max-w-2xl flex-1 space-y-7">
        {/* 1. Email */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineEnvelope className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              placeholder="e.g. muhammadjan2485@gmail.com"
              className={inputCls}
              style={emailError ? { borderColor: '#FCA5A5' } : undefined}
            />
            {emailError && (
              <p className="mt-1 text-[11px] font-medium text-red-600">{emailError}</p>
            )}
          </div>
        </div>

        {/* 2. Mobile(s) */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineDevicePhoneMobile className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="contact-mobile-0">
              Mobile
            </label>
            <div className="space-y-2.5">
              {mobiles.map((mobile, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={dialCls} title="Pakistan (+92)">
                    <span className="text-base leading-none">🇵🇰</span>
                    <HiOutlineChevronDown className="h-3 w-3 text-slate-400" />
                  </div>
                  <input
                    id={index === 0 ? 'contact-mobile-0' : undefined}
                    value={mobile}
                    onChange={(e) => setMobile(index, e.target.value)}
                    placeholder="+92 300 1234567"
                    className={`${inputCls} flex-1`}
                  />
                  {mobiles.length > 1 ? (
                    <button
                      type="button"
                      aria-label="Remove mobile"
                      onClick={() => onMobiles(mobiles.filter((_, i) => i !== index))}
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-red-500 shadow-sm transition-colors hover:bg-red-50"
                    >
                      &times;
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Add mobile"
                      onClick={() => onMobiles([...mobiles, ''])}
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-brand-blue shadow-sm transition-colors hover:bg-slate-50"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Landline */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlinePhone className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="contact-landline">
              Landline
            </label>
            <div className="flex items-center gap-2">
              <div className={dialCls} title="Pakistan (+92)">
                <span className="text-base leading-none">🇵🇰</span>
                <HiOutlineChevronDown className="h-3 w-3 text-slate-400" />
              </div>
              <input
                id="contact-landline"
                value={landline}
                onChange={(e) => onLandline(e.target.value)}
                placeholder="+92 51 1234567"
                className={`${inputCls} flex-1`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}