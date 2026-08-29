import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SlidersHorizontal, Compass, Search, RefreshCw, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'
import { discoverMatches, sendMatchRequest } from '@/services/match.service.js'
import { MatchCard } from '@/components/discover/MatchCard.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { useDebounce } from '@/hooks/useDebounce.js'
import { FilterPanel } from '@/components/discover/FilterPanel.jsx'
import { notify } from '@/lib/notify.jsx'
import { useAuthStore } from '@/store/authStore.js'

const QUICK_CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Languages',
  'Business',
  'Science'
]

export default function Discover() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filters, setFilters] = useState({})
  const [filterOpen, setFilterOpen] = useState(false)
  const [requestedIds, setRequestedIds] = useState(new Set())
  const debouncedSearch = useDebounce(search, 300)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const activeFilters = {
    ...filters,
    ...(selectedCategory !== 'All' ? { categories: [selectedCategory] } : {})
  }

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['discover', page, debouncedSearch, activeFilters],
    queryFn: () => discoverMatches({ page, limit: 12, search: debouncedSearch, ...activeFilters }),
    staleTime: 60 * 1000,
  })

  const requestMutation = useMutation({
    mutationFn: (match) => {
      return sendMatchRequest({
        targetUserId: match.partner_id || match._id || match.user?._id,
        intro_message: `Hi! I would love to swap skills with you.`
      })
    },
    onSuccess: (_, match) => {
      const id = match.partner_id || match._id
      setRequestedIds((prev) => new Set([...prev, id]))
      notify.success('Skill swap invitation delivered.', 'Swap Request Sent')
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
    onError: (err) => {
      notify.error(err.message || 'Failed to send swap request.', 'Request Error')
    },
  })

  const allMatches = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.matches)
    ? data.matches
    : Array.isArray(data)
    ? data
    : []

  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    total: allMatches.length
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-4xl mx-auto min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Discover
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            AI-matched peers for 1-on-1 skill swaps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
            className="h-8 w-8 p-0"
            title="Refresh matches"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(true)}
            className="h-8 px-2.5 text-xs flex items-center gap-1.5 font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {Object.keys(filters).length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search skills, topics, or names..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-xs"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('')
              setPage(1)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat)
              setPage(1)
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f)
          setPage(1)
          setFilterOpen(false)
        }}
        onReset={() => {
          setFilters({})
          setSelectedCategory('All')
          setPage(1)
          setFilterOpen(false)
        }}
        currentFilters={filters}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shine rounded-3xl p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-2.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-10 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-800/40 text-center my-4">
          <p className="text-xs text-rose-400 mb-2">{error?.message || 'Failed to load matches'}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && allMatches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 my-2">
          <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {search ? 'No matches found' : 'All caught up!'}
          </h3>
          <p className="text-xs text-neutral-500 mb-4 max-w-sm leading-relaxed">
            {search
              ? `No partners found matching "${search}". Try searching for another skill.`
              : 'You are currently matched with active peers or no other new members are available. When new members join or update skills, they will appear here automatically.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({})
              setSelectedCategory('All')
              setSearch('')
              setPage(1)
            }}
          >
            Reset filters
          </Button>
        </div>
      )}

      {/* Match Cards List */}
      {!isLoading && allMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {allMatches.length} recommended partner{allMatches.length === 1 ? '' : 's'}
            </p>
            {pagination.totalPages > 1 && (
              <p className="text-xs text-neutral-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>

          {allMatches.map((match) => (
            <MatchCard
              key={match._id || match.partner_id}
              match={match}
              requested={requestedIds.has(match._id) || requestedIds.has(match.partner_id)}
              onRequest={(m) => requestMutation.mutate(m)}
            />
          ))}

          {/* Pagination Navigation */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-semibold text-neutral-400 px-2">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="h-8 px-3 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
