import { supabase } from "@/integrations/supabase/client";

// User API - get current authenticated user's record
export async function getCurrentUser() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .limit(1)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Meeting API
export async function createMeeting(data: {
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
}) {
  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert(data)
    .select("*, users(name, email)")
    .single();
  if (error) {
    if (error.message.includes("Time slot already booked")) {
      throw new Error("Time slot already booked");
    }
    if (error.message.includes("startTime must be before endTime")) {
      throw new Error("Start time must be before end time");
    }
    throw new Error(error.message);
  }
  return meeting;
}

export async function getMeetings(filters?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from("meetings")
    .select("*, users(name, email)")
    .order("start_time", { ascending: true });

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }
  if (filters?.startDate) {
    query = query.gte("start_time", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("end_time", filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getMeetingById(id: string) {
  const { data, error } = await supabase
    .from("meetings")
    .select("*, users(name, email)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMeeting(
  id: string,
  data: { title?: string; start_time?: string; end_time?: string }
) {
  const { data: meeting, error } = await supabase
    .from("meetings")
    .update(data)
    .eq("id", id)
    .select("*, users(name, email)")
    .single();
  if (error) {
    if (error.message.includes("Time slot already booked")) {
      throw new Error("Time slot already booked");
    }
    if (error.message.includes("startTime must be before endTime")) {
      throw new Error("Start time must be before end time");
    }
    throw new Error(error.message);
  }
  return meeting;
}

export async function deleteMeeting(id: string) {
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
