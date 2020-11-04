import './App.css';

import React from 'react';
import { Button } from 'react-bootstrap';

import harvardSentences from './sentences.json';

function App() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordings, setRecordings] = React.useState([]);
  const [mediaRecorder, setMediaRecorder] = React.useState();

  const sentence = React.useMemo(() => {
    const randNum = Math.random() * harvardSentences.length;
    const randIdx = Math.floor(randNum);

    return harvardSentences[randIdx];
  }, []);

  const startRecording = React.useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setIsRecording(true);

      // Create a new media recorder from the navigator's
      // audio stream.
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      // Listen for audio chunks.
      const audioChunks = [];
      recorder.addEventListener('dataavailable', ({ data }) => {
        audioChunks.push(data);
      });

      // Listen for the user to stop recording.
      recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        const audioURL = URL.createObjectURL(audioBlob);

        // Add new recording to list of recordings.
        setRecordings((prevState) => [...prevState, {
          timestamp: Date.now(),
          url: audioURL,
        }]);

        // Let navigator know microphone is no longer
        // neeeded. Otherwise, the microphone will still be
        // "listening," even if we're not recording.
        //
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      });

      // Start recording audio.
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

  const clearRecordings = React.useCallback(() => {
    setRecordings([]);
  }, []);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12 col-md-8 col-xl-5">
          <div className="row">
            <div className="col">
              <h2>Mic Check</h2>
              <p className="text-muted">
                For those who are afraid that they sound like crap over Zoom.
              </p>
              <p className="text-muted">Can't think of anything to say? Try this: <strong>{sentence}</strong></p>
            </div>
          </div>
          {recordings.map(({ timestamp, url }) => (
            <div className="row pt-3" key={timestamp}>
              <div className="col">
                <audio controls>
                  <source src={url} />
                </audio>
              </div>
            </div>
          ))}
          <div className="row pt-3">
            <div className="col">
              <Button variant="danger" onClick={toggleRecording}>
                {isRecording ? 'Stop' : 'New recording' }
              </Button>
              {recordings.length > 0 && (
                <Button className="m-2" variant="light" onClick={clearRecordings}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
