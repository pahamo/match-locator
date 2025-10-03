import React from 'react';
import { cn } from '../../lib/utils';
import {
  Avatar as ShadcnAvatar,
  AvatarImage as ShadcnAvatarImage,
  AvatarFallback as ShadcnAvatarFallback,
} from '../../components/ui/avatar';

// Enhanced Avatar component with additional sizes and features
export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl';
  /** Shape variant */
  shape?: 'circle' | 'square' | 'rounded';
  /** Status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  /** Custom status color */
  statusColor?: string;
  /** Make avatar clickable */
  clickable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  default: 'h-10 w-10',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'default',
  shape = 'circle',
  status = 'none',
  statusColor,
  clickable = false,
  loading = false,
  onClick,
  className,
}) => {
  // Generate initials from alt text if no fallback provided
  const getInitials = (text?: string): string => {
    if (!text) return '??';
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarClasses = cn(
    sizeClasses[size],
    {
      'rounded-full': shape === 'circle',
      'rounded-none': shape === 'square',
      'rounded-md': shape === 'rounded',
      'cursor-pointer hover:opacity-80 transition-opacity': clickable,
    },
    className
  );

  const statusSize = size === 'xs' ? 'h-2 w-2' :
                   size === 'sm' ? 'h-2.5 w-2.5' :
                   size === 'default' ? 'h-3 w-3' :
                   size === 'lg' ? 'h-3.5 w-3.5' :
                   size === 'xl' ? 'h-4 w-4' : 'h-5 w-5';

  if (loading) {
    return (
      <div className={cn(avatarClasses, 'animate-pulse bg-muted')} />
    );
  }

  return (
    <div className="relative inline-block">
      <ShadcnAvatar
        className={avatarClasses}
        onClick={clickable ? onClick : undefined}
      >
        <ShadcnAvatarImage src={src} alt={alt} />
        <ShadcnAvatarFallback className={cn(
          'bg-muted text-muted-foreground font-medium',
          {
            'rounded-full': shape === 'circle',
            'rounded-none': shape === 'square',
            'rounded-md': shape === 'rounded',
          }
        )}>
          {fallback || getInitials(alt)}
        </ShadcnAvatarFallback>
      </ShadcnAvatar>

      {/* Status indicator */}
      {status !== 'none' && (
        <span
          className={cn(
            statusSize,
            'absolute -bottom-0 -right-0 rounded-full ring-2 ring-background',
            statusColor ? '' : statusColors[status as keyof typeof statusColors]
          )}
          style={statusColor ? { backgroundColor: statusColor } : {}}
        />
      )}
    </div>
  );
};

// Avatar Group component for showing multiple avatars
export interface AvatarGroupProps {
  /** Maximum number of avatars to show */
  max?: number;
  /** Size for all avatars */
  size?: AvatarProps['size'];
  /** Shape for all avatars */
  shape?: AvatarProps['shape'];
  /** Array of avatar props */
  avatars: AvatarProps[];
  /** Additional class name */
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 4,
  size = 'default',
  shape = 'circle',
  avatars,
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          shape={shape}
          className={cn('ring-2 ring-background', avatar.className)}
        />
      ))}

      {remainingCount > 0 && (
        <Avatar
          size={size}
          shape={shape}
          fallback={`+${remainingCount}`}
          className="ring-2 ring-background bg-muted text-muted-foreground"
        />
      )}
    </div>
  );
};

// Re-export shadcn Avatar components for advanced usage
export {
  Avatar as ShadcnAvatar,
  AvatarImage as ShadcnAvatarImage,
  AvatarFallback as ShadcnAvatarFallback,
} from '../../components/ui/avatar';