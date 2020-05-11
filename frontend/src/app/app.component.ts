import { Component, OnInit, OnDestroy, Inject, LOCALE_ID, ElementRef, ViewChild } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { timer } from 'rxjs';

import { DomSanitizer } from '@angular/platform-browser';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { DeviceDetectorService } from 'ngx-device-detector';

import { AudioReceivingService } from './services/receiving.service';

import { Helpers } from './utils/helpers';
import { BaseContainer } from './utils/base/basecontainer';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseContainer implements OnInit, OnDestroy {
  audioPlayerRef;
  audioPlayingSubscriber;

  watcherMediaSize: Subscription;

  isReceiving   = false;
  isRegister    = false;
  blobUrl;
  blobType;

  count = 0;

  repeatFormControl: FormControl;
  intervalFormControl: FormControl;


  constructor(@Inject(LOCALE_ID) locale: string,
              private mediaObserver: MediaObserver,
              public deviceService: DeviceDetectorService,
              private router: Router,
              private translate: TranslateService,
              private audioReceivingService: AudioReceivingService,
              private sanitizer: DomSanitizer) {
    super();

    this.setNgxTranslation(locale);

    this.repeatFormControl = new FormControl(this.audioReceivingService.getDefaultMaxRepeat(), [
      Validators.required,
      Validators.pattern('^\\d*$'),
      Validators.min(1)
    ]);

    this.intervalFormControl = new FormControl(this.audioReceivingService.getDefaultMaxInterval(), [
      Validators.required,
      Validators.pattern('^\\d*$'),
      Validators.min(1)
    ]);

    this.watcherMediaSize = this.mediaObserver.asObservable().subscribe((changes: MediaChange[]) => {
      // console.log('Media change:', change);
    });

    this.audioReceivingService.getReceivedBlobEvent().subscribe((data) => {
      this.toggleAudio(false);
      this.makeAudioUrl(data);
      this.toggleAudio(true);
    });

    this.audioReceivingService.isReceivingEvent().subscribe((v) => {
      this.isReceiving = v;
    })

    this.audioReceivingService.isRegisterEvent().subscribe((v) => {
      this.isRegister = v;
    })

    this.repeatFormControl.valueChanges.subscribe(value => {
      console.log('repeat times has changed:', value)
      this.toggleAudio(false);
      this.toggleAudio(true);
    });

    this.intervalFormControl.valueChanges.subscribe(value => {
      console.log('interval has changed:', value)
      this.audioReceivingService.setInterval(value);
    });

  }

  ngOnInit() {
    console.log('initing app...');
  }

  ngOnDestroy() {
    console.log('destroying app...');
    this.abort();
  }

  private setNgxTranslation(locale: string) {
    const lang = Helpers.parseLocale(locale);
    console.log('lang', locale, lang);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  register() {
    this.audioReceivingService.register();
  }

  abort() {
    if (this.audioPlayingSubscriber) {
      this.audioPlayingSubscriber.unsubscribe();
    }
    if (this.blobUrl) {
      Helpers.revokeObjectURL(this.blobUrl);
    }
    this.audioPlayerRef = null;
    this.blobUrl = null;
    this.audioReceivingService.cancel();
    if (this.watcherMediaSize) {
      this.watcherMediaSize.unsubscribe();
    }
  }

  cancel() {
    this.audioReceivingService.cancel();
  }



  @ViewChild('audioRef', { static: false }) set content(content: ElementRef) {
    this.audioPlayerRef = (content) ? content.nativeElement : null;
    //this.toggleAudio(true);
  }

  private playListener = () => {
    this.audioPlayingSubscriber = timer(1000).subscribe((v) => {
      if (this.count < this.repeatFormControl.value) {
        this.count++;
        this.audioPlayerRef.play();
      } else {
        this.audioPlayerRef.pause();
        this.audioPlayerRef.currentTime = 0;
      }
    });
  };

  toggleAudio(play: boolean) {
    this.count = 0;
    if (this.audioPlayingSubscriber) {
      this.audioPlayingSubscriber.unsubscribe();
    }
    if (this.audioPlayerRef) {
      this.audioPlayerRef.removeEventListener('ended', this.playListener);
    }

    if (!this.audioPlayerRef)
      return;

    if (!play) {
      this.audioPlayerRef.pause();
      this.audioPlayerRef.currentTime = 0;
      return;
    }

    this.count++;
    this.audioPlayerRef.addEventListener('ended', this.playListener);
    this.audioPlayerRef.play();
  }

  makeAudioUrl(data: any) {
    if (!data || !data.content) {
      this.blobUrl = "";
      return;
    }

    if (data.content) {
      Helpers.createUrl(data.name, data.content, data.type, u => {
        this.blobType = data.type || "audio/mp3";
        this.blobUrl = (u) ? this.sanitizer.bypassSecurityTrustUrl(u) : "";
      });
      return;
    }

  }


}



