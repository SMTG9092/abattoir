/* =========================================================
   SMTG ABATTOIR
   Supabase Configuration
   ========================================================= */

/*
 * ضع هنا Project URL ديال Supabase
 *
 * مثال:
 * https://xxxxxxxxxxxx.supabase.co
 */
const SUPABASE_URL = "https://bosliivjsmhpuietbcim.supabase.co";


/*
 * ضع هنا Publishable / Anon Key
 *
 * ⚠️ ممنوع تحط service_role key هنا
 */
const SUPABASE_ANON_KEY = "sb_secret_VPwl2AD03tkVc47p81p9wg_YxzYDYQ4";


/* =========================================================
   CREATE SUPABASE CLIENT
   ========================================================= */

if (
    typeof window.supabase === "undefined"
) {

    console.error(
        "Supabase JS n'est pas chargé."
    );

} else {

    window.smtgSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

}


/* =========================================================
   HELPER
   ========================================================= */

function getSupabase() {

    if (
        !window.smtgSupabase
    ) {

        throw new Error(
            "Supabase n'est pas initialisé."
        );

    }

    return window.smtgSupabase;
}
