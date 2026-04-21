# Changelog

## [2026-04-21]

### Fixed
- **PDF Diacritics**: Integrated Roboto (Regular & Bold) custom fonts to correctly display Romanian characters (ă, â, î, ș, ț) in all exported PDF documents.
- **Branding Update**: Changed the primary accent color from teal (`#38B2AE`) to the new brand blue (`#11a5ea`) across all PDF templates (headers, borders, and accents).
- **Calendar Visibility**: Removed transparency and backdrop blur from the `DatePicker` component to ensure text is fully legible when the calendar overlays other elements.
- **BNM Rates Block**: 
    - Improved visibility in light mode with a more prominent border (`border-slate-200`) and shadow.
    - Updated the status text to display "Actualizat" for a clearer user confirmation.
    - Refined the refresh button for better accessibility.

### Technical
- Added `src/utils/fonts.ts` containing Base64 encoded Roboto fonts.
- Refactored `pdfExport.ts` to use a centralized `createDoc` utility for font registration.
- Updated `App.tsx` and `DatePicker.tsx` for UI improvements.
