import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseBrowserClient } from "@/app/lib/supabase";
import { slugify } from "@/app/lib/utils";

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = createSupabaseBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET all categories
export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST create category
export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { name, description, phase1_finalists_count, sort_order } = body;

  if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

  const slug = slugify(name);
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, description, slug, phase1_finalists_count: phase1_finalists_count ?? 3, sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}