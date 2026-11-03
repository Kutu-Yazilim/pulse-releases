# Pulse

Pulse is a macOS utility app that brings live system stats, a dynamic notch,
window and input tools, a cleaner and disk map, and AI agents into one place.

This repository only hosts **Pulse's downloads and update feed**. The source
code is private.

## Download

Get the latest DMG from [Releases](https://github.com/Kutu-Yazilim/pulse-releases/releases/latest),
open it and drag Pulse to Applications.

Requires macOS 26 or later (Apple silicon and Intel).

### First launch

Pulse isn't notarized yet, so macOS may say it can't verify the developer.
Open **System Settings › Privacy & Security** and click **Open Anyway**, or
right-click Pulse in Applications and choose **Open**. You only need to do
this once: updates installed from inside Pulse don't ask again.

## Privacy

- Everything lives on your Mac: `~/Library/Application Support/Pulse` (metrics, memory, runs) and `~/Pulse Knowledge` (the knowledge vault, in git).
- Raw messages, mail and calendar items are read only by the local model (Apple's on-device model by default).
- The cloud model you choose sees extracted, redacted facts and page diffs, never raw messages. "Keep everything on this Mac" removes it entirely.
- No telemetry. The only network call Pulse makes on its own is the daily update check, which reads `appcast.xml` from this repository.

## Updates

Pulse checks this repository once a day and tells you when a new version is
out; you choose when to install it (Pulse › About › Updates). Updates are
signed, and Pulse refuses any update that isn't.

Pulse 1.5.1 and older have no updater: download 1.6.0 once by hand.

## Feedback

Report bugs and ideas in [Issues](https://github.com/Kutu-Yazilim/pulse-releases/issues).

## Licence

[MIT](LICENSE).
