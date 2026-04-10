import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { slugify } from "@/app/lib/utils";

// GET
export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST
export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const { name, description, phase1_finalists_count, sort_order } = body;

  if (!name) {
    return NextResponse.json(
      { error: "El nombre es requerido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      description,
      slug: slugify(name),
      phase1_finalists_count: phase1_finalists_count ?? 3,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json(
      { error: "ID requerido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      ...updates,
      ...(updates.name ? { slug: slugify(updates.name) } : {}),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}