/**
 * Helpers to parse backend stats responses into flat numbers
 * for easy use in StatsCard components.
 */

/** Parse groupBy array like [{status:'PENDING', _count:{status:5}}] into a Record<string, number> */
export function parseGroupBy(
  arr: Array<Record<string, unknown>> | undefined,
  keyField: string,
  countField?: string
): Record<string, number> {
  if (!Array.isArray(arr)) return {};
  const result: Record<string, number> = {};
  for (const item of arr) {
    const key = String(item[keyField] || '');
    const cnt = countField
      ? Number((item._count as Record<string, unknown>)?.[countField] ?? item._count ?? 0)
      : Number(item._count ?? 0);
    result[key.toLowerCase()] = cnt;
  }
  return result;
}

/** Parse booking stats from backend:
 * { total, byStatus:[{status, _count:{status}}], totalRevenue, upcomingCheckIns, upcomingCheckOuts }
 */
export function parseBookingStats(data: Record<string, unknown>) {
  const byStatus = parseGroupBy(
    data.byStatus as Array<Record<string, unknown>>,
    'status', 'status'
  );
  return {
    total:         Number(data.total || 0),
    pending:       byStatus['pending']    || 0,
    confirmed:     byStatus['confirmed']  || 0,
    checkedIn:     byStatus['checked_in'] || 0,
    checkedOut:    byStatus['checked_out']|| 0,
    cancelled:     byStatus['cancelled']  || 0,
    totalRevenue:  Number(data.totalRevenue || 0),
    upcomingCheckIns:  Number(data.upcomingCheckIns || 0),
    upcomingCheckOuts: Number(data.upcomingCheckOuts|| 0),
  };
}

/** Parse payment stats from backend:
 * { total, byMethod:[{method,_sum:{amount},_count}], totalRevenue, todayRevenue, pendingCount }
 */
export function parsePaymentStats(data: Record<string, unknown>) {
  return {
    total:        Number(data.total || 0),
    totalRevenue: Number(data.totalRevenue || 0),
    todayRevenue: Number(data.todayRevenue || 0),
    pending:      Number(data.pendingCount || 0),
    completed:    Number(data.total || 0) - Number(data.pendingCount || 0),
    refunded:     0, // not in stats endpoint
  };
}

/** Parse maintenance stats from backend:
 * { byStatus:[{status,_count}], byPriority, byType, overduePending }
 */
export function parseMaintenanceStats(data: Record<string, unknown>) {
  const byStatus = parseGroupBy(
    data.byStatus as Array<Record<string, unknown>>,
    'status',
    'status'
  );

  const byPriority = (data.byPriority as Record<string, number>) || {};
  const byType = (data.byType as Record<string, number>) || {};

  return {
    total: Object.values(byStatus).reduce((s, v) => s + v, 0),

    pending: byStatus['pending'] || 0,
    inProgress: byStatus['in_progress'] || 0,
    completed: byStatus['completed'] || 0,
    cancelled: byStatus['cancelled'] || 0,

    // ✅ FIXED NAME
    overduePending: Number(data.overduePending || 0),

    byStatus,
    byPriority,
    byType,
  };
}

/** Parse staff stats from backend:
 * { totalStaff, onDutyToday, tasksByStatus:[{status,_count}], overdueCount }
 */
export function parseStaffStats(data: Record<string, unknown>) {
  return {
    total:     Number(data.totalStaff   || 0),
    onDuty:    Number(data.onDutyToday  || 0),
    overdue:   Number(data.overdueCount || 0),
    managers:  0, // not in /staff/stats; use /users/stats for this
    chefs:     0,
  };
}

/** Parse user stats from backend:
 * { total, byRole:[{role,_count:{role}}], byStatus:[{status,_count:{status}}], recentUsers }
 */
export function parseUserStats(data: Record<string, unknown>) {
  const byRole   = parseGroupBy(data.byRole   as Array<Record<string, unknown>>, 'role',   'role');
  const byStatus = parseGroupBy(data.byStatus as Array<Record<string, unknown>>, 'status', 'status');
  return {
    total:     Number(data.total || 0),
    active:    byStatus['active']    || 0,
    suspended: byStatus['suspended'] || 0,
    pending:   byStatus['pending_verification'] || 0,
    customers: byRole['customer']    || 0,
    staff:     (byRole['staff'] || 0) + (byRole['chef'] || 0) + (byRole['maintenance'] || 0) + (byRole['manager'] || 0),
    admins:    byRole['admin']       || 0,
  };
}

/** Parse review stats from backend:
 * { averageRatings:{overallRating,...}, totalApproved, byStatus:[{status,_count:{status}}] }
 */
export function parseReviewStats(data: Record<string, unknown>) {
  const byStatus    = parseGroupBy(data.byStatus as Array<Record<string, unknown>>, 'status', 'status');
  const avgRatings  = (data.averageRatings as Record<string, number>) || {};
  return {
    total:         Number(data.totalApproved || 0),
    averageRating: Number(avgRatings.overallRating || 0),
    pending:       byStatus['pending']  || 0,
    approved:      byStatus['approved'] || 0,
    rejected:      byStatus['rejected'] || 0,
  };
}

/** Parse inventory stats from backend:
 * { total, byStatus:[{status,_count}], totalStockUnits, lowStockAlerts, categories }
 */
export function parseInventoryStats(data: Record<string, unknown>) {
  const byStatus = parseGroupBy(data.byStatus as Array<Record<string, unknown>>, 'status', 'status');
  return {
    total:      Number(data.total || 0),
    lowStock:   byStatus['low']           || Number(data.lowStockAlerts || 0),
    outOfStock: byStatus['out_of_stock']  || 0,
    categories: Number(data.categories   || 0),
  };
}
