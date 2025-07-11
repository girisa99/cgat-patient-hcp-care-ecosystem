
export async function calculateAuditLogStatistics(supabase: any) {
  // Calculate total logs
  const { count: totalCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  // Calculate today's logs
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const { count: todayCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString());

  // Calculate active users from auth.users table (last 7 days login activity)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  let uniqueActiveUsers = 0;
  
  try {
    // Get all users from auth.users and filter by last sign in
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers) {
      // Count users who have signed in within the last 7 days
      const activeUsers = authUsers.users.filter(user => {
        if (!user.last_sign_in_at) return false;
        const lastSignIn = new Date(user.last_sign_in_at);
        return lastSignIn >= sevenDaysAgo;
      });
      
      uniqueActiveUsers = activeUsers.length;
      
      console.log('👥 Active users calculation:', {
        totalUsers: authUsers.users.length,
        usersWithLastSignIn: authUsers.users.filter(u => u.last_sign_in_at).length,
        activeUsersLast7Days: uniqueActiveUsers,
        cutoffDate: sevenDaysAgo.toISOString()
      });
      
      // Log some sample data for debugging
      if (authUsers.users.length > 0) {
        console.log('📋 Sample user data:', authUsers.users.slice(0, 3).map(u => ({
          id: u.id.substring(0, 8) + '...',
          email: u.email,
          last_sign_in_at: u.last_sign_in_at,
          created_at: u.created_at
        })));
      }
    } else {
      console.error('❌ Error fetching auth users for active count:', authError);
      uniqueActiveUsers = 0;
    }
  } catch (error) {
    console.error('❌ Error calculating active users:', error);
    uniqueActiveUsers = 0;
  }

  return {
    total_logs: totalCount || 0,
    today_logs: todayCount || 0,
    active_users: uniqueActiveUsers
  };
}
