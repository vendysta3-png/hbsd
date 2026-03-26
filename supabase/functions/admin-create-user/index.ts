import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: "Configuration serveur invalide" }, 500);
    }

    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    const bearerMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
    const token = bearerMatch?.[1]?.trim();

    if (!token) {
      return jsonResponse({ error: "Non authentifié" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Non authentifié" }, 401);
    }

    const callerId = userData.user.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!isAdmin) {
      return jsonResponse({ error: "Non autorisé" }, 403);
    }

    const { action, email, password, role, userId } = await req.json();

    if (action === "list") {
      const { data: usersResult, error } = await adminClient.auth.admin.listUsers();
      if (error) throw error;

      const users = usersResult?.users ?? [];
      const { data: roles } = await adminClient.from("user_roles").select("user_id, role");

      const enriched = users.map((u) => ({
        id: u.id,
        email: u.email,
        role: roles?.find((r) => r.user_id === u.id)?.role || "user",
        created_at: u.created_at,
      }));

      return jsonResponse({ users: enriched });
    }

    if (action === "create") {
      const { data: newUser, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;

      if (role && role !== "user") {
        await adminClient.from("user_roles").insert({ user_id: newUser.user.id, role });
      }

      return jsonResponse({ user: newUser.user });
    }

    if (action === "update") {
      const updates: Record<string, string> = {};
      if (email) updates.email = email;
      if (password) updates.password = password;

      const { error } = await adminClient.auth.admin.updateUserById(userId, updates);
      if (error) throw error;

      if (role) {
        await adminClient.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id" });
      }

      return jsonResponse({ success: true });
    }

    if (action === "delete") {
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Action inconnue" }, 400);
  } catch (error: any) {
    return jsonResponse({ error: error?.message || "Erreur inattendue" }, 400);
  }
});
