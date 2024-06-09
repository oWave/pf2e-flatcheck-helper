# pf2e Utility Buttons

## Flat Check Helpers
![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/ed949d77-3cc3-48c3-a245-c637aa14d7bb)

Adds some buttons below the chat box for quickly rolling various flat checks.
* Hold control for secret rolls
* The target button automatically rolls the right flat check based on your targeted token. Currently only checks concealed/hidden/invisible. More soon™ (maybe)

## Delay Button
![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/df782d32-50ec-45fd-93f2-f40d0b63932d)

Adds buttons that allow delaying a combatants turn (and returning to initiative).
- In the combat tracker
- In the token HUD (menu when right-clicking a token)
- Also works when using the "Delay" action (any action named "Delay" or the delay action imported from the system compendium)

Has some options:
- Return button can be turned off, so delaying is just a marker
- Prompt-variant: Lets the user select which turn to delay after. Can still return early if they wish.

Returning to initiative requires the [socketlib](https://foundryvtt.com/packages/socketlib) module.

## Spirit & Life Link + Share Life Automation
Adds a chat message on turn start (spirit link) and damage (life link & ~~shield other~~ share life) to tranfer HP from caster to spell target.  
Requires the use of the marker effects (see below)

![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/53fe08d3-b427-482c-bee5-244e206b8195)

### Setup
You can find the marker effects for all spells in the compendium the module adds. They need to be added to those spell by dragging them into their description, i.e. `@UUID[Compendium.pf2e-flatcheck-helper.Effects.Item.iyTVTu4ImC5jDtMU]{Spirit Linked}`.  
The effects need to be dragged onto their targets with the spell posted to chat. Dragging the effects onto tokens from the sidebar or a character sheet will not work.

## Emanation Automation
**Work in progress, v0.8 pre-release only right now**

Adds a button to any emanation spells (that don't need a save) that allows a GM to apply the spells effect to all tokens in the area.
![chrome_g2zBZ20th5](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/830d4b77-bb3e-4534-a3af-cd6898da3cfb)
