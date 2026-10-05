import { useRef, useState } from 'react';
import { HiOutlinePhoto, HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2';
import { IMAGE_BANK } from './PropertyImagesVideos';

const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Receives base64 data URIs (device uploads) and remote URLs (Image Bank picks). */
  onAdd: (items: { data: string; name: string }[]) => void;
}

/** Adds more photos to a property that already exists: device upload or Image Bank. */
export default function AddImageModal({ open, onClose, onAdd }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  if (!open) return null;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const tooBig = Array.from(files).find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setError(`${tooBig.name} is over the 5MB limit.`);
      return;
    }
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (picked.length === 0) {
      setError('Please choose an image file.');
      return;
    }
    setError('');
    /* Wait for every FileReader so the gallery appends them together. */
    Promise.all(
      picked.map(
        (file) =>
          new Promise<{ data: string; name: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ data: String(reader.result), name: file.name });
            reader.readAsDataURL(file);
          }),
      ),
    ).then((items) => {
      onAdd(items);
      onClose();
    });
  };

  const addBankImage = (url: string, label: string) => {
    onAdd([{ data: url, name: label }]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
              <HiOutlinePhoto className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Add Pictures</h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/40 px-4 py-6 transition-colors hover:bg-blue-50"
          >
            <HiOutlinePlus className="h-5 w-5 text-brand-blue" strokeWidth={2.5} />
            <span className="text-sm font-bold text-brand-blue">Upload from device</span>
            <span className="text-xs text-slate-400">Max size 5MB</span>
          </button>

          {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

          <p className="mb-3 mt-6 text-xs font-semibold text-slate-500">Or pick from Image Bank</p>
          <div className="grid max-h-[40vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {IMAGE_BANK.map((sample) => (
              <div
                key={sample.url}
                role="button"
                tabIndex={0}
                onClick={() => addBankImage(sample.url, sample.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') addBankImage(sample.url, sample.label);
                }}
                className="relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl border border-slate-200 transition-all hover:border-brand-blue"
              >
                <img src={sample.url} alt={sample.label} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="truncate text-[10px] font-medium text-white">{sample.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}