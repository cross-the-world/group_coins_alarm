import { Component, OnInit, OnDestroy, Inject, LOCALE_ID } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { DomSanitizer } from '@angular/platform-browser';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { DialogProgessBar } from './com/dialog/dialog_progress_bar';

import { DeviceDetectorService } from 'ngx-device-detector';

import { AudioRecordingService } from './services/recording.service';

import { Helpers } from './utils/helpers';
import { BaseContainer } from './utils/base/basecontainer';
import {RecordAudioTime} from './model/record-audio-time';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseContainer implements OnInit, OnDestroy {

  watcherMediaSize: Subscription;

  isRecording = false;
  isSending   = false;
  recordedTime;
  blobUrl;

  radius = 54;
  circumference = 2 * Math.PI * this.radius;
  dashoffset = this.circumference;

  dialogRef: MatDialogRef<DialogProgessBar>;


  constructor(@Inject(LOCALE_ID) locale: string,
              public dialog: MatDialog,
              private mediaObserver: MediaObserver,
              public deviceService: DeviceDetectorService,
              private router: Router,
              private translate: TranslateService,
              private audioRecordingService: AudioRecordingService,
              private sanitizer: DomSanitizer) {
    super();

    this.watcherMediaSize = this.mediaObserver.asObservable().subscribe((changes: MediaChange[]) => {
      // console.log('Media change:', change);
    });

    this.setNgxTranslation(locale);

    this.audioRecordingService.getRecordedTimeEvent().subscribe((time) => {
      this.progress(time);
    });

    this.audioRecordingService.getRecordedBlobEvent().subscribe((data) => {
      this.blobUrl = (data.blob) ? this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob)) : null;
    });

    this.audioRecordingService.isRecordingEvent().subscribe((v) => {
      this.isRecording = v;
    });

    this.audioRecordingService.isSendingEvent().subscribe((v) => {
      this.isSending = v;
      this.toggleDialog();
    })

  }

  ngOnInit() {
    console.log('initing app...');
  }

  ngOnDestroy() {
    console.log('destroying app...');
    this.abortRecording();
  }

  private setNgxTranslation(locale: string) {
    const lang = Helpers.parseLocale(locale);
    console.log('lang', locale, lang);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  private progress(value: RecordAudioTime) {
    this.recordedTime = value.time_str;
    const progress = (value.count) ? ((value.count) / this.audioRecordingService.getMaxSecond()) : 0;
    this.dashoffset = this.circumference * (1 - progress);
  }


  startRecording() {
    this.audioRecordingService.start();
  }

  abortRecording() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
    this.blobUrl = null;
    this.dialogRef = null;
    this.audioRecordingService.abort();
    if (this.watcherMediaSize) {
      this.watcherMediaSize.unsubscribe();
    }
  }

  stopRecording() {
    this.audioRecordingService.stop();
  }

  sendRecording() {
    this.audioRecordingService.send();
  }

  toggleDialog() {
    if (this.isSending){
      if (this.dialogRef)
        return;
      this.dialogRef = this.dialog.open(DialogProgessBar, {
        width: (this.srcWidth - 100) + 'px',
        height: (this.srcHeight - 400) + 'px',
        panelClass: 'transparent',
        disableClose: true,
        data: {}
      });
    } else {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }


}



