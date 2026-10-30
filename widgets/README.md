# ORBIT: two independent interactive widgets

`ORBIT Law` displays only law-exam tasks. `ORBIT Routine` displays only routines. They are separate Scripting projects, with private per-script storage and separate revocable credentials. Neither widget can read journals, school assignments, rules or argument texts.

## iPhone setup

1. Install Scripting: https://apps.apple.com/jp/app/scripting/id6479691128
2. Open ORBIT on the iPhone, sign in to the existing sync account, then open Settings → Widgets.
3. Under Law Exam, import the widget, create its connection code, run ORBIT Law in Scripting and paste the code.
4. Repeat independently under Routine, using its own code and ORBIT Routine project.
5. Add two Scripting home-screen widgets and select the corresponding project for each. Medium/large widgets are recommended. Tap a square in the list to set or undo completion through an AppIntent. No ORBIT launch is used for checking.

Law follows the task day (21:00 JST switches to tomorrow) and includes historical pending law tasks. Routine follows the real JST day and clears checks at midnight while preserving definitions/history. Stale displayed dates/items are rejected until refreshed. Offline cached lists are read-only; changes are not silently queued.

Connections expire after 90 days and can be revoked independently from Settings. Raw codes are shown only when created, kept in memory by the setup page, and saved in the iPhone's script-isolated Keychain. The database stores only SHA-256 hashes. Never share codes or put them in URLs. Download packages contain no user data or connection codes.

## Server

Apply `supabase/migrations/orbit_independent_check_widgets.sql`, then deploy `supabase/functions/orbit-checks` with platform JWT verification disabled because the handler verifies either an authenticated owner's JWT for connection management or a scoped widget credential for view/set. The function's service-role key is provided only through server environment variables.

All updates use revision compare-and-swap with retries and append law completion events compatible with normal multi-device sync. RLS is enabled with no public/authenticated grants on the credential table; only the service role accesses it.

## Verification and limitations

- Pure model/handler tests cover independence, owner checks, token hashing, revocation/expiry, date boundaries, stale items, undo/idempotency and concurrent diary edits.
- Existing app tests and the two-device sync adapter tests pass, including external widget updates alongside unsynced phone journal edits.
- Live endpoint rejects requests without credentials (401). Table grants and RLS checked.
- Native TS/TSX syntax transpiles. Windows cannot execute the iOS Scripting runtime. Import, actual widget rendering, permissions and background AppIntent execution must still be verified on an iPhone. iOS controls refresh timing; it is not guaranteed every five minutes.

Official interaction docs: https://scriptingapp.github.io/guide/Interactive%20Widget%20and%20LiveActivity
