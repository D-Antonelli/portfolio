import { className } from "../js_modules/helper_functions.mjs";
import { Draggable } from "../js_modules/draggable.mjs";

var desktop = {
  buttons: {},
  files: {},
  activeApps: [],
};

desktop.buttons.closeButton = document.querySelectorAll(".close-btn");
desktop.files = document.querySelectorAll(".file");
desktop.apps = document.querySelectorAll(".pane");
desktop.click = document.querySelector(".click-sound");
desktop.draggables = document.querySelectorAll(".draggable");

//make frames draggable
desktop.dragFrames = (function () {
  for (var i = 0; i < desktop.draggables.length; i++) {
    new Draggable(
      desktop.draggables[i],
      desktop.draggables[i].querySelector(".inner-pane__header")
    );
  }
})();

desktop.openApp = function (event) {
  if (
    (event.target.className !== "file-icon" &&
      event.target.className !== "link" &&
      event.target.className !== "navigation__link") ||
    //exclude mail icon
    event.target.parentNode.className === "file file__mail"
  ) {
    return;
  }

  var currApp =
    desktop.getDomElementFromUrl(event.target.parentNode.href) ||
    desktop.getDomElementFromUrl(event.target.href);
  className.add(currApp, "clicked");
  return desktop.setStackingOrder(currApp, desktop.activeApps);
};

desktop.setStackingOrder = function (currApp, activeApps) {
  //find if file link is clicked before
  if (activeApps.indexOf(currApp) === -1) {
    activeApps.push(currApp);
    for (var i = 0; i < activeApps.length; i++) {
      activeApps[i].style.zIndex = "".concat(i + 1);
    }
  } else {
    //if file link is already clicked, bring corresponding pane on the top
    var index = activeApps.indexOf(currApp);
    activeApps.splice(index, 1);
    activeApps.push(currApp);

    for (var _i = 0; _i < activeApps.length; _i++) {
      activeApps[_i].style.zIndex = "".concat(_i + 1);
    }
  }
};

//return corresponding element from url location
desktop.getDomElementFromUrl = function (urlLink) {
  if (urlLink !== undefined && urlLink.indexOf("#") !== -1) {
    var regex = /#/,
      hashIndexInLink = urlLink.search(regex),
      elementIdAfterHash = urlLink.slice(hashIndexInLink + 1);
    if (elementIdAfterHash !== undefined) {
      var ele = document.querySelector("#".concat(elementIdAfterHash));
    }
  }
  return ele;
};

desktop.closeApp = function (event) {
  event.stopPropagation();
  var selected = desktop.getDomElementFromUrl(this.href);
  className.remove(selected, "clicked");
  return desktop.removeAppFromStack(selected, desktop.activeApps);
};

desktop.removeAppFromStack = function (currApp, activeApps) {
  currApp.style.zIndex = "";
  var index = activeApps.indexOf(currApp);
  if (index !== -1) {
    activeApps.splice(index, 1);
  }
};

desktop.changeStackingOrder = function (e) {
  desktop.setStackingOrder(e.currentTarget, desktop.activeApps);
  window.location.hash = e.currentTarget.id;
};

//EVENT LISTENERS

desktop.buttons.closeButton.forEach((button) =>
  button.addEventListener("click", desktop.closeApp)
);

//when clicked, stack the app pane on the top
desktop.apps.forEach((app) => {
  app.addEventListener("click", desktop.changeStackingOrder);
});

document.addEventListener("click", desktop.openApp);

document.querySelector("body").addEventListener("click", function () {
  desktop.click.autoplay = true;
  desktop.click.load();
});

desktop.showNavbarActiveAppTab = function (locHashName) {
  var locationName = locHashName.slice(1);
  var template = `<button class="navigation__dropdown-btn">${locationName}</button>
            <div class="navigation__dropdown-content">
              <a href="${locHashName}" class="link quit"
                >close<span aria-label="Close Account Info Modal Box"
                  >&times;</span
                ></a 
              > 
            </div>`;
  document.querySelector("#open-tabs").hidden = false;
  document.querySelector("#open-tabs").innerHTML = template;
  document.querySelector(".quit").addEventListener("click", desktop.closeApp);
};

//Rename hash after active app
window.onpopstate = function () {
  location.hash
    ? desktop.showNavbarActiveAppTab(location.hash)
    : document.querySelector("#open-tabs").hidden = true;

  var changeHash = function (apps, location) {
    var latestApp = apps[apps.length - 1] || apps;
    location.hash = latestApp.id || latestApp;
  };
  return changeHash(desktop.activeApps, location);
};
