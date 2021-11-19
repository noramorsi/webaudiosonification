"use strict";

(function() {
  var lines;

   window.addEventListener("load", init);

   function init() {
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
    var form = document.getElementById("col");
    function handleForm(event) {
      event.preventDefault();
      printData();
    }
    form.addEventListener('submit', handleForm);
   }

  function handleFileSelect(event){
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0]);
  }

  function handleFileLoad(event){
    lines = event.target.result.split(/\r\n|\n/);
    var headers = lines[0].split(',');
    addRadioButtonsForm(headers);
  }

  function addRadioButtonsForm(arr) {
    let form = document.getElementById('col');
    for (let elem of arr) {
      // BUILD THE RADIO BUTTON
      let radio = document.createElement('input');
      radio.setAttribute('type', 'radio');
      radio.setAttribute('name', 'columns');
      radio.setAttribute('value', arr.indexOf(elem));
      form.appendChild(radio);
      // BUILD THE LABEL
      let label = document.createElement('label');
      label.setAttribute('for', elem);
      label.textContent = elem;
      form.appendChild(label);
      // BUILD THE LINEBREAK
      let linebreak = document.createElement('br');
      form.appendChild(linebreak);
    }
    let submit = document.createElement('button');
    submit.innerHTML = "Submit";
    form.append(submit);
  }

  function printData() {
    let res = document.querySelector('input[name="columns"]:checked').value;
    let data = [];
    for (let currLine of lines) {
      let currArr = currLine.split(',');
      data.push(currArr[res]);
    }
  }

   /** ------------------------------ Helper Functions  ------------------------------ */
   /**
   */

   /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
   function id(idName) {
     return document.getElementById(idName);
   }

   /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
   function qs(selector) {
     return document.querySelector(selector);
   }

   /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
   function qsa(selector) {
     return document.querySelectorAll(selector);
   }

   /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
   function gen(tagName) {
     return document.createElement(tagName);
   }

})();