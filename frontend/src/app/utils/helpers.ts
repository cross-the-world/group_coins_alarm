import saveAs from 'file-saver';


export class Helpers {

  // NOTE: Keys for local storage
  static lskAudioKey = 'access_user';

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  static defaultMime = 'application/octet-stream'; // this default mime also triggers iframe downloads;
  static defaultAudioMime = 'audio/webm"'; // this default mime also triggers iframe downloads;
  static PREFIX_MIME_FILE = 'MIMEFILE';


  static parseLocale(locale: string = 'de') {
    const lang = 'en';
    return lang;
  }

  static deviceOS() {
    const useragent = navigator.userAgent;

    if(useragent.match(/Android/i)) {
      return 'android';
    } else if(useragent.match(/webOS/i)) {
      return 'webos';
    } else if(useragent.match(/iPhone/i)) {
      return 'iphone';
    } else if(useragent.match(/iPod/i)) {
      return 'ipod';
    } else if(useragent.match(/iPad/i)) {
      return 'ipad';
    } else if(useragent.match(/Windows Phone/i)) {
      return 'windows phone';
    } else if(useragent.match(/SymbianOS/i)) {
      return 'symbian';
    } else if(useragent.match(/RIM/i) || useragent.match(/BB/i)) {
      return 'blackberry';
    } else {
      return null;
    }
  }

  static deviceChromeBrowserVersion() {
    const uMatch = navigator.userAgent.match(/Chrome\/(.*)$/i);
    return (uMatch && uMatch[1]);
  }

  static deviceSafariBrowserVersion() {
    const uMatch = navigator.userAgent.match(/Safari\/(.*)$/i);
    return (uMatch && uMatch[1]);
  }

  static iOSversion() {
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
      const v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
      return [ parseInt(v[1], 10), v[2] ? parseInt(v[2], 10) : 0, v[3] ? parseInt(v[3], 10) : 0 ];
    }
  }

  static isMobileDevice() {
      return ( (typeof window.orientation !== "undefined")) || ((navigator.userAgent.indexOf('IEMobile') !== -1) || Helpers.deviceOS() );
  };

  static touchIsClick(event, when, start): number {
    if (when === 'start') {
      return new Date().getTime();
    }
    const t = new Date().getTime();
    return (when === 'end' && ((t - start) < 1000) ) ? 0 : t;
  }



  static createObjectURL(blob: any) {
    const cou = (window.URL || (window as any).webkitURL || URL || {}).createObjectURL || null;
    return cou ? cou(blob) : null;
  }

  static revokeObjectURL(u: any) {
    const rou = (window.URL || (window as any).webkitURL || URL || {}).revokeObjectURL || function(){};
    return rou(u);
  }

  static saver(name, url, winMode?): boolean {
    const a = document.createElement('a');
    if ( ('download' in a) ) { //html5 A[download]
      let self = this;
      a.href = url;
      a.className = 'hidden';
      a.download = name;
      a.onclick = function () {
          requestAnimationFrame(function () {
              self.revokeObjectURL(url);
              setTimeout(() => a.remove(), 500);
          });
      };
      console.log(a);
      document.body.appendChild(a);
      a.click();
      return true;
    }

    const vIOS = this.iOSversion();
    const vChrome = this.deviceChromeBrowserVersion();
    console.log(vIOS, vChrome);
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      confirm('The function is not supported to for this browser.');
      return false;
    }
    return true;
    /*
    if (vIOS[0] >= 12 && vChrome) {
      newWindow.document.write('<iframe src="' + url + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
    }
    */

  } //end saver

  static saveDataToFile(name: string, data: any, type?: string) {
    const w = (window as any);
    let myBlob = (w.Blob || w.MozBlob || w.WebKitBlob || toString);
    myBlob= myBlob.call ? myBlob.bind(w) : Blob;

    const t = type || data.type || this.defaultMime;
    console.log(name, t);
    const blob = new myBlob([data], {type: t});

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if ( navigator && navigator.msSaveBlob ) {
      navigator.msSaveBlob( blob, name );
      return;
    }

    const u = this.createObjectURL(blob);
    console.log(u);
    let isSuccess = true;
    const self = this;
    if (u) {
      isSuccess = self.saver(name, u, true);
    } else if ( typeof blob === "string" || blob.constructor === toString ) {
      try {
        isSuccess = self.saver( name, "data:" +  t   + ";base64,"  +  window.btoa(blob)  );
        console.log('using btoa');
      } catch(y) {
        isSuccess = self.saver( name, "data:" +  t   + "," + encodeURIComponent(blob)  );
        console.log('using encodeURIComponent');
      }
    } else {
      // Blob but not URL support:
      const reader = new FileReader();
      reader.onloadend = function(e){
        isSuccess = self.saver(name, reader.result);
        if (!isSuccess) {
          console.log('File saver in reader');
          saveAs(blob, name);
        }
      };
      reader.readAsDataURL(blob);
    }

    if (!isSuccess) {
      console.log('File saver');
      saveAs(blob, name);
    }
  } // end saveDataToFile

  static createUrl(name: string, data: any, type?: string, cb = (url) => {}) {
    const w = (window as any);
    let myBlob = (w.Blob || w.MozBlob || w.WebKitBlob || toString);
    myBlob= myBlob.call ? myBlob.bind(w) : Blob;

    const t = type || data.type || this.defaultAudioMime;
    console.log(t);
    const blob = new myBlob([data], {type: t});

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if ( navigator && navigator.msSaveBlob ) {
      navigator.msSaveOrOpenBlob( blob, name );
      return;
    }

    const u = this.createObjectURL(blob);
    console.log(u);
    let isSuccess = true;
    const self = this;
    if (u) {
      cb(u);
    } else {
      const reader = new FileReader();
      reader.onloadend = function(e){
        console.log(reader.result);
        cb(reader.result);
      };
      reader.readAsDataURL(blob);
    }
  } // end createUrl



}
