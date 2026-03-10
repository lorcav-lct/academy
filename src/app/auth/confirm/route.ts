import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "recovery" | "email_change",
    });

    if (!error) {
      if (type === "email_change") {
        // Sign out so the user re-authenticates with the new email
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/auth/email-changed`);
      }
      return NextResponse.redirect(`${origin}/account`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirm`);
}
