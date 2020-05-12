import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import {of, Observable, interval, BehaviorSubject, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Helpers } from '../utils/helpers';


@Injectable({
  providedIn: 'root'
})
export class AudioReceivingService {
  private MAX_INTERVAL = 30000;
  private MAX_REPEAT = 1;


  private _received = new BehaviorSubject<any>(null);
  private _isReceiving = new BehaviorSubject<boolean>(false);

  private _isRegister = new BehaviorSubject<boolean>(false);
  private _interval = new BehaviorSubject<number>(this.MAX_INTERVAL);

  private getSubsriber;
  private takePeriodsSubscribed;


  constructor(private http: HttpClient) {
    this.isRegisterEvent().subscribe((v) => {
      this.toggleListenerAudio();
    });
    this.intervalEvent().subscribe((v) => {
      this.toggleListenerAudio();
    });
  }


  private doGet() {
    if (this._isReceiving.getValue()) {
      return;
    }
    this._isReceiving.next(true);
    this.getSubsriber = this.http
      .get('api/receive', {
        headers: new HttpHeaders({
          'x-current-key': localStorage.getItem(Helpers.lskAudioKey) || ''
        }),
        observe: 'response',
        responseType: 'blob' as 'json'
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          this.updateAudio(null);
          return of();
        })
      )
      .subscribe((res) => {
        console.log(res);
        timer(2000).subscribe(v => this.updateAudio(res));
      });
  }


  getReceivedBlobEvent(): Observable<any> {
    return this._received.asObservable();
  }

  isReceivingEvent(): Observable<boolean> {
    return this._isReceiving.asObservable();
  }

  isRegisterEvent(): Observable<boolean> {
    return this._isRegister.asObservable();
  }

  intervalEvent(): Observable<number> {
    return this._interval.asObservable();
  }

  setInterval(i) {
    this._interval.next(i);
  }


  register() {
    this._isRegister.next(true);
  }

  cancel() {
    this._isRegister.next(false);
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getDefaultMaxRepeat() {
    return this.MAX_REPEAT;
  }

  getDefaultMaxInterval() {
    return this.MAX_INTERVAL;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  private toggleListenerAudio() {
    if (this.takePeriodsSubscribed) {
      this.takePeriodsSubscribed.unsubscribe();
    }
    if (this.getSubsriber) {
      this.getSubsriber.unsubscribe();
    }
    this._isReceiving.next(false);
    if (this._isRegister.getValue()) {
      this.takePeriodsSubscribed = interval(this._interval.getValue() || this.MAX_INTERVAL)
        .subscribe(r => {
          this.doGet();
        });

    } else {
      this._received.next(null);
    }
  }

  private updateAudio(obj) {
    this._isReceiving.next(false);

    if (obj && obj.ok && !obj.body.type.includes('audio/') ) {
      this._received.next(null);
      return;
    }

    localStorage.removeItem(Helpers.lskAudioKey);
    if (!obj || !obj.ok) {
      this._received.next(null);
      return;
    }

    const key = obj.headers.get('x-audio-key');
    const name = obj.headers.get('x-audio-name');
    localStorage.setItem(Helpers.lskAudioKey, key || "");
    this._received.next({
      content: obj.body,
      type: obj.body.type,
      name: name
    });

  }



}
