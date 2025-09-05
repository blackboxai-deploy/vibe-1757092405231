// Toast hook for notifications
'use client';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    // Simple alert-based notification for now
    // Can be replaced with a proper toast library later
    const message = options.description 
      ? `${options.title}\n${options.description}` 
      : options.title;
    
    if (options.variant === 'destructive') {
      alert(`Error: ${message}`);
    } else {
      alert(`Success: ${message}`);
    }
  };

  return { toast };
}