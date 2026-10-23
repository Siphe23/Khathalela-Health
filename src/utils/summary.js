// Works out the "common barriers" from the missed-appointment list.
// This is plain counting, not a trained AI model.
export function computeBarriers(missed) {
  const total = missed.length;
  const counts = { transport: 0, waiting: 0, work: 0, other: 0 };
  missed.forEach((item) => {
    if (item.reason === 'transport') counts.transport += 1;
    else if (item.reason === 'waiting') counts.waiting += 1;
    else if (item.reason === 'work') counts.work += 1;
    else counts.other += 1; // 'noshow' and 'other'
  });

  const labels = {
    transport: 'Transport difficulty',
    waiting: 'Long waiting times',
    work: 'Work commitments',
    other: 'Other',
  };

  const rows = Object.keys(counts)
    .map((key) => ({
      key,
      label: labels[key],
      count: counts[key],
      percent: total === 0 ? 0 : Math.round((counts[key] / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return { total, rows };
}

export function suggestionFor(rows, total) {
  if (total === 0) return 'No missed appointments in the last 7 days. Keep up the good work.';
  const top = rows[0].key;
  if (top === 'transport') return 'Consider arranging community transport support for patients with repeated transport issues.';
  if (top === 'waiting') return 'Review clinic scheduling and staggered arrival times to shorten waiting times.';
  if (top === 'work') return 'Consider offering early-morning or late-afternoon appointment slots.';
  return 'Call patients who missed appointments to understand what stopped them from attending.';
}
