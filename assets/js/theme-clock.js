// Light from 07:00 to 19:00 by the visitor's clock, dark otherwise. A manual
// choice holds until the next switch. Same rule as the portfolio
// (portfolio/src/lib/theme.ts): keep the hours and the storage key the same.
//
// This replaces Chirpy's theme.min.js, which followed the system colour scheme.
// It keeps the `Theme` interface the rest of the theme scripts call.
var Theme = (function () {
  'use strict';

  var DAY_START_HOUR = 7;
  var NIGHT_START_HOUR = 19;
  var CHOICE_KEY = 'theme-choice';
  var ATTR = 'data-mode';
  var DARK = 'dark';
  var LIGHT = 'light';
  var ID = 'theme-mode';
  var root = document.documentElement;
  var timer;

  function at(day, hour, dayOffset) {
    var date = new Date(day);
    date.setDate(date.getDate() + (dayOffset || 0));
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  function isNight(now) {
    var hour = now.getHours();
    return hour < DAY_START_HOUR || hour >= NIGHT_START_HOUR;
  }

  function lastSwitch(now) {
    var hour = now.getHours();
    if (hour >= NIGHT_START_HOUR) return at(now, NIGHT_START_HOUR);
    if (hour >= DAY_START_HOUR) return at(now, DAY_START_HOUR);
    return at(now, NIGHT_START_HOUR, -1);
  }

  function nextSwitch(now) {
    var hour = now.getHours();
    if (hour < DAY_START_HOUR) return at(now, DAY_START_HOUR);
    if (hour < NIGHT_START_HOUR) return at(now, NIGHT_START_HOUR);
    return at(now, DAY_START_HOUR, 1);
  }

  function resolveDark(now) {
    try {
      var choice = JSON.parse(localStorage.getItem(CHOICE_KEY));
      if (choice && choice.at >= lastSwitch(now).getTime()) return choice.dark;
    } catch (e) {
      // Blocked storage: follow the clock.
    }
    return isNight(now);
  }

  function visualState() {
    return root.getAttribute(ATTR) === DARK ? DARK : LIGHT;
  }

  // Giscus and Mermaid listen for this message to restyle themselves.
  function apply(dark) {
    var changed = root.getAttribute(ATTR) !== null && visualState() !== (dark ? DARK : LIGHT);
    root.setAttribute(ATTR, dark ? DARK : LIGHT);
    if (changed) window.postMessage({ id: ID }, '*');
  }

  // Re-check at each 07:00 and 19:00 switch, and when a sleeping tab wakes up.
  function sync() {
    var now = new Date();
    apply(resolveDark(now));
    clearTimeout(timer);
    timer = setTimeout(sync, nextSwitch(now).getTime() - now.getTime() + 1000);
  }

  function flip() {
    var dark = visualState() !== DARK;
    try {
      localStorage.setItem(CHOICE_KEY, JSON.stringify({ dark: dark, at: Date.now() }));
    } catch (e) {
      // Blocked storage: the choice lasts until the page reloads.
    }
    apply(dark);
  }

  sync();
  document.addEventListener('visibilitychange', sync);

  return {
    DARK: DARK,
    LIGHT: LIGHT,
    ID: ID,
    switchable: true,
    get visualState() {
      return visualState();
    },
    getThemeMapper: function (light, dark) {
      var mapper = {};
      mapper[LIGHT] = light;
      mapper[DARK] = dark;
      return mapper;
    },
    flip: flip,
  };
})();
