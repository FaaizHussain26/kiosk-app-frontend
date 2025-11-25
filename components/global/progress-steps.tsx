export const ProgressSteps = ({index}: {index: number}) => {
    return  <div className="bg-white border-b border-gray-200 p-8">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: "Start" },
          { num: 2, label: "Upload" },
          { num: 3, label: "Edit" },
          { num: 4, label: "Review" },
          { num: 5, label: "Pay & Print" },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                s.num === index
                  ? "bg-primary text-white"
                  : s.num < index
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              {s.num < index ? "✓" : s.num}
            </div>
            <p className={`ml-2 font-medium ${s.num <= index ? "text-emerald-700" : "text-gray-500"}`}>{s.label}</p>
            {idx < 4 && <div className={`w-12 h-1 mx-2 ${s.num < index ? "bg-emerald-700" : "bg-gray-300"}`} />}
          </div>
        ))}
      </div>
    </div>
  </div>
}