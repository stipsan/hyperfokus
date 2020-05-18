import cx from 'classnames'
import { forwardRef } from 'react'

type Props = {
  className?: string
  variant?: 'default' | 'primary' | 'danger'
  type?: 'button' | 'submit'
} & React.HTMLAttributes<HTMLButtonElement>

export const className = ({ className, variant = 'default' }: Props) =>
  cx(
    'py-2 px-4 rounded focus:outline-none focus:shadow-outline',
    {
      'bg-transparent hover:bg-gray-300 text-gray-800 font-semibold':
        variant === 'default',
      'bg-blue-500 hover:bg-blue-700 text-white font-bold ':
        variant === 'primary',
      'bg-red-600 hover:bg-red-700 text-white font-bold ': variant === 'danger',
    },
    className
  )

export default forwardRef(
  (
    {
      className: forwardClassName,
      variant,
      ...props
    }: Props & React.HTMLAttributes<HTMLButtonElement>,
    forwardedRef?: React.Ref<HTMLButtonElement>
  ) => (
    <button
      className={className({ className: forwardClassName, variant })}
      type="button"
      {...props}
      ref={forwardedRef}
    />
  )
)
