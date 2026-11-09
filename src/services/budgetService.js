/**
 * Budget Service for LUNARA
 * Handles monthly budget and category limit operations.
 */
import { supabase } from './supabaseClient';

export async function getBudgetForMonth(userId, month) {
  if (!userId || !month) return { data: null, error: 'Invalid parameters' };

  try {
    const { data: budget, error: bError } = await supabase
      .from('budgets')
      .select('*, budget_categories(*)')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle();

    if (bError) throw bError;
    return { data: budget, error: null };
  } catch (err) {
    console.error('getBudgetForMonth error:', err);
    return { data: null, error: err.message };
  }
}

export async function saveBudget(userId, month, totalLimit, categoryLimits = {}) {
  if (!userId || !month) return { data: null, error: 'Invalid parameters' };

  try {
    // Upsert master budget
    const { data: budget, error: bError } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: userId,
          month: month,
          name: 'Monthly Budget',
          total_limit: parseFloat(totalLimit),
        },
        { onConflict: 'user_id,month' }
      )
      .select()
      .single();

    if (bError) throw bError;

    // Replace category limits
    if (Object.keys(categoryLimits).length > 0) {
      await supabase.from('budget_categories').delete().eq('budget_id', budget.id);

      const rows = Object.entries(categoryLimits).map(([catName, limit]) => ({
        budget_id: budget.id,
        category_name: catName,
        limit_amount: parseFloat(limit),
      }));

      await supabase.from('budget_categories').insert(rows);
    }

    return { data: budget, error: null };
  } catch (err) {
    console.error('saveBudget error:', err);
    return { data: null, error: err.message };
  }
}

