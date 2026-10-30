# English / Reading and notifications

Today shows compact English and Reading cards for the selected task date. Add a material/book, optional scope/pages, and estimated minutes. The same dated item appears in Today Task; checks are shared, and time can be assigned there. Unfinished items follow the existing carry rules. Removing an item sends it to Trash and hides its future time slots; restoring recovers it.

## Notifications on each device
1. Open Settings and sign in to the same sync account.
2. On iPhone/iPad, launch the app added to the Home Screen.
3. In Notifications choose schedule reminders (default 10 minutes; 5/10/15/30 selectable) and/or the daily 21:00 planning reminder.
4. Tap Enable and accept the device's notification prompt. Send a test notification to verify delivery.

Notification registration is device-specific. The schedule comes from the latest cloud-synced calendar, with Japanese time used explicitly. Changes, completed work, skipped recurring occurrences and inactive carried appointments are excluded. Offline/Focus/device restrictions may delay delivery. A test accepted by the push service does not prove arrival on an actual phone; verify on the phone.

## Server implementation
`supabase/push-setup.sql` is the applied one-time schema and cron setup. `supabase/functions/discipline-push/index.ts` authenticates every user action using Supabase Auth; dispatcher calls require a separate server-only random cron secret. Gateway JWT verification is disabled because authentication is performed in the function for both user and cron callers.

VAPID keys are generated once on the server and kept in a service-role-only RLS table. Browser clients receive only the public key. Push subscriptions and deduplication records are also service-role-only; the function filters by authenticated owner. Endpoint host allowlisting blocks arbitrary URLs. Revoked/expired endpoints are disabled. No credentials or private user content are checked into this repository.

The cron checks every minute only when devices are enrolled. Delivery records prevent duplicates and expire after seven days. Push payloads include schedule names visible on the lock screen. Signing out unsubscribes this device. The setup is already deployed for this app; do not rerun the one-time SQL against the same database.

Checks: planning regressions, English/Reading materialization/carry/restore, independent-device sync, pure notification timing/recurrence/completion/endpoint tests, offline service worker tests, live authenticated dispatcher response, anonymous request rejection, RLS/table grants and active cron schedule. Phone delivery still requires the user's device opt-in.