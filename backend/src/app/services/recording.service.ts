import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import {of, Observable, Subject, interval, BehaviorSubject, timer } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';

import {RecordedAudioOutput} from '../model/record-audio-output';
import {RecordAudioTime} from '../model/record-audio-time';


@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  private MAX_SECONDS = 20; //update asset/lang/xx.json, where tooltip shown on site

  private periods;
  private takePeriodsSubscribed;

  private stream;
  private recorder;
  private startTime;

  private _recorded = new BehaviorSubject<RecordedAudioOutput>(new RecordedAudioOutput());
  private _recordingTime = new Subject<RecordAudioTime>();
  private _recordingFailed = new Subject<string>();

  private _isRecording = new BehaviorSubject<boolean>(false);
  private _isSending = new Subject<boolean>();


  constructor(private http: HttpClient) {
    this.recordingFailedEvent().subscribe((v) => {
      if (v) {
        this.reset();
      }
    });
    this.isRecordingEvent().subscribe((v) => {
      if (v) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });
    this.isSendingEvent().subscribe((v) => {
      if (!v) {
        this.reset();
      }
    });
  }


  private doSend(audio: RecordedAudioOutput) {
    if (!audio.blob) {
      return;
    }
    this._isSending.next(true);
    let formdata = new FormData() ; //create a from to of data to upload to the server
    formdata.append('soundBlob', audio.blob,  audio.title) ; // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname
    this.http
      .post('api/send', formdata, {
        headers: new HttpHeaders({
          //'Content-Type': audio.blob.type
          'enctype': 'multipart/form-data' // the enctype is important to work with multer on the server
        }),
        responseType: 'json'
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          this._isSending.next(false);
          return of();
        })
      )
      .subscribe(res => {
        console.log(res);
        timer(1000).subscribe(v => this._isSending.next(false));
        ;
      });
  }

  private reset() {
    this._recorded.next(new RecordedAudioOutput());
    this._isRecording.next(false);
    this._recordingTime.next(new RecordAudioTime);
  }

  getRecordedBlobEvent(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTimeEvent(): Observable<RecordAudioTime> {
    return this._recordingTime.asObservable();
  }

  recordingFailedEvent(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  isRecordingEvent(): Observable<boolean> {
    return this._isRecording.asObservable();
  }

  isSendingEvent(): Observable<boolean> {
    return this._isSending.asObservable();
  }

  send() {
    this.doSend(this._recorded.getValue());
  }

  start() {
    this._isRecording.next(true);
  }

  stop() {
    this._isRecording.next(false);
  }

  abort() {
    this.reset();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getMaxSecond() {
    return this.MAX_SECONDS;
  }

  private cal_time(v: number = 0): RecordAudioTime {
    if (this._isRecording.getValue()) {
      const currentTime = moment();
      const diffTime = moment.duration(currentTime.diff(this.startTime));
      const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
      return {count: v+1, time_str: time};
    } else {
      return new RecordAudioTime();
    }
  }


  private startRecording() {

    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }

    this._recordingTime.next(new RecordAudioTime());
    navigator.mediaDevices.getUserMedia({ audio: {echoCancellation:true} }).then(s => {
      this.stream = s;
      this.record();
    }).catch(error => {
      this._recordingFailed.next();
    });

  }

  private record() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm'
    });

    this.recorder.record();
    this.startTime = moment();

    this.periods = interval(1000);
    const takePeriods = this.periods.pipe(take(this.MAX_SECONDS));
    this.takePeriodsSubscribed = takePeriods.subscribe(x => {
      this._recordingTime.next(this.cal_time(x));
      if (x == this.MAX_SECONDS-1) {
        this.stop();
      }
    });

  }

  private stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob) => {
        if (this.startTime) {
          this.stopMedia();
          const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
          this._recorded.next({ blob: blob, title: mp3Name });
        }
      }, () => {
        this.stopMedia();
        this._recordingFailed.next("stop failed");
      });
    }
  }

  private stopMedia() {
    if (this.recorder) {
      clearInterval(this.periods);
      this.takePeriodsSubscribed.unsubscribe();

      this.recorder = null;
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }



  private toString(value) {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }


}
