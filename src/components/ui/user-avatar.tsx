interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
  rounded?: string;
}

export default function UserAvatar({ src, name, size = 40, className = '', rounded = 'rounded-xl' }: UserAvatarProps) {
  const initial = name?.[0]?.toUpperCase() || '?';
  const style = { width: size, height: size, minWidth: size, minHeight: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        style={style}
        className={`object-cover ${rounded} ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`flex items-center justify-center bg-[hsl(200,70%,50%)] text-white font-semibold ${rounded} ${className}`}
    >
      <span style={{ fontSize: Math.round(size * 0.36) }}>{initial}</span>
    </div>
  );
}
