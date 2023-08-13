# pf2e Utility Buttons

## Flat Check Helpers
![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/ed949d77-3cc3-48c3-a245-c637aa14d7bb)

Adds some buttons below the chat box for quickly rolling various flat checks.
* Hold control for secret rolls
* The target button automatically rolls the right flat check based on your targeted token. Currently only checks concealed/hidden/invisible. More soon™ (maybe)

## Delay Button
![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/df782d32-50ec-45fd-93f2-f40d0b63932d)

Adds a button in the combat tracker that lets the owner of the current combatant delay their turn, and pressing it again returns them to initiative (after the current turn).
Has some options:
- Return button can be turned off, so delaying is just a marker
- Prompt-variant: Lets the user select which turn to delay after. Can still return early if they wish.

## Spirit & Life Link Automation
Adds a chat message on turn start (spirit link) and damage (life link) to tranfer HP from caster to spell target.  
Requires the use of the marker effects (see below)

![image](https://github.com/oWave/pf2e-flatcheck-helper/assets/9253349/53fe08d3-b427-482c-bee5-244e206b8195)

### Setup
You can find the marker effects for both spells in the compendium the module adds. They need to be added to those spell by dragging them into their description, i.e. `@UUID[Compendium.pf2e-flatcheck-helper.Effects.Item.iyTVTu4ImC5jDtMU]{Spirit Linked}`.  
The effects need to be dragged onto their targets with the spell posted to chat. Dragging the effects onto tokens from the sidebar or a character sheet will not work.
