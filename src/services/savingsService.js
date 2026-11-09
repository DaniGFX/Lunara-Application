/**
 * Savings Goals Service for LUNARA
 * Handles goals, milestone tracking, and deposit contributions.
 */
import { supabase } from './supabaseClient';

export async function getSavingsGoals(userId) {
  if (!userId) return { data: [], error: 'User must be authenticated' };

  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: parseFloat(g.target_amount),
      currentAmount: parseFloat(g.current_amount || 0),
      targetDate: g.target_date,
      iconId: g.icon_id || 'Sprout',
      color: g.color || '#9B87D4',
      status: g.status,
    }));

    return { data: formatted, error: null };
  } catch (err) {
    console.error('getSavingsGoals error:', err);
    return { data: [], error: err.message };
  }
}

export async function createSavingsGoal(userId, goal) {
  if (!userId) return { data: null, error: 'User must be authenticated' };

  try {
    const payload = {
      user_id: userId,
      name: goal.name,
      target_amount: parseFloat(goal.targetAmount),
      current_amount: 0,
      target_date: goal.targetDate || null,
      icon_id: goal.iconId || 'Sprout',
      color: goal.color || '#9B87D4',
    };

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return {
      data: {
        id: data.id,
        name: data.name,
        targetAmount: parseFloat(data.target_amount),
        currentAmount: parseFloat(data.current_amount || 0),
        targetDate: data.target_date,
        iconId: data.icon_id,
        color: data.color,
      },
      error: null,
    };
  } catch (err) {
    console.error('createSavingsGoal error:', err);
    return { data: null, error: err.message };
  }
}

export async function addSavingsContribution(userId, goalId, amount, currentAmount, note = '') {
  if (!userId || !goalId) return { error: 'Invalid parameters' };

  try {
    const numericAmount = parseFloat(amount);
    const newTotal = parseFloat(currentAmount) + numericAmount;

    // 1. Record contribution audit row
    await supabase.from('savings_contributions').insert([
      {
        goal_id: goalId,
        user_id: userId,
        amount: numericAmount,
        note: note || null,
      },
    ]);

    // 2. Update goal current_amount
    const { error: uError } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId);

    if (uError) throw uError;

    return { error: null, newTotal };
  } catch (err) {
    console.error('addSavingsContribution error:', err);
    return { error: err.message };
  }
}

export async function deleteSavingsGoal(userId, goalId) {
  if (!userId || !goalId) return { error: 'Invalid parameters' };

  try {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('deleteSavingsGoal error:', err);
    return { error: err.message };
  }
}

