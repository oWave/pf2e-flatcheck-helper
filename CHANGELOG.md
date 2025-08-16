# Changelog
🥭

## [Unreleased]

## Fixed
- Global illumination overriding dim light even if a scene region makes it dark

## [0.18.0] - 2025-08-14
### Added
- Custom Rule Elements
  - `fc-ModifyFlatDC` to change the DCs of flat checks
  - `fc-AddCheck` to add custom flat checks
  - `fc-TreatAs` to change what a condition counts as
  - Details in the wiki: https://github.com/oWave/pf2e-flatcheck-helper/wiki
- Setting to auto-roll flat checks
- Support for PF2e Visioneer

### Changed
- Flat checks on messages with a target (like attack rolls) only show flat checks for that target

### Removed
- PF2e Perception support

### Fixed
- Outline filter making an invisble token disappear
- Delay button not showing in the PF2e HUD combat tracker for players

## [0.17.1] - 2025-08-02
### Added
- Show initiative value for turns in the delay after dialog

### Fixed
- Unable to delay to last turn when first in initiative

## [0.17.0] - 2025-07-26
### Added
- Override setting for the PF2e HUD combat tracker is back

### Changed
- Overhauled the entire delay implementation. Should be a little faster and less prone to breaking
  - The "delay after" dialog is now a clickable list of all combatants instead of a dropdown

### Fixed
- Greater Darkvision not counting as Darkvision
- Delaying resulting in the wrong combatant's turn active
- Delaying skipping the next turn

## [0.16.1] - 2025-07-17
### Fixed
- Switch to foundry's calculation for darkness regions
- Delay button not showing in the combat tracker
- Flat checks showing on rolls that don't need any

## [0.16.0] - 2025-06-05
Foundry v13 release

### Removed
- Flat check buttons in the chat tab

## [0.15.1] - 2025-05-09
### Fixed
- A square in dim light from a light source being considered dim even if the scene is brighter
- Light Visualization breaking if the scene is wider than it is tall

## [0.15.0] - 2025-05-02
### Added
- **Documentation!** The module settings now include a button to open a detailed explanation of everything in this module.

### Changed
- Switched the "Flat Checks in Messages" setting from client to world
- Show Light Visualization above tiles

## [0.14.5] - 2025-04-19
### Changed
- Alternative Roll Breakdowns: Show GMs which modifiers players can see

### Fixed
- Missing translation entries

## [0.14.4] - 2025-04-08
### Added
- Full localization support by @Cuingamehtar
- Polish translation by @Lioheart

## [0.14.3] - 2025-03-24
### Fixed
- Dim light in a darkness region getting ignored

## [0.14.2] - 2025-03-23
### Fixed
- Token light source are no longer ignored
- Another user targeting a token no longer shows/removes the marker
- Swapped out the token marker filter for a foundry built-in one, so the module no longer includes an entire copy of pixiJS

## [0.14.1] - 2025-03-22
### Changed
- Flat check info on tokens:
  - With pf2e-perception installed, don't show target-only flat checks
  - Scale font size with grid and token size

## [0.14.0] - 2025-03-22
### Added
- Showing flat check info on a token when targeting
- Light Level Visualization: Hold alt to highlight squares with no/dim light
- Light Level Flat Checks: Treat target as concealed/hidden if in dim light/darkness
  - Disabled by default (for now). Toggle is in the flat check config

## [0.13.4] - 2025-03-12
### Fixed
- Flat checks showing on damage/healing received messages

[Unreleased]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.18.0...HEAD
[0.18.0]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.17.1...v0.18.0
[0.17.1]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.16.1...v0.17.0
[0.16.1]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.16.0...v0.16.1
[0.16.0]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.15.1...v0.16.0
[0.15.1]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.5...v0.15.0
[0.14.5]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.4...v0.14.5
[0.14.4]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.3...v0.14.4
[0.14.3]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.2...v0.14.3
[0.14.2]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.13.4...v0.14.0
[0.13.4]: https://github.com/oWave/pf2e-flatcheck-helper/releases/tag/v0.13.4
