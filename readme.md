# PF2e Utility Buttons

Some automation for PF2e, just a button click away.

**For a detailed description of the features listed here and how to configure them, check out the documentation in foundry. You can find it in the module settings.**

## Flat Check Helpers
![flat-in-message](https://github.com/user-attachments/assets/af0ff054-b1d9-4400-8986-f24ecd9a1ebb)

Also shows flat checks when targetting a token. You can hold ALT to highlight squares that have no/dim light.
![image](https://github.com/user-attachments/assets/bf9f7c53-4c85-4658-854d-0746719df2d2)
**The dim light/darkness flat checks are not enabled by default (yet). You can turn them on in the flat check settings.**

### Custom Rule Elements
To modify flat check DCs or add custom checks, use the [rule elements](https://github.com/oWave/pf2e-flatcheck-helper/wiki#rule-elements) added by this module

## Delay Button
![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/df782d32-50ec-45fd-93f2-f40d0b63932d)

Adds buttons to delay (and return) a combatant's turn.
- In the combat tracker
- In the token HUD (menu when right-clicking a token)
- Also works when using the "Delay" action
  - The slug of that action (set in the rules tab) need to be "delay". You can change the name and description (and even leave the latter blank to save space)

Has some variants you can toggle in the module settings:
- Return button can be turned off, so delaying is just a marker
- Prompt for new initiative: Lets the user select which turn to delay after. Can still return early if they wish.

## Spirit & Life Link + Share Life Automation
Adds a chat message on turn start (spirit link) and damage (life link & share life) to transfer HP from caster to spell target.  
Requires the use of the marker effects (see below)

![image](https://github.com/user-attachments/assets/b22001ec-f8d0-4389-97a2-04845b83038d)

### Setup
The marker effects for all spells can be found in the compendium that the module adds. They need to be added to the spell by dragging them into their description, i.e. `@UUID[Compendium.pf2e-flatcheck-helper.Effects.Item.iyTVTu4ImC5jDtMU]{Spirit Linked}`.  
The effects need to be dragged onto their targets with the spell posted to chat. Dragging the effects onto tokens from the sidebar or a character sheet will not work.

## Emanation Automation
**Experimental, may change how this works in the future**

Adds a button to emanation spells that applies the spell effect to all tokens in the area.
![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/830d4b77-bb3e-4534-a3af-cd6898da3cfb)

- The config options show up in the spells detail tab if
  - no defense is set (no save)
  - the area is set to emanation
- After setting "Apply to", the button shows up in that spells chat card (for GMs only)

## Miscellaneous
- Alternative Roll Breakdowns
  - Reveals some roll modifiers (e.g. circumstance modifies like multi attack penalty, status bonuses, other untyped bonuses) to players.
- Automatic Shared Vision Toggle
  - Toggles the system's Shared Vision setting at the start and end of combat.
