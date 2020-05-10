import { HostListener } from '@angular/core';

import { DeviceDetectorService } from 'ngx-device-detector';

import { Helpers } from '../helpers';


export class BaseContainer {
  public deviceService: DeviceDetectorService;

  disableHover = false;

  success: boolean;
  fullError: any;
  error: string;

  // Declare height and width variables
  srcHeight: any;
  srcWidth: any;
  mWidthImg: number;
  mHeightImg: number;
  pagesToShow: number;
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.srcHeight = window.innerHeight;
    this.srcWidth = window.innerWidth;

    this.mWidthImg = this.srcWidth>1920 ? 640
                         : this.srcWidth>1600 ? 560
                             : this.srcWidth>1280 ? 480
                                 : this.srcWidth>960 ? 400
                                     : this.srcWidth>600 ? 320 : 200;
    this.mHeightImg = this.mWidthImg;

    this.pagesToShow = this.srcWidth>960 ? 5 : this.srcWidth>600 ? 3 : 2;
  }

  constructor() {
    this.getScreenSize();
  }

  initialize() {
    if (this.deviceService) {
      const deviceInfo = this.deviceService.getDeviceInfo();
      const isMobile = this.deviceService.isMobile();
      const isTablet = this.deviceService.isTablet();
      const isDesktopDevice = this.deviceService.isDesktop();

      // console.log(deviceInfo);
      // console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
      // console.log(isTablet);  // returns if the device us a tablet (iPad etc)
      // console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.

      this.disableHover = isMobile || isTablet;
    }
  }


  trimMimeFile( str: string ) {
    return str.replace( Helpers.PREFIX_MIME_FILE, '');
  }

  processError(err: any) {
    this.success = false;
    this.fullError = err;
    const e = err && err.error;
    this.error = (e && (e.message || e[0].message)) || err.message || 'unknown';
    console.log('Error:', (e || err), this.error);
  }

  resetError() {
    console.log('reset');
    this.success = false;
    this.fullError = null;
    this.error = null;
  }

  clearMessage(s: number = 1000) {
    setTimeout(() => this.resetError(), s);
  }


}
