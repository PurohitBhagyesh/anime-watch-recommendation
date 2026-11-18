import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'AS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const sizeMap: Record<NonNullable<UserAvatarProps['size']>, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  const hasValidPhoto = Boolean(src && src.trim() && !failed);

  if (hasValidPhoto) {
    return (
      <img
        src={src as string}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${sizeMap[size]} rounded-full object-cover bg-[#16161b] border border-[#383844] flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={`${sizeMap[size]} rounded-full bg-[#16161b] border border-[#383844] text-[#f5f5f7] font-bold tracking-tight inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </span>
  );
};

export default UserAvatar;
