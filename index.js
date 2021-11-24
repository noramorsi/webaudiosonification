"use strict";

(function() {

  // used to store lines of the file read
  let lines;

  // track button state
  let isPlaying = false;

  // save data from selected col
  let colData = [];

  // run init when the page loads
  window.addEventListener("load", init);
  const audioContext = new AudioContext(); // create the audio context

  // audio values
  const pulseTime = 0.5; // how long the tone should go for
  const lookahead = 25.0; // how frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  let nextNoteTime = 0.0; // when the next note is due.

  function nextNote() {
    nextNoteTime += 0.5; // Add beat length to last beat time
  }

  const notesInQueue = [];

  function scheduleNote(time, note) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push({ note: note, time: time });
    playPulse(time, note);
  }

  let timerID;
  let currNote = 0;
  // Schedules the next notes to play.
  function scheduler() {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (currNote < colData.length && nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
      scheduleNote(nextNoteTime, colData[currNote]); // play the corresponding note
      nextNote(); // advance when the next note is due
      currNote++; // advance the current note
    }
    timerID = window.setTimeout(scheduler, lookahead);
  }

  // Checks state of audio; if it is now playing, plays tones accordingly.
  function checkAudio() {
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
      // check if context is in suspended state (autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      nextNoteTime = audioContext.currentTime;
      scheduler(); // kick off scheduling starting at current time
    } else {
      window.clearTimeout(timerID);
    }
  }

  function init() {
    // Allow the button to play sounds.
    let btn = document.querySelector('button');
    btn.addEventListener('click', checkAudio);

    // Handles file selection.
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    // Handles form submission.
    var form = document.getElementById("col");
    function handleForm(event) {
      event.preventDefault();
      btn.disabled = false;
      printData(); // You can play audio now that we have data!
    }
    form.addEventListener('submit', handleForm);
  }

  // Plays the pulse at the given time, at the given frequency.
  function playPulse(time, pulseHz) {
    let osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = pulseHz;

    let amp = audioContext.createGain();
    amp.gain.value = 1;

    let lfo = audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 0;

    lfo.connect(amp.gain);
    osc.connect(amp).connect(audioContext.destination);
    lfo.start();
    osc.start(time);
    osc.stop(time + pulseTime);
  }

  // Reads in the currently-uploaded file.
  function handleFileSelect(event){
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0]);
  }

  // Parses the file and generates the form based on column headers.
  function handleFileLoad(event){
    lines = event.target.result.split(/\r\n|\n/);
    var headers = lines[0].split(',');
    addRadioButtonsForm(headers);
  }

  // Generates the form based on the columns of the file uploaded.
  function addRadioButtonsForm(arr) {
    let form = document.getElementById('col');
    for (let elem of arr) {
      let radio = document.createElement('input');
      radio.setAttribute('type', 'radio');
      radio.setAttribute('name', 'columns');
      radio.setAttribute('value', arr.indexOf(elem));
      form.appendChild(radio);
      let label = document.createElement('label');
      label.setAttribute('for', elem);
      label.textContent = elem;
      form.appendChild(label);
      form.appendChild(document.createElement('br'));
    }
    let submit = document.createElement('button');
    submit.innerHTML = "Submit";
    form.append(submit);
  }

  // Scales the data of the column chosen and saves it to colData for audio usage later.
  function printData() {
    let res = document.querySelector('input[name="columns"]:checked').value;
    let data = [];
    for (let currLine of lines) {
      let currArr = currLine.split(',');
      data.push(currArr[res]);
    }
    data.shift();
    colData = [];
    for (let i of data) {
      colData.push(scale(i, Math.min(...data), Math.max(...data), 220, 1000));
    }
  }

  function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

})();