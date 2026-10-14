# Second-pass design review

**Viewport pass:** desktop 1440 px; mobile 390 × 844 px, with additional width checks at 320, 360, 428, 768, and 1024 px.

## Overall read

The portfolio has a clear point of view: editorial typography, a dark/ivory alternation, and a small set of loud accents. It now feels like a designed personal identity rather than a component-library portfolio. The main trade-off is deliberate intensity—the large type, labels, and motion all ask for attention—so the hierarchy has to stay disciplined.

## Typography & scale

- **Space Grotesk** carries the identity and readable body copy; **DM Mono** is reserved for factual labels, stack metadata, and controls; **DM Serif Display Italic** is the expressive counterpoint. I would not add another family. Keep the serif as a brief accent, not a paragraph face.
- The hero name scales from **69 px on a 320 px phone** to **262 px at 1440 px desktop**. Section headlines stay around **54–73 px on phones** and **96–138 px on wide screens**. That dramatic scale is intentional and remains inside the tested viewports.
- The first pass leaned too heavily on 7–12 px supporting copy. Core body copy and project details are now mostly **13–16 px on mobile**; labels and touch controls have been raised where practical. Tiny 7–8 px text is limited to decorative or secondary metadata.
- Bright coral on ivory/lime was the weakest contrast pairing. A deeper coral is now used on light surfaces, while the brighter coral remains on dark surfaces. The acid green means action/status; blue is mostly reserved for the playground, so the color shifts have a purpose.
- Font assets are now local **WOFF2**. The shipped font payload is about **77 KB**, down from roughly **367 KB** in the TTF first pass—about a **79% reduction**—without relying on a font CDN.

## Image review

- **Culture Vault:** its 1080 × 607 screenshot now stays at its native widescreen ratio with `object-fit: contain`. The 88% seal that sat on top of the screenshot has been removed; the maker-share figure remains in the project facts, where it does not obscure the work.
- **World Rows and PawBin:** their website captures also keep the full screenshot rather than being forced into a taller crop.
- **Town Fitness Point:** I checked the current live site and replaced the old portfolio capture with a photo-led triptych: the current homepage hero, plus current training-goal and conditioning imagery. The images are stored locally for a reliable preview.

## Mobile review

- Checked from **320–428 px**: no horizontal page overflow; the masthead fits; headings do not clip; the project screenshots stay widescreen; the Town Fitness gallery reflows into one hero image plus two smaller images.
- The app controls wrap cleanly, the mobile menu opens/closes, the calculator mode picker updates, and the game reaches its live state on a phone-sized viewport.
- The page is intentionally long—roughly **11.2k px at 390 px width**—because it tells the complete story (work, apps, experience, game, contact). Sticky navigation and the top progress line help. If this ever feels too long in live use, the first trim should be app-detail copy, not the project proof.

## Remaining judgement call

The hero is the densest composition: oversized name, orbit diagram, and circular sticker. On a phone it still reads, but it is the one area I would A/B against a quieter hero before publishing broadly. I kept it because the brief explicitly asked for an extreme direction—and because the main message remains legible at 320 px.

## QA notes

No JavaScript errors in the mobile pass; no horizontal overflow at the tested widths; local fonts and project images load; mobile menu, calculator mode selector, and game start were exercised. The contact form intentionally opens a pre-filled email draft rather than submitting to a backend.
