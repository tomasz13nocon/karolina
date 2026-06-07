# Photo Set Popover Variants

The photography pages currently include `PhotoSetPopoverVariantSwitcher`, a fixed
corner UI for comparing selected-project popover concepts on staging.

This switcher is intentionally not development-only. It exists so variants can be
shown to the client on staging.

Before production deployment:

1. Choose the final `photoSetPopoverVariant` value.
2. Remove `PhotoSetPopoverVariantSwitcher` from the photography pages.
3. Remove any unused popover variants if they are no longer needed.
