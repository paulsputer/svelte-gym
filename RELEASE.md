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