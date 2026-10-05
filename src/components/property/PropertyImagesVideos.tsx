import { useRef, useState } from 'react';
import {
  HiOutlineCheck,
  HiOutlinePhoto,
  HiOutlinePlay,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { STEP_ICON_CLS } from './PropertyBadges';

/** One pending image. `data` is a base64 data URI sent to the API after create. */
export interface PendingImage {
  data: string;
  name: string;
}

/** Preset sample photos offered by the Image Bank picker. */
export const IMAGE_BANK = [
  { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80', label: 'Exterior House' },
  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', label: 'Living Room' },
  { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', label: 'Modern Kitchen' },
  { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80', label: 'Master Bedroom' },
  { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', label: 'Luxury Bathroom' },
  { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80', label: 'Lawn & Garden' },
];

const MAX_BYTES = 5 * 1024 * 1024;
const TARGET_IMAGES = 5;

interface Props {
  images: PendingImage[];
  onImages: (v: PendingImage[]) => void;
  videoUrl: string;
  onVideoUrl: (v: string) => void;
}

/** "Property Images and Videos" — uploads, Image Bank, gallery and a YouTube link. */
export default function PropertyImagesVideos({ images, onImages, videoUrl, onVideoUrl }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [cover, setCover] = useState(0);
  const [videoDraft, setVideoDraft] = useState('');
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoError, setVideoError] = useState('');

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_BYTES) return;
      const reader = new FileReader();
      reader.onload = () =>
        onImages([...images, { data: String(reader.result), name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const addBankImage = (url: string, label: string) => {
    if (images.some((img) => img.data === url)) return;
    onImages([...images, { data: url, name: label }]);
  };

  const removeImage = (index: number) => {
    onImages(images.filter((_, i) => i !== index));
    if (cover >= images.length - 1) setCover(Math.max(0, images.length - 2));
  };

  const saveVideo = () => {
    const url = videoDraft.trim();
    if (!url) return;
    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      setVideoError('Paste a valid YouTube link.');
      return;
    }
    onVideoUrl(url);
    setVideoDraft('');
    setVideoError('');
    setEditingVideo(false);
  };

  const score = Math.min(100, images.length * 20);
  const remaining = Math.max(0, TARGET_IMAGES - images.length);

  return (
    <section className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-16">
      {/* Sidebar / section header */}
      <div className="flex shrink-0 flex-col items-start pt-1 md:w-48">
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <HiOutlinePhoto className="h-7 w-7 text-brand-blue" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-blue text-white">
            <HiOutlineCheck className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
        <h3 className="text-base font-bold leading-tight text-slate-900">
          Property Images
          <br className="hidden md:inline" /> and Videos
        </h3>
      </div>

      <div className="max-w-2xl flex-1 space-y-7">
        {/* 1. Upload images */}
        <div className="flex items-start gap-4">
          <div className={`${STEP_ICON_CLS} text-sm font-bold`}>I</div>
          <div className="flex-1 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">
              Upload Images of your Property
            </h4>

            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-5 transition-colors hover:bg-blue-50/60 sm:flex-row sm:p-6">
              {/* Left: upload buttons + info */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100/60">
                  <HiOutlinePhoto className="h-7 w-7 text-brand-blue" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                      className="cursor-pointer rounded-lg bg-brand-blue px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-blue/30 transition-colors hover:bg-brand-dark"
                    >
                      Upload Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankOpen(true)}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Image Bank
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">Max size 5MB, .jpg .png only</span>
                </div>
              </div>

              {/* Right: bullet points */}
              <div className="w-full shrink-0 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-500 sm:w-auto sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                {[
                  'Ads with pictures get 5x more views.',
                  'Upload good quality pictures with proper lighting.',
                  'Double click to set cover image.',
                ].map((tip) => (
                  <div key={tip} className="flex items-center gap-1.5">
                    <HiOutlineCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2 sm:grid-cols-5">
                {images.map((img, idx) => {
                  const isCover = idx === cover;
                  return (
                    <div
                      key={img.data.slice(-24) + idx}
                      onDoubleClick={() => setCover(idx)}
                      title="Double click to set as cover"
                      className={`group relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                        isCover
                          ? 'border-brand-blue ring-2 ring-brand-blue/20'
                          : 'border-slate-200 hover:border-brand-blue'
                      }`}
                    >
                      <img src={img.data} alt={img.name} className="h-full w-full object-cover" />
                      {isCover && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-brand-blue px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                          COVER
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => removeImage(idx)}
                          className="cursor-pointer rounded-lg bg-red-500/90 p-1.5 text-white transition-colors hover:bg-red-600"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quality tip */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 sm:p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600">
                  <HiOutlineShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Quality Tip</h5>
                  <p className="text-[11px] text-slate-500">
                    {score === 0
                      ? `Add at least ${TARGET_IMAGES} more images`
                      : score < 100
                        ? `Great! Add ${remaining} more image${remaining > 1 ? 's' : ''} for max score`
                        : 'Excellent! Maximum images score achieved'}
                  </p>
                </div>
              </div>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-bold transition-all ${
                  score === 0
                    ? 'bg-red-100 text-red-500'
                    : score < 100
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {score}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Videos */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlinePlay className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Add Videos of your Property</h4>
              <p className="mt-0.5 text-xs text-slate-400">
                Add videos of your property from Youtube. Upload on Youtube and paste the link below.
              </p>
            </div>

            <div className="space-y-2">
              {/* Add / edit toggle */}
              {!videoUrl && !editingVideo && (
                <button
                  type="button"
                  onClick={() => setEditingVideo(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-blue bg-white px-4 py-2 text-xs font-bold text-brand-blue shadow-sm transition-colors hover:bg-blue-50"
                >
                  <span>Add Video</span>
                </button>
              )}

              {editingVideo && (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={videoDraft}
                    onChange={(e) => {
                      setVideoDraft(e.target.value);
                      setVideoError('');
                    }}
                    placeholder="Paste YouTube link e.g. https://www.youtube.com/watch?v=..."
                    className={`flex-1 rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 shadow-sm outline-none transition placeholder-slate-400 focus:border-brand-blue ${
                      videoError ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={saveVideo}
                    className="cursor-pointer rounded-lg bg-brand-blue px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-dark"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideo(false);
                      setVideoDraft('');
                      setVideoError('');
                    }}
                    className="cursor-pointer rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {videoError && <p className="text-[11px] font-medium text-red-600">{videoError}</p>}

              {/* Saved video */}
              {videoUrl && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <HiOutlinePlay className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-xs font-bold text-slate-800">Property Video Tour</p>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-[11px] text-brand-blue hover:underline"
                      >
                        {videoUrl}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove video"
                    onClick={() => {
                      onVideoUrl('');
                      setEditingVideo(true);
                    }}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
                  >
                    <HiOutlineXMark className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Bank modal */}
      {bankOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setBankOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                  <HiOutlinePhoto className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Select Sample Property Photos</h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setBankOpen(false)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-4">
              <p className="mb-3 text-xs text-slate-500">
                Click sample property images to add them to your listing:
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Pick high resolution sample images</span>
              <button
                type="button"
                onClick={() => setBankOpen(false)}
                className="cursor-pointer rounded-lg bg-brand-blue px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-dark"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}