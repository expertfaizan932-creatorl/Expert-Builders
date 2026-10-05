import { usePropertyImages } from '../../data/propertyImages';
import { PropertyAvatar } from './PropertyBadges';

/** A property's cover photo if it has one, otherwise the initials placeholder. */
export default function PropertyThumb({
  id,
  name,
  className = 'h-9 w-9',
  rounded = 'rounded-full',
}: {
  id: number;
  name: string;
  className?: string;
  rounded?: string;
}) {
  const { images } = usePropertyImages(id);
  const cover = images[0];

  if (!cover) return <PropertyAvatar name={name} size="md" />;

  return (
    <span
      className={`relative flex ${className} shrink-0 items-center justify-center overflow-hidden ${rounded} bg-slate-100`}
    >
      <img src={cover.src} alt={name} className="h-full w-full object-cover" />
    </span>
  );
}