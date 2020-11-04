import './App.css';

import React from 'react';
import { Button } from 'react-bootstrap';

// See https://en.wikipedia.org/wiki/Harvard_sentences
const harvardSentences = [
  'Oak is strong and also gives shade.',
  'Cats and dogs each hate the other.',
  'The pipe began to rust while new.',
  'Open the crate but don\'t break the glass.',
  'Add the sum to the product of these three.',
  'Thieves who rob friends deserve jail.',
  'The ripe taste of cheese improves with age.',
  'Act on these orders with great speed.',
  'The hog crawled under the high fence.',
  'Move the vat over the hot fire.',
];

function App() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [recording, setRecording] = React.useState();
  const [mediaRecorder, setMediaRecorder] = React.useState();

  const sentence = React.useMemo(() => {
    const randNum = Math.random() * harvardSentences.length;
    const randIdx = Math.floor(randNum);

    return harvardSentences[randIdx];
  }, []);

  const startRecording = React.useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setIsRecording(true);
      setRecording();

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const audioChunks = [];
      recorder.addEventListener('dataavailable', ({ data }) => {
        audioChunks.push(data);
      });

      recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);

        setRecording(audio);
      });

      recorder.start();
    });
  }, []);

  const stopRecording = React.useCallback(() => {
    setIsRecording(false);

    mediaRecorder.stop();

    setMediaRecorder();
  }, [mediaRecorder]);

  const toggleRecording = React.useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  const clearRec = React.useCallback(() => {
    setRecording();
  }, []);

  const startPlayback = React.useCallback(() => {
    setIsPlaying(true);

    recording.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    recording.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    recording.play();
  }, [recording]);

  const stopPlayback = React.useCallback(() => {
    recording.pause();
    recording.currentTime = 0;
  }, [recording]);

  const togglePlayback = React.useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, stopPlayback, startPlayback]);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12 col-md-8 col-xl-5">
          <h2>Mic Check</h2>
          <p className="text-muted">
            For those who are afraid that they sound like crap over Zoom.
          </p>
          <p className="text-muted">Can't think of anything to say? Try this: <strong>{sentence}</strong></p>
        </div>
      </div>
      <div className="row pt-3">
        <div className="col">
          <Button variant="danger" onClick={toggleRecording} disabled={isPlaying}>
            {isRecording ? 'Stop' : 'Record' }
          </Button>
          <Button variant={recording ? 'primary' : 'secondary'} className="ml-2" onClick={togglePlayback} disabled={!recording}>
            {isPlaying ? 'Stop' : 'Listen'}
          </Button>
          {recording && (
            <React.Fragment>
              <Button className="ml-2" onClick={clearRec} disabled={isPlaying}>
                Clear
              </Button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
