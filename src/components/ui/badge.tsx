import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/** CVA 기반 Badge 변형 정의 (shadcn/ui 패턴) */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-teal-600 text-white dark:bg-teal-700',
        tier0:
          'border-teal-600 bg-teal-50 text-teal-700 dark:border-teal-500 dark:bg-teal-950 dark:text-teal-300',
        tier1:
          'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300',
        tier2:
          'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950 dark:text-purple-300',
        tier3:
          'border-slate-400 bg-slate-100 text-slate-600 dark:border-slate-500 dark:bg-zinc-900 dark:text-zinc-400',
        success:
          'border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
        warning:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
        danger:
          'border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        outline:
          'border-slate-300 text-slate-700 dark:border-zinc-600 dark:text-zinc-300',
      },
      size: {
        sm: 'px-1.5 py-0 text-[10px]',
        md: 'px-2 py-0.5 text-xs',
        lg: 'px-2.5 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/** shadcn/ui 패턴 Badge 컴포넌트 */
function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
