import { useEffect, useState } from 'react';
import {
  HiOutlineArrowPath,
  HiOutlineArrowTrendingDown,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineCurrencyRupee,
  HiOutlineInformationCircle,
  HiOutlineKey,
  HiOutlinePlus,
  HiOutlineQueueList,
  HiOutlineReceiptPercent,
  HiOutlineTag,
} from 'react-icons/hi2';
import { CARET_CLS, FIELD_CLS, STEP_ICON_CLS } from './PropertyBadges';

export const AREA_UNITS = ['Sq. Ft.', 'Marla', 'Kanal', 'Sq. Yd.'];
export const CURRENCIES = ['PKR', 'USD', 'EUR', 'AED'];

const STEP_TITLE_CLS = 'text-sm font-bold text-slate-800';
const STEP_HINT_CLS = 'mt-0.5 text-xs text-slate-400';

interface ToggleProps {
  label: string;
  hint: string;
  icon: typeof HiOutlineKey;
  on: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, hint, icon: Icon, on, onChange }: ToggleProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={STEP_ICON_CLS}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
        <div>
          <h3 className={STEP_TITLE_CLS}>{label}</h3>
          <p className={STEP_HINT_CLS}>{hint}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={() => onChange(!on)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            on ? 'bg-brand-blue' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              on ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function CurrencySelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-28 shrink-0">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_CLS} cursor-pointer border-transparent bg-slate-100 py-2.5 font-medium`}
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className={CARET_CLS}>
        <HiOutlineChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}

interface Props {
  size: string;
  onSize: (v: string) => void;
  unit: string;
  onUnit: (v: string) => void;
  price: string;
  onPrice: (v: string) => void;
  currency: string;
  onCurrency: (v: string) => void;
  installment: boolean;
  onInstallment: (v: boolean) => void;
  advanceAmount: string;
  onAdvanceAmount: (v: string) => void;
  advanceCurrency: string;
  onAdvanceCurrency: (v: string) => void;
  installmentCount: string;
  onInstallmentCount: (v: string) => void;
  monthlyInstallment: string;
  onMonthlyInstallment: (v: string) => void;
  monthlyCurrency: string;
  onMonthlyCurrency: (v: string) => void;
  possession: boolean;
  onPossession: (v: boolean) => void;
}

