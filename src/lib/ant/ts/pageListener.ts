//
// Not use by any objects yet.
//

import { EventEmitter } from 'events';

interface OnPage { (data: any, timestamp: number) : void };

export default class PageListener {
    private _antProfile: EventEmitter;
    private _onPage: OnPage;
    constructor(antProfile: EventEmitter, pageName: string, onPage: OnPage) {
        this._antProfile = antProfile;
        this._onPage = onPage;
        this._antProfile.on(pageName, this._onPage);
    }
}
