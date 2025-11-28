import clsx from 'clsx'

interface Props {
  status: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: {
    label: 'Disponible',
    className: 'bg-green-100 text-green-800',
  },
  reserved: {
    label: 'Reservado',
    className: 'bg-yellow-100 text-yellow-800',
  },
  sold: {
    label: 'Vendido',
    className: 'bg-gray-100 text-gray-800',
  },
  paused: {
    label: 'Pausado',
    className: 'bg-red-100 text-red-800',
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800',
  },
  active: {
    label: 'Activa',
    className: 'bg-green-100 text-green-800',
  },
  blocked: {
    label: 'Bloqueada',
    className: 'bg-red-100 text-red-800',
  },
}

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