/** "Price and Area" — area size, price with currency, price check and two toggles. */
export default function PropertyPriceArea({
  size,
  onSize,
  unit,
  onUnit,
  price,
  onPrice,
  currency,
  onCurrency,
  installment,
  onInstallment,
  advanceAmount,
  onAdvanceAmount,
  advanceCurrency,
  onAdvanceCurrency,
  installmentCount,
  onInstallmentCount,
  monthlyInstallment,
  onMonthlyInstallment,
  monthlyCurrency,
  onMonthlyCurrency,
  possession,
  onPossession,
}: Props) {
  const [check, setCheck] = useState<string | null>(null);
  const [monthlyEdited, setMonthlyEdited] = useState(false);

  const numeric = (v: string) => Number(v.replace(/,/g, ''));

  const runPriceCheck = () => {
    const a = numeric(size);
    const p = numeric(price);
    if (!a || !p || a <= 0 || p <= 0) {
      setCheck('Enter both area size and price to run a price check.');
      return;
    }
    const perUnit = p / a;
    const pretty = perUnit.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setCheck(`Average estimation: ${pretty} ${currency} per ${unit}`);
  };

  const listedPrice = numeric(price);
  const advance = numeric(advanceAmount);
  const count = numeric(installmentCount);
  const installmentsTotal = count * numeric(monthlyInstallment);
  const grandTotal = advance + installmentsTotal;

  const fmtMoney = (n: number) =>
    n.toLocaleString('en-US', { maximumFractionDigits: 2 });

  /** Suggest a monthly figure from the listed price until the user types their own. */
  const suggestedMonthly = () => {
    if (listedPrice <= 0 || count <= 0) return '';
    return String(Math.round(Math.max(listedPrice - advance, 0) / count));
  };

  useEffect(() => {
    if (monthlyEdited || monthlyCurrency !== advanceCurrency) return;
    const next = suggestedMonthly();
    if (next !== monthlyInstallment) onMonthlyInstallment(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, advanceAmount, installmentCount, monthlyEdited, monthlyCurrency, advanceCurrency]);

  /* The two amount pickers always share one currency, as in the design. */
  const setBothCurrencies = (v: string) => {
    onAdvanceCurrency(v);
    onMonthlyCurrency(v);
  };

  return (
    <section className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-16">
      {/* Sidebar / section header */}
      <div className="flex shrink-0 flex-col items-start pt-2 md:w-48">
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <HiOutlineTag className="h-7 w-7 text-brand-blue" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-blue text-white">
            <HiOutlinePlus className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
        <h3 className="text-base font-bold leading-snug text-slate-900">Price and Area</h3>
      </div>

      {/* Form steps */}
      <div className="max-w-2xl flex-1 space-y-8">
        {/* 1 — Area size */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineQueueList className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pa-size">
              Area Size
            </label>
            <div className="flex gap-3">
              <input
                id="pa-size"
                type="number"
                inputMode="decimal"
                min="0"
                value={size}
                onChange={(e) => onSize(e.target.value)}
                placeholder="Enter Area"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue"
              />
              <div className="relative w-32 shrink-0">
                <select
                  value={unit}
                  onChange={(e) => onUnit(e.target.value)}
                  className={`${FIELD_CLS} cursor-pointer py-2.5 font-medium`}
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <div className={CARET_CLS}>
                  <HiOutlineChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 — Price */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineCurrencyRupee className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pa-price">
              Price
            </label>
            <div className="mb-2 flex gap-3">
              <input
                id="pa-price"
                type="number"
                inputMode="decimal"
                min="0"
                value={price}
                onChange={(e) => onPrice(e.target.value)}
                placeholder="Enter Price"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue"
              />
              <div className="relative w-32 shrink-0">
                <select
                  value={currency}
                  onChange={(e) => onCurrency(e.target.value)}
                  className={`${FIELD_CLS} cursor-pointer border-slate-200 bg-slate-100 py-2.5 font-medium`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className={CARET_CLS}>
                  <HiOutlineChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={runPriceCheck}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                <HiOutlineInformationCircle className="h-3.5 w-3.5 text-slate-500" />
                <span>Price Check</span>
              </button>
              {check && (
                <span className="rounded-full border border-brand-blue/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {check}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 — Installment */}
        <Toggle
          label="Installment available"
          hint="Enable if listing is available on installments"
          icon={HiOutlineBanknotes}
          on={installment}
          onChange={(v) => {
            onInstallment(v);
            if (!v) {
              onAdvanceAmount('');
              onAdvanceCurrency(currency);
              onInstallmentCount('');
              onMonthlyInstallment('');
              onMonthlyCurrency(currency);
              setMonthlyEdited(false);
            }
          }}
        />

        {installment && (
          <div className="space-y-6 rounded-2xl border border-brand-blue/20 bg-blue-50/40 p-4 sm:p-6">
            {/* panel header + live status */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-blue/10 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Payment &amp; Installment Settings</h4>
                <p className="mt-0.5 text-xs text-slate-400">
                  Configure installment payment options for this listing
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Installments Enabled
              </span>
            </div>

            {/* Advance Amount */}
            <div className="flex items-start gap-4">
              <div className={STEP_ICON_CLS}>
                <HiOutlineArrowTrendingDown className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pa-advance">
                  Advance Amount
                </label>
                <div className="flex gap-3">
                  <input
                    id="pa-advance"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={advanceAmount}
                    onChange={(e) => onAdvanceAmount(e.target.value)}
                    placeholder="Enter Amount"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue"
                  />
                  <CurrencySelect id="pa-advance-currency" value={advanceCurrency} onChange={setBothCurrencies} />
                </div>
              </div>
            </div>

            {/* No of Installments */}
            <div className="flex items-start gap-4">
              <div className={STEP_ICON_CLS}>
                <HiOutlineCalendarDays className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pa-count">
                  No of Installments
                </label>
                <input
                  id="pa-count"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="120"
                  value={installmentCount}
                  onChange={(e) => onInstallmentCount(e.target.value)}
                  placeholder="Enter Number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Monthly Installments */}
            <div className="flex items-start gap-4">
              <div className={STEP_ICON_CLS}>
                <HiOutlineReceiptPercent className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pa-monthly">
                  Monthly Installments
                </label>
                <div className="flex gap-3">
                  <input
                    id="pa-monthly"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={monthlyInstallment}
                    onChange={(e) => {
                      setMonthlyEdited(true);
                      onMonthlyInstallment(e.target.value);
                    }}
                    placeholder={suggestedMonthly() || 'Enter Amount'}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue"
                  />
                  <CurrencySelect id="pa-monthly-currency" value={monthlyCurrency} onChange={setBothCurrencies} />
                </div>
              </div>
            </div>

            {/* Live summary */}
            <div className="space-y-2 rounded-xl border border-slate-200/80 bg-white p-4 text-sm">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Advance Down Payment:</span>
                <span className="font-medium text-slate-700">
                  {fmtMoney(advance)} {advanceCurrency}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Installments Total ({installmentCount || 0} months):</span>
                <span className="font-medium text-slate-700">
                  {fmtMoney(installmentsTotal)} {advanceCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                <span>Estimated Total Price:</span>
                <span className="text-base font-bold text-brand-blue">
                  {fmtMoney(grandTotal)} {advanceCurrency}
                </span>
              </div>
              {grandTotal > 0 && listedPrice > 0 && grandTotal !== listedPrice && (
                <p className="pt-1 text-[11px] font-medium text-amber-600">
                  Estimated total does not match the listed price ({fmtMoney(listedPrice)} {currency}).
                </p>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-brand-blue/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  onAdvanceAmount('');
                  onInstallmentCount('');
                  onMonthlyInstallment('');
                  setMonthlyEdited(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* 4 — Possession */}
        <Toggle
          label="Ready for Possession"
          hint="Enable if listing is ready for possession"
          icon={HiOutlineKey}
          on={possession}
          onChange={onPossession}
        />
      </div>
    </section>
  );
}