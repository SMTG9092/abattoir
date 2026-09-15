/* =========================================================
   SMTG ABATTOIR
   SUPABASE CONFIGURATION + CENTRAL LOGGING
   ========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL =
    "https://bosliivjsmhpuietbcim.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dg7EBn5bAcr8VIcsbhopGA_ewJsG9iS";


/* =========================================================
   CREATE SUPABASE CLIENT
   ========================================================= */

if (typeof window.supabase === "undefined") {

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
   SUPABASE HELPER
   ========================================================= */

function getSupabase() {

    if (!window.smtgSupabase) {

        throw new Error(
            "Supabase n'est pas initialisé."
        );

    }

    return window.smtgSupabase;
}


/* =========================================================
   SESSION KEYS
   ========================================================= */

const SMTG_USER_KEY =
    "smtg_current_user";

const SMTG_SESSION_KEY =
    "smtg_session_id";


/* =========================================================
   GET CURRENT USER
   ========================================================= */

function getCurrentUser() {

    try {

        const sessionUser =
            sessionStorage.getItem(
                SMTG_USER_KEY
            );

        if (sessionUser) {

            return JSON.parse(
                sessionUser
            );

        }

    } catch (error) {

        console.warn(
            "Erreur lecture sessionStorage:",
            error
        );

    }


    try {

        const localUser =
            localStorage.getItem(
                SMTG_USER_KEY
            );

        if (localUser) {

            return JSON.parse(
                localUser
            );

        }

    } catch (error) {

        console.warn(
            "Erreur lecture localStorage:",
            error
        );

    }


    /* Compatibilité ancienne clé */

    try {

        const oldUser =
            sessionStorage.getItem(
                "smtgUser"
            );

        if (oldUser) {

            return JSON.parse(
                oldUser
            );

        }

    } catch (error) {

        console.warn(
            "Erreur lecture ancienne session:",
            error
        );

    }


    return null;
}


/* =========================================================
   GET SESSION ID
   ========================================================= */

function getSessionId() {

    let sessionId =
        sessionStorage.getItem(
            SMTG_SESSION_KEY
        );


    if (!sessionId) {

        sessionId =
            generateSessionId();

        sessionStorage.setItem(
            SMTG_SESSION_KEY,
            sessionId
        );

    }


    return sessionId;
}


/* =========================================================
   GENERATE SESSION ID
   ========================================================= */

function generateSessionId() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        "SMTG-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 12)
    );
}


/* =========================================================
   BROWSER INFORMATION
   ========================================================= */

function getBrowserInfo() {

    const ua =
        navigator.userAgent || "";


    let browser =
        "Unknown";

    let operatingSystem =
        "Unknown";

    let device =
        "Desktop";


    /* -------------------------
       BROWSER
       ------------------------- */

    if (
        ua.includes("Edg/")
    ) {

        browser = "Microsoft Edge";

    } else if (
        ua.includes("OPR/")
    ) {

        browser = "Opera";

    } else if (
        ua.includes("Chrome/")
    ) {

        browser = "Google Chrome";

    } else if (
        ua.includes("Firefox/")
    ) {

        browser = "Mozilla Firefox";

    } else if (
        ua.includes("Safari/")
    ) {

        browser = "Safari";

    }


    /* -------------------------
       OS
       ------------------------- */

    if (
        ua.includes("Windows NT")
    ) {

        operatingSystem =
            "Windows";

    } else if (
        ua.includes("Android")
    ) {

        operatingSystem =
            "Android";

    } else if (
        ua.includes("iPhone")
        ||
        ua.includes("iPad")
    ) {

        operatingSystem =
            "iOS";

    } else if (
        ua.includes("Mac OS X")
    ) {

        operatingSystem =
            "macOS";

    } else if (
        ua.includes("Linux")
    ) {

        operatingSystem =
            "Linux";

    }


    /* -------------------------
       DEVICE
       ------------------------- */

    if (
        /Mobile|Android|iPhone|iPad/i
            .test(ua)
    ) {

        device = "Mobile";

    }


    return {

        browser:
            browser,

        operatingSystem:
            operatingSystem,

        device:
            device,

        userAgent:
            ua

    };

}


/* =========================================================
   CURRENT PAGE
   ========================================================= */

function getCurrentPageInfo() {

    let page =
        window.location.pathname
            .split("/")
            .pop();


    if (!page) {

        page = "index.html";

    }


    return page;
}


/* =========================================================
   GET CURRENT USER DATA
   ========================================================= */

function getAuditUserData() {

    const user =
        getCurrentUser();


    if (!user) {

        return {

            user_id: null,

            username: null,

            full_name: null

        };

    }


    return {

        user_id:
            user.id || null,

        username:
            user.username || null,

        full_name:
            user.full_name || null

    };

}


/* =========================================================
   LOG ACTIVITY
   ========================================================= */

async function logActivity(options = {}) {

    try {

        const supabase =
            getSupabase();


        const user =
            getAuditUserData();


        const page =
            options.page ||
            getCurrentPageInfo();


        const browser =
            getBrowserInfo();


        const data = {

            user_id:
                user.user_id,

            username:
                user.username,

            full_name:
                user.full_name,

            action:
                options.action ||
                "ACTION",

            module:
                options.module ||
                null,

            page:
                page,

            page_code:
                options.page_code ||
                null,

            description:
                options.description ||
                null,

            entity_type:
                options.entity_type ||
                null,

            entity_id:
                options.entity_id != null
                    ? String(options.entity_id)
                    : null,

            ip_address:
                options.ip_address ||
                null,

            user_agent:
                browser.userAgent,

            metadata:
                options.metadata ||
                null

        };


        const {
            error
        } = await supabase
            .from("activity_logs")
            .insert(data);


        if (error) {

            console.error(
                "Erreur Activity Log:",
                error
            );

            return false;

        }


        return true;

    } catch (error) {

        console.error(
            "Erreur logActivity:",
            error
        );

        return false;

    }

}


/* =========================================================
   LOG SYSTEM
   ========================================================= */

async function logSystem(options = {}) {

    try {

        const supabase =
            getSupabase();


        const user =
            getAuditUserData();


        const browser =
            getBrowserInfo();


        const page =
            options.page ||
            getCurrentPageInfo();


        const data = {

            level:
                options.level ||
                "INFO",

            source:
                options.source ||
                "WEB",

            module:
                options.module ||
                null,

            page:
                page,

            event:
                options.event ||
                "SYSTEM_EVENT",

            message:
                options.message ||
                null,

            details:
                options.details ||
                null,

            user_id:
                user.user_id,

            username:
                user.username,

            full_name:
                user.full_name,

            ip_address:
                options.ip_address ||
                null,

            user_agent:
                browser.userAgent,

            request_id:
                options.request_id ||
                null,

            metadata:
                options.metadata ||
                null

        };


        const {
            error
        } = await supabase
            .from("system_logs")
            .insert(data);


        if (error) {

            console.error(
                "Erreur System Log:",
                error
            );

            return false;

        }


        return true;

    } catch (error) {

        console.error(
            "Erreur logSystem:",
            error
        );

        return false;

    }

}


/* =========================================================
   LOG BOTH
   ACTIVITY + SYSTEM
   ========================================================= */

async function logEvent(options = {}) {

    const activityResult =
        await logActivity(
            options
        );


    const systemResult =
        await logSystem(
            options
        );


    return {

        activity:
            activityResult,

        system:
            systemResult,

        success:
            activityResult &&
            systemResult

    };

}


/* =========================================================
   LOGIN HISTORY
   ========================================================= */

async function logLogin(options = {}) {

    try {

        const supabase =
            getSupabase();


        const user =
            getCurrentUser();


        const browser =
            getBrowserInfo();


        const sessionId =
            getSessionId();


        const data = {

            user_id:
                user?.id || null,

            username:
                options.username ||
                user?.username ||
                null,

            full_name:
                user?.full_name ||
                null,

            login_at:
                new Date()
                    .toISOString(),

            status:
                options.status ||
                "SUCCESS",

            ip_address:
                options.ip_address ||
                null,

            user_agent:
                browser.userAgent,

            session_id:
                sessionId,

            failure_reason:
                options.failure_reason ||
                null,

            metadata:
                options.metadata ||
                null

        };


        const {
            data: result,
            error
        } = await supabase
            .from("login_history")
            .insert(data)
            .select()
            .single();


        if (error) {

            console.error(
                "Erreur Login History:",
                error
            );

            return null;

        }


        return result;

    } catch (error) {

        console.error(
            "Erreur logLogin:",
            error
        );

        return null;

    }

}


/* =========================================================
   CREATE ACTIVE SESSION
   ========================================================= */

async function createUserSession() {

    try {

        const supabase =
            getSupabase();


        const user =
            getCurrentUser();


        if (!user) {

            return null;

        }


        const browser =
            getBrowserInfo();


        const sessionId =
            getSessionId();


        const data = {

            user_id:
                user.id || null,

            username:
                user.username || null,

            full_name:
                user.full_name || null,

            session_id:
                sessionId,

            status:
                "ACTIVE",

            login_at:
                new Date()
                    .toISOString(),

            last_activity_at:
                new Date()
                    .toISOString(),

            logout_at:
                null,

            expires_at:
                null,

            ip_address:
                null,

            user_agent:
                browser.userAgent,

            device:
                browser.device,

            browser:
                browser.browser,

            operating_system:
                browser.operatingSystem,

            metadata:
                null

        };


        const {
            data: result,
            error
        } = await supabase
            .from("sessions")
            .upsert(
                data,
                {
                    onConflict:
                        "session_id"
                }
            )
            .select()
            .single();


        if (error) {

            console.error(
                "Erreur création session:",
                error
            );

            return null;

        }


        return result;

    } catch (error) {

        console.error(
            "Erreur createUserSession:",
            error
        );

        return null;

    }

}


/* =========================================================
   UPDATE SESSION ACTIVITY
   ========================================================= */

