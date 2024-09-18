# Release v0.3.0

This version deprecates all previous grid settings in favour of a more structured naming convention.  
Previous names will continue to work but emit a console warning about the deprecated name usage.

 + 0-grid-light-mode
 + 10-grid-light-mode
 + 20-grid-light-mode
 + 50-grid-light-mode
 + 100-grid-light-mode
 + 0-grid-dark-mode
 + 10-grid-dark-mode
 + 20-grid-dark-mode
 + 50-grid-dark-mode
 + 100-grid-dark-mode
 + 10-text-light-mode
 + 20-text-light-mode
 + 50-text-light-mode
 + 100-text-light-mode
 + 10-text-dark-mode
 + 20-text-dark-mode
 + 50-text-dark-mode
 + 100-text-dark-mode

# Release v0.2.1

HOTFIX: remove stay import breaking build once imported

# Release v0.2.0

## Major Features and Improvements

### TestHarness

Now supports the following different grid backgrounds:

+ none
+ light
+ dark
+ black
+ white
+ textBlack
+ textWhite

These help test various scenarios especially when testing opacity and blurs on components.

To avoid any breaking changes usage of true / false continues to work.

### GymDropdown
+ learnt to accept objects and arrays of objects
    + array of objects default to `label` and `value` to override use `optLabel` and `optValue` attributes
+ learnt to use jsonpath for props

### GymSlider
+ learnt to accept a functor `fn` to apply to values
    + A common usage is to get decimal percentage i.e.  `(v) => v / 100`
+ learnt to default to useful min/max based on units if no min/max provided

## Bug Fixes and Other Changes

+ GymSlider units attribute defaults to null to get number rather than string value
+ Controls side bar now scrolls content to avoid page scrolling