import _ from 'lodash';
import rp from 'request-promise';
import Promise from 'bluebird';

const TIME_LIMIT = 10000;

export default class Trello {
  constructor(token, idBoard) {
    this.setToken(token);
    this.setIdBoard(idBoard);
    this.pendingRequests = {};
  }

  setToken(token) {
    this.token = token;
  }

  setIdBoard(idBoard) {
    this.idBoard = idBoard;
  }

  get defaultParams() {
    const params = { token: this.token };
    // avoiding overwriting a passed idBoard param if we don't have one
    if (this.idBoard) {
      params.idBoard = this.idBoard;
    }
    return params;
  }

  _url(url) {
    const { protocol, host } = window.location;
    return `${protocol}//${host}/trello${url}`;
  }

  _request(method, url, params = {}) {
    if (!this.token) {
      return Promise.reject(
        new Error("Cannot make a Trello API request without a user token — authenticate first")
      );
    }
    const opts = {
      method,
      json: true,
      url: this._url(url),
    };
    return rp(_.extend(opts, (method === 'GET')
      ? { qs: _.extend(params, this.defaultParams) }
      : { qs: this.defaultParams, body: params }
    ));
  }

  // drop duplicate requests until TIME_LIMIT milliseconds after the first request was sent
  _debounce(method, url, params) {
    const ref = JSON.stringify(arguments);
    const pending = this.pendingRequests[ref];
    if (pending) {
      if (Date.now() - pending.time > TIME_LIMIT) {
        pending.promise.cancel()
        delete this.pendingRequests[ref];
      } else {
        return Promise.resolve();
      }
    }
    this.pendingRequests[ref] = {
      promise: this._request(method, url, params),
      time: Date.now()
    };
    return this.pendingRequests[ref].promise;
  }

  get(url, params) { return this._request('GET', url, params); }
  post(url, params) { return this._debounce('POST', url, params); }
  put(url, params) { return this._debounce('PUT', url, params); }
  delete(url, params) { return this._debounce('DELETE', url, params); }

}
