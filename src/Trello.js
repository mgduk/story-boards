import TrelloApi from 'node-trello';
import Promise from 'bluebird';

const TIME_LIMIT = 10000;

export default class Trello {
  constructor(appKey, apiToken) {
    this.pendingRequests = {};
    this.api = Promise.promisifyAll(new TrelloApi(appKey, apiToken));
  }

  get(url, params) {
    return this.api.getAsync.apply(this.api, arguments);
  }

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
      promise: this.api[`${method}Async`].apply(this.api, [].slice.call(arguments, 1)),
      time: Date.now()
    };
    return this.pendingRequests[ref].promise;
  }

  post(url, params) {
    return this._debounce('post', url, params);
  }

  put(url, params) {
    return this._debounce('put', url, params);
  }

  delete(url, params) {
    return this._debounce('delete', url, params);
  }
}
