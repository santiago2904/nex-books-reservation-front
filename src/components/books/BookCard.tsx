import { Link } from 'react-router-dom'
import { Card, Skeleton } from '@/components/ui'
import { AvailabilityBadge } from './AvailabilityBadge'

interface BookSummary {
  id: string
  title: string
  author: string
  availableCopies: number
  totalCopies: number
}

export function BookCard({ book }: { book: BookSummary }) {
  return (
    <Link to={`/books/${book.id}`} className="block transition-transform duration-120 active:scale-[0.97]">
      <Card className="hover:border-primary/40 cursor-pointer h-full flex flex-col gap-2">
        <h3 className="text-xl">{book.title}</h3>
        <p className="text-fg/70 text-sm">{book.author}</p>
        <div className="mt-auto pt-2">
          <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
        </div>
      </Card>
    </Link>
  )
}

export function BookCardSkeleton() {
  return (
    <Card className="h-32">
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-4 w-1/3" />
    </Card>
  )
}
