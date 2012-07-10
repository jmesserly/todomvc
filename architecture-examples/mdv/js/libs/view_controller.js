// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function() {
  var CONTROLLER_ATTRIBUTE = 'data-controller';
  var CONTROLLER_SELECTOR = '*[' + CONTROLLER_ATTRIBUTE + ']';

  var ACTION_ATTRIBUTE = 'data-action';
  var ACTION_SELECTOR = '*[' + ACTION_ATTRIBUTE + ']';

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

  function registerController(elm) {
    var controllerClass = elm.getAttribute(CONTROLLER_ATTRIBUTE);
    if (!controllerClass ||
        !this[controllerClass] ||
        typeof this[controllerClass] != 'function') {
      return;
    }

    var controller = new this[controllerClass](elm);
    if (controller.model) {
      elm.model = controller.model;
    }
    elm.controller = controller;
    elm.modelDelegate = MDVDelegate;
  }

  var registeredEvents = {};

  function getAction(elm) {
    var actionText = elm.getAttribute(ACTION_ATTRIBUTE);
    if (!actionText)
      return;
    var tokens = actionText.split(':');
    if (tokens.length != 2) {
      console.error('Invalid action: ' + actionText);
      return;
    }

    return {
      eventType: tokens[0],
      name: tokens[1]
    }
  }

  var nonBubblingEvents = {
    blur: true
  };

  function eventBubbles(name) {
    !nonBubblingEvents[name];
  }

  function registerAction(elm) {
    var action = getAction(elm);
    if (!action)
      return;
    if (eventBubbles(action.eventType)) {
      if (registeredEvents[action.eventType])
        return;
      document.addEventListener(action.eventType, handleAction, false);
      registeredEvents[action.eventType] = true;
    } else {
      elm.addEventListener(action.eventType, handleAction, false);
    }
  }

  var observer;

  function handleDOMChanges(summaries) {
    var controllerSummary = summaries[0];
    var actionSummary = summaries[1];

    controllerSummary.added.forEach(registerController);
    actionSummary.added.forEach(registerAction);

    // TODO: Cleanup when elements are removed.
    // TODO: Cleanup non-bubbling event listeners
  }

  document.addEventListener('DOMContentLoaded', function(e) {
    var controllerElements = document.querySelectorAll(CONTROLLER_SELECTOR);
    forEach(controllerElements, registerController);

    var actionElements = document.querySelectorAll(ACTION_SELECTOR);
    forEach(actionElements, registerAction);

    observer = new MutationSummary({
      callback: handleDOMChanges,
      queries: [
        { attribute: CONTROLLER_ATTRIBUTE },
        { attribute: ACTION_ATTRIBUTE }
      ]
    });
  }, false);

  function handleAction(e) {
    var action = getAction(e.currentTarget);
    if (!action || action.eventType != e.type)
      return;

    var currentTarget = e.target;
    var handled = false;
    while (!handled && currentTarget) {
      if (!currentTarget.controller ||
          !currentTarget.controller[action.name] ||
          typeof currentTarget.controller[action.name] != 'function') {
        currentTarget = currentTarget.parentNode;
        continue;
      }
 
      var func = currentTarget.controller[action.name];
      func.call(currentTarget.controller, e.target.model, e);
      handled = true;
    }

    if (handled)
      e.preventDefault();
    else
      console.error('Error: unhandled action', action, e);
  }
})();