async function updateSessionActivity() {

    try {

        const supabase =
            getSupabase();


        const sessionId =
            sessionStorage.getItem(
                SMTG_SESSION_KEY
            );


        if (!sessionId) {

            return false;

        }


        const {
            error
        } = await supabase
            .from("sessions")
            .update({

                last_activity_at:
                    new Date()
                        .toISOString(),

                updated_at:
                    new Date()
                        .toISOString()

            })
            .eq(
                "session_id",
                sessionId
            )
            .eq(
                "status",
                "ACTIVE"
            );


        if (error) {

            console.error(
                "Erreur mise à jour session:",
                error
            );

            return false;

        }


        return true;

    } catch (error) {

        console.error(
            "Erreur updateSessionActivity:",
            error
        );

        return false;

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logLogout() {

    try {

        const supabase =
            getSupabase();


        const sessionId =
            sessionStorage.getItem(
                SMTG_SESSION_KEY
            );


        const now =
            new Date()
                .toISOString();


        /* -------------------------
           UPDATE SESSION
           ------------------------- */

        if (sessionId) {

            const {
                error
            } = await supabase
                .from("sessions")
                .update({

                    status:
                        "LOGGED_OUT",

                    logout_at:
                        now,

                    last_activity_at:
                        now,

                    updated_at:
                        now

                })
                .eq(
                    "session_id",
                    sessionId
                );


            if (error) {

                console.error(
                    "Erreur fermeture session:",
                    error
                );

            }


            /* -------------------------
               LOGIN HISTORY
               ------------------------- */

            const {
                error:
                    historyError
            } = await supabase
                .from("login_history")
                .update({

                    logout_at:
                        now

                })
                .eq(
                    "session_id",
                    sessionId
                )
                .is(
                    "logout_at",
                    null
                );


            if (historyError) {

                console.error(
                    "Erreur logout history:",
                    historyError
                );

            }

        }


        /* -------------------------
           ACTIVITY LOG
           ------------------------- */

        await logActivity({

            action:
                "LOGOUT",

            module:
                "AUTHENTICATION",

            page:
                "index.html",

            page_code:
                "LOGOUT",

            description:
                "Déconnexion utilisateur",

            metadata: {

                session_id:
                    sessionId

            }

        });


        /* -------------------------
           SYSTEM LOG
           ------------------------- */

        await logSystem({

            level:
                "INFO",

            source:
                "AUTHENTICATION",

            module:
                "AUTHENTICATION",

            page:
                "index.html",

            event:
                "LOGOUT",

            message:
                "Déconnexion utilisateur",

            metadata: {

                session_id:
                    sessionId

            }

        });


        return true;

    } catch (error) {

        console.error(
            "Erreur logLogout:",
            error
        );

        return false;

    }

}


/* =========================================================
   GENERIC CRUD LOG
   ========================================================= */

async function logCrudAction(
    action,
    module,
    entityType,
    entityId,
    description,
    metadata = null
) {

    return await logEvent({

        action:
            action,

        module:
            module,

        entity_type:
            entityType,

        entity_id:
            entityId,

        description:
            description,

        metadata:
            metadata

    });

}


/* =========================================================
   LOG ERROR
   ========================================================= */

async function logError(
    event,
    message,
    options = {}
) {

    return await logSystem({

        level:
            "ERROR",

        source:
            options.source ||
            "WEB",

        module:
            options.module ||
            null,

        page:
            options.page ||
            getCurrentPageInfo(),

        event:
            event,

        message:
            message,

        details:
            options.details ||
            null,

        metadata:
            options.metadata ||
            null

    });

}


/* =========================================================
   LOG WARNING
   ========================================================= */

async function logWarning(
    event,
    message,
    options = {}
) {

    return await logSystem({

        level:
            "WARNING",

        source:
            options.source ||
            "WEB",

        module:
            options.module ||
            null,

        page:
            options.page ||
            getCurrentPageInfo(),

        event:
            event,

        message:
            message,

        details:
            options.details ||
            null,

        metadata:
            options.metadata ||
            null

    });

}


/* =========================================================
   AUTOMATIC SESSION ACTIVITY
   ========================================================= */

document.addEventListener(
    "click",
    function () {

        updateSessionActivity();

    }
);


/* =========================================================
   PERIODIC SESSION ACTIVITY
   ========================================================= */

setInterval(
    function () {

        updateSessionActivity();

    },
    5 * 60 * 1000
);


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.SMTG = {

    getSupabase:
        getSupabase,

    getCurrentUser:
        getCurrentUser,

    getSessionId:
        getSessionId,

    getBrowserInfo:
        getBrowserInfo,

    logActivity:
        logActivity,

    logSystem:
        logSystem,

    logEvent:
        logEvent,

    logLogin:
        logLogin,

    createUserSession:
        createUserSession,

    updateSessionActivity:
        updateSessionActivity,

    logLogout:
        logLogout,

    logCrudAction:
        logCrudAction,

    logError:
        logError,

    logWarning:
        logWarning

};
