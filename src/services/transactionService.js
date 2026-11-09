/**
 * Transaction Service for LUNARA
 * Handles database operations for income and expense transactions.
 */
import { supabase } from './supabaseClient';

export async function getTransactions(userId) {
  if (!userId) return { data: [], error: 'No user ID provided' };

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category_name,
      amount: parseFloat(t.amount),
      type: t.type,
      date: new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawDate: t.transaction_date,
      iconName: t.icon_name || 'Tag',
      note: t.note,
    }));

    return { data: formatted, error: null };
  } catch (err) {
    console.error('getTransactions error:', err);
    return { data: [], error: err.message };
  }
}

export async function addTransaction(userId, tx) {
  if (!userId) return { data: null, error: 'User must be authenticated' };

  try {
    const payload = {
      user_id: userId,
      title: tx.title,
      category_name: tx.category,
      amount: parseFloat(tx.amount),
      type: tx.type,
      transaction_date: tx.rawDate || new Date().toISOString().split('T')[0],
      icon_name: tx.iconName || 'Tag',
      note: tx.note || null,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    const formatted = {
      id: data.id,
      title: data.title,
      category: data.category_name,
      amount: parseFloat(data.amount),
      type: data.type,
      date: new Date(data.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawDate: data.transaction_date,
      iconName: data.icon_name,
      note: data.note,
    };

    return { data: formatted, error: null };
  } catch (err) {
    console.error('addTransaction error:', err);
    return { data: null, error: err.message };
  }
}

export async function removeTransaction(userId, transactionId) {
  if (!userId || !transactionId) return { error: 'Invalid parameters' };

  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('removeTransaction error:', err);
    return { error: err.message };
  }
}

