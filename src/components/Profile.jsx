import { useApp } from '../context/AppContext'

export default function Profile() {
    const { books, user, getFollowers, getFollowing, openFollowersModal } = useApp()
    const followersCount = getFollowers(user?.id || 'u1').length
    const followingCount = getFollowing(user?.id || 'u1').length
    const sharedCount = books.filter((b) => b.isShared).length
    const totalMemories = books.reduce((acc, curr) => acc + (curr.memoryCount || 0), 0)

    return (
        <div className="w-full lg:w-[100%] mx-auto max-w-3xl">
            <div className="scrapbook-card rounded-2xl p-6 md:p-7 border border-beige/40 relative overflow-hidden paper-clip" style={{ rotate: '-0.4deg' }}>
                <div className="absolute top-0 right-0 w-28 h-28 bg-soft-pink/8 rounded-full blur-2xl pointer-events-none" />

                {/* Desktop: Header Row with Avatar, Name/Username, and Followers/Following on same line */}
                <div className="hidden md:flex md:flex-row md:items-center gap-6 mb-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <img
                                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'}
                                alt=""
                                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-pink-accent/25 shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Name and @username */}
                    <div className="flex-1">
                        <h3 className="font-display font-semibold text-ink text-xl md:text-2xl leading-tight">
                            {user?.name || 'Priya Sharma'}
                        </h3>
                        <p className="text-sm text-ink-muted font-sans">
                            @{user?.username || 'priyasharma'}
                        </p>
                    </div>

                    {/* Followers/Following */}
                    <div className="flex items-center gap-3 text-sm">
                        <button
                            onClick={() => openFollowersModal(user?.id || 'u1', 'followers')}
                            className="font-semibold text-ink hover:text-pink-accent cursor-pointer transition-colors"
                        >
                            {followersCount} <span className="text-ink-muted font-normal">Followers</span>
                        </button>
                        <span className="text-ink-muted">•</span>
                        <button
                            onClick={() => openFollowersModal(user?.id || 'u1', 'following')}
                            className="font-semibold text-ink hover:text-pink-accent cursor-pointer transition-colors"
                        >
                            {followingCount} <span className="text-ink-muted font-normal">Following</span>
                        </button>
                    </div>
                </div>

                {/* Mobile: Centered Stack */}
                <div className="md:hidden flex flex-col items-center gap-6 mb-5">
                    {/* Avatar */}
                    <div className="flex-shrink-0 flex justify-center">
                        <div className="relative">
                            <img
                                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'}
                                alt=""
                                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-pink-accent/25 shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Name and @username */}
                    <div className="text-center">
                        <h3 className="font-display font-semibold text-ink text-xl md:text-2xl leading-tight">
                            {user?.name || 'Priya Sharma'}
                        </h3>
                        <p className="text-sm text-ink-muted font-sans">
                            @{user?.username || 'priyasharma'}
                        </p>
                    </div>

                    {/* Followers/Following */}
                    <div className="flex items-center gap-3 text-sm">
                        <button
                            onClick={() => openFollowersModal(user?.id || 'u1', 'followers')}
                            className="font-semibold text-ink hover:text-pink-accent cursor-pointer transition-colors"
                        >
                            {followersCount} <span className="text-ink-muted font-normal">Followers</span>
                        </button>
                        <span className="text-ink-muted">•</span>
                        <button
                            onClick={() => openFollowersModal(user?.id || 'u1', 'following')}
                            className="font-semibold text-ink hover:text-pink-accent cursor-pointer transition-colors"
                        >
                            {followingCount} <span className="text-ink-muted font-normal">Following</span>
                        </button>
                    </div>
                </div>

                {/* First Divider - Desktop only */}
                <div className="hidden md:block w-full h-px bg-beige/40 my-5"></div>

                {/* Bio Section */}
                <div className="hidden md:block mb-0">
                    <p className="text-sm text-ink text-left font-sans leading-relaxed max-w-xs md:max-w-none">
                        {user?.bio || 'Memory keeper & story collector. Preserving lifes beautiful moments, one page at a time. ✨'}
                    </p>
                </div>

                {/* Bio for Mobile */}


                <div className="mb-5 md:hidden">
                    <p className="text-sm text-ink font-sans leading-relaxed max-w-lg mx-auto">
                        {user?.bio ||
                            'Memory keeper & story collector. Preserving lifes beautiful moments, one page at a time. ✨'}
                    </p>
                </div>

                {/* Second Divider - Desktop only */}
                <div className="hidden md:block w-full h-px bg-beige/40 my-5"></div>

                {/* Stats Section - Bottom Cards */}
                <div className="mt-6 md:mt-0">
                    {/* Mobile: Three Equal Cards in Single Row */}
                    <div className="md:hidden grid grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-pink-accent/10 border-2 border-pink-accent/30 active:bg-pink-accent/15 transition-all shadow-md text-center">
                            <span className="block text-2xl font-display font-bold text-pink-accent">
                                {totalMemories}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-pink-accent tracking-[0.15em] font-sans mt-1 block">
                                Moments
                            </span>
                        </div>
                        <div className="p-4 rounded-xl bg-cream-dark/30 border border-beige/25 active:bg-cream-dark/50 transition-all text-center">
                            <span className="block text-2xl font-display font-semibold text-ink">
                                {books.length}
                            </span>
                            <span className="text-[9px] uppercase font-semibold text-ink-muted tracking-[0.15em] font-sans mt-1 block">
                                Volumes
                            </span>
                        </div>
                        <div className="p-4 rounded-xl bg-cream-dark/30 border border-beige/25 active:bg-cream-dark/50 transition-all text-center">
                            <span className="block text-2xl font-display font-semibold text-ink">
                                {sharedCount}
                            </span>
                            <span className="text-[9px] uppercase font-semibold text-ink-muted tracking-[0.15em] font-sans mt-1 block">
                                Shared
                            </span>
                        </div>
                    </div>

                    {/* Desktop: Three Equal Cards in Single Row */}
                    <div className="hidden md:grid grid-cols-3 gap-4">
                        <div className="text-center p-5 rounded-xl bg-pink-accent/10 border-2 border-pink-accent/30 hover:bg-pink-accent/15 transition-all shadow-md">
                            <span className="block text-4xl font-display font-bold text-pink-accent">
                                {totalMemories}
                            </span>
                            <span className="text-xs uppercase font-bold text-pink-accent tracking-[0.15em] font-sans mt-1 block">
                                Moments
                            </span>
                        </div>
                        <div className="text-center p-5 rounded-xl bg-cream-dark/30 border border-beige/25 hover:bg-cream-dark/50 transition-all">
                            <span className="block text-3xl font-display font-semibold text-ink">
                                {books.length}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-ink-muted tracking-[0.15em] font-sans mt-1 block">
                                Volumes
                            </span>
                        </div>
                        <div className="text-center p-5 rounded-xl bg-cream-dark/30 border border-beige/25 hover:bg-cream-dark/50 transition-all">
                            <span className="block text-3xl font-display font-semibold text-ink">
                                {sharedCount}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-ink-muted tracking-[0.15em] font-sans mt-1 block">
                                Shared
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
