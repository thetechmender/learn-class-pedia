import { BarChart3, Copy, Download } from 'lucide-react';

export default function StatisticsPanel({ 
    completionPercentage, 
    timeSpent, 
    completedSlides, 
    totalSlides, 
    bookmarksCount, 
    notesCount,
    formatTime 
}) {
    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Learning Statistics
            </h3>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>Course Progress</span>
                        <span>{completionPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <div className="text-white/50 text-xs">Time Spent</div>
                        <div className="text-white text-lg font-semibold">{formatTime(timeSpent)}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <div className="text-white/50 text-xs">Slides Viewed</div>
                        <div className="text-white text-lg font-semibold">
                            {completedSlides}/{totalSlides}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <div className="text-white/50 text-xs">Bookmarks</div>
                        <div className="text-white text-lg font-semibold">{bookmarksCount}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <div className="text-white/50 text-xs">Notes Taken</div>
                        <div className="text-white text-lg font-semibold">{notesCount}</div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">Quick Actions</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                            className="flex-1 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Copy className="w-4 h-4" /> Copy Link
                        </button>
                        <button
                            onClick={() => {/* Export logic */ }}
                            className="flex-1 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Export Notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
