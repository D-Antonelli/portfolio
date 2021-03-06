import { className } from "../js_modules/helper_functions.mjs";

const memeExe = {
  gallery: document.querySelector("#meme-gallery"),
  canvas: document.querySelector("#meme-canvas"),
  container: document.querySelector("#meme-container"),
  uploadBtn: document.querySelector("#meme-uploadBtn"),
  downloadBtn: document.querySelector("#meme-downloadBtn"),
  imageEles: document.querySelectorAll(".thumb"),
  textTop: document.querySelector(".canvas-text--top"),
  textBtm: document.querySelector(".canvas-text--bottom"),
  memeText: document.querySelectorAll(".input-text"),
  get ctx() {
    return this.canvas.getContext("2d");
  },
};

//helper functions
memeExe.helperFunc = {};

memeExe.helperFunc.extractSrcFromUrl = function (imageEle) {
  if (imageEle) {
    return imageEle.style.backgroundImage.slice(4, -1).replace(/"/g, "");
  }
};

//render selected gallery image onto canvas
memeExe.renderMemeToCanvas = function (event) {
  var image = new Image();
  image.onload = memeExe.drawMeme;
  image.src = memeExe.helperFunc.extractSrcFromUrl(event.target);

  if (event.target.className === "thumb") {
    memeExe.toggleActive(event.target);
  }
};

memeExe.toggleActive = function (element) {
  var activeCls = document.body.querySelector(".active");
  if (activeCls) {
    className.remove(activeCls, "active");
  }
  className.add(element, "active");
};

memeExe.drawMeme = function () {
  var targetSize = parseInt(window.getComputedStyle(memeExe.container).width);
  var meme = memeExe.setMemeSize(
    this.width,
    this.height,
    targetSize,
    targetSize
  );
  //set canvas container same as meme dimensions
  memeExe.canvas.width = meme.width;
  memeExe.canvas.height = meme.height;

  memeExe.container.width = meme.width;
  memeExe.container.height = meme.height;

  memeExe.ctx.drawImage(this, 0, 0, meme.width, meme.height);

  memeExe.drawText(
    memeExe.textTop.value,
    "top",
    window.getComputedStyle(memeExe.textTop).fontSize
  );
  memeExe.drawText(
    memeExe.textBtm.value,
    "bottom",
    window.getComputedStyle(memeExe.textBtm).fontSize
  );
};

memeExe.drawText = function (text, pos, font) {
  var copy = text.toUpperCase(),
    yPos = "",
    PADDING,
    BORDER;

  switch (pos) {
    case "top":
      PADDING =
        parseInt(
          window.getComputedStyle(memeExe.textTop, null)["-moz-padding-start"]
        ) || parseInt(window.getComputedStyle(memeExe.textTop).padding);
      BORDER =
        parseInt(
          window.getComputedStyle(memeExe.textTop, null)[
            "-moz-border-end-width"
          ]
        ) || parseInt(window.getComputedStyle(memeExe.textTop).borderWidth);

      yPos = memeExe.textTop.offsetTop + PADDING + BORDER + 2;
      break;

    case "bottom":
      PADDING =
        parseInt(
          window.getComputedStyle(memeExe.textBtm, null)["-moz-padding-start"]
        ) || parseInt(window.getComputedStyle(memeExe.textBtm).padding);
      BORDER =
        parseInt(
          window.getComputedStyle(memeExe.textBtm, null)[
            "-moz-border-end-width"
          ]
        ) || parseInt(window.getComputedStyle(memeExe.textBtm).borderWidth);

      yPos = memeExe.textBtm.offsetTop + PADDING + BORDER + 2;
      break;
  }

  memeExe.ctx.textBaseline = "top";
  memeExe.ctx.textAlign = "center";
  memeExe.ctx.font = "bold " + font + " Helvetica";
  memeExe.ctx.shadowColor = "#000";
  memeExe.ctx.lineCap = "round";
  memeExe.ctx.lineJoin = "round";
  memeExe.ctx.shadowOffsetX = 2;
  memeExe.ctx.shadowOffsetY = 2;
  memeExe.ctx.shadowBlur = 0;
  memeExe.ctx.fillStyle = "#fff";
  memeExe.ctx.strokeText(copy, memeExe.canvas.width / 2, yPos);
  memeExe.ctx.fillText(copy, memeExe.canvas.width / 2, yPos);
};

memeExe.updateMeme = function () {
  setTimeout(function () {
    var image = new Image();
    image.onload = memeExe.drawMeme;
    var activeCls = document.querySelector(".active");
    image.src = memeExe.helperFunc.extractSrcFromUrl(activeCls);
  }, 1);
};

memeExe.setMemeSize = function (
  memeWidth,
  memeHeight,
  targetWidth,
  targetHeight
) {
  var result = { width: 0, height: 0 };
  var ratio = memeWidth / memeHeight;

  //set width to height proportion
  result.width = targetWidth;
  result.height = targetHeight / ratio;

  //if calculated height is more than target height, set width proportionally
  if (memeHeight > targetHeight) {
    result.height = targetHeight;
  }

  if (memeWidth > targetWidth) {
    result.width = targetWidth;
  }

  if (memeWidth <= targetWidth) {
    result.width = memeWidth;
  }

  if (memeHeight <= targetHeight) {
    result.height = memeHeight;
  }

  return result;
};

//user meme upload
memeExe.validateAndUploadMeme = function (event) {
  var memeFile = event.target.files[0];
  var validfileTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (memeFile && validfileTypes.includes(memeFile.type)) {
    var image = new Image(),
      URL = window.URL || window.webkitURL;
    image.onload = memeExe.drawMeme;
    image.src = URL.createObjectURL(memeFile);
    memeExe.appendMemeUploadToGallery(image);
  }
};

memeExe.downloadMeme = function () {
  var imageUrl = memeExe.canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  memeExe.downloadBtn.setAttribute("href", imageUrl);
};

memeExe.appendMemeUploadToGallery = function (uploadImage) {
  var src = uploadImage.src;
  var newEle = "";
  newEle = document.createElement("div");
  newEle.style.backgroundImage = `url('${src}')`;
  newEle.className = "thumb";
  memeExe.gallery.insertBefore(newEle, memeExe.gallery.childNodes[0]);
  memeExe.gallery.removeChild(memeExe.gallery.lastElementChild);
  memeExe.toggleActive(newEle);
};

memeExe.shrinkToFill = function () {
  var inputLength = this.value.length,
    width = this.clientWidth,
    maxSize = width == 300 ? 43 : 35,
    initialSize = maxSize - inputLength;
  initialSize = initialSize <= 11 ? 11 : initialSize;
  this.style.fontSize = initialSize + "px";
};

memeExe.listeners = (function () {
  memeExe.gallery.addEventListener("click", memeExe.renderMemeToCanvas);
  memeExe.uploadBtn.addEventListener("change", memeExe.validateAndUploadMeme);
  memeExe.downloadBtn.addEventListener("click", memeExe.downloadMeme);
  Array.from(memeExe.memeText).forEach((text) => {
    text.addEventListener("keydown", memeExe.updateMeme);
    text.addEventListener("keydown", memeExe.shrinkToFill);
    text.addEventListener("keyup", memeExe.updateMeme);
    text.addEventListener("focus", memeExe.updateMeme);
  });
})();

//render first image on canvas
  window.onload = function () {
    var image = new Image();
    image.onload = memeExe.drawMeme;
    image.src = memeExe.helperFunc.extractSrcFromUrl(
      memeExe.gallery.firstElementChild
    );
    memeExe.toggleActive(memeExe.gallery.firstElementChild);
  };
