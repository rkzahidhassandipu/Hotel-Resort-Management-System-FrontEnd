import { PerformanceReview } from "@/types";

export function PerformanceSummary({ reviews, overall, avg }: { reviews: PerformanceReview[], overall: string, avg: (key: keyof PerformanceReview) => string | null }) {
  const score = parseFloat(overall ?? "0");
  const verdict = score >= 4.5 ? { label: "Excellent", color: "text-green-400", bg: "bg-green-500/10" } :
                  score >= 3.5 ? { label: "Good", color: "text-[#37EFD1]", bg: "bg-[#37EFD1]/10" } :
                  score >= 2.5 ? { label: "Average", color: "text-yellow-400", bg: "bg-yellow-500/10" } :
                  score >= 1.5 ? { label: "Below Average", color: "text-orange-400", bg: "bg-orange-500/10" } :
                                 { label: "Poor", color: "text-red-400", bg: "bg-red-500/10" };

  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-display text-sm font-semibold">Performance Summary</h3>
          <p className="text-white/30 text-xs mt-0.5">Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-display font-bold ${verdict.color}`}>{overall}</span>
          <span className={`text-xs font-sans px-2.5 py-1 rounded-full ${verdict.bg} ${verdict.color}`}>{verdict.label}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["Punctuality", "Productivity", "Attitude", "Teamwork"].map((label) => {
          const key = label.toLowerCase() as keyof PerformanceReview;
          const val = avg(key);
          const n = parseFloat(val ?? "0");
          const barColor = n >= 4 ? "bg-green-400" : n >= 3 ? "bg-[#37EFD1]" : n >= 2 ? "bg-yellow-400" : "bg-red-400";
          return (
            <div key={label} className="bg-[#0B0C10] border border-white/5 rounded-lg p-3">
              <div className="flex justify-between mb-2">
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-sm text-white">{val ?? "—"}</p>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: val ? `${(n / 5) * 100}%` : "0%", backgroundColor: val ? barColor : "transparent" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}