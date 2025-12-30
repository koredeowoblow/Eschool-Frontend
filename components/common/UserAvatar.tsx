
import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, name = 'User', size = 'md', className = '' }) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-32 h-32 text-2xl'
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  if (src && !error) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden border border-white shadow-sm flex-shrink-0 ${className}`}>
        <img 
          src={src} 
          alt={name} 
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-400 flex-shrink-0 ${className}`}>
      {initials || <User size={size === 'xl' ? 48 : 20} />}
    </div>
  );
};

export default UserAvatar;
