# Changelog
🥭

## [Unreleased]
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

[Unreleased]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.2...HEAD
[0.14.2]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/oWave/pf2e-flatcheck-helper/compare/v0.13.4...v0.14.0
[0.13.4]: https://github.com/oWave/pf2e-flatcheck-helper/releases/tag/v0.13.4
