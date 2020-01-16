import { $http } from '@/api/index'
import store from '@/store/index'

const { config } = store.state
const google_lib = {
  /**
   * third party auth window
   */
  authWindow: null,
  /**
   * initialization deferred
   */
  deferred_init: null,
  /**
   * mark if failed to request google api
   */
  failed_a_request: false,
  /**
   * root of google drive
   */
  googledrive_root: null,
  /**
   * count the how many unauthorized requests have been sent continuously, will popup unmount when it's to be MAX_UNAUTH_REQUEST
   */
  unauthRequestCount: 0,
  /**
   * the max No. for unauthRequestCount
   */
  MAX_UNAUTH_REQUEST: 3,
  /**
   * instance of google shareclient
   */
  share: null,
  /**
   * Inits library
   */
  init: function() {
    var def = new Promise()

    if (this.deferred_init && !this.deferred_init.isFulfilled()) {
      def = this.deferred_init
    } else {
      this.deferred_init = def
      this.loadSDK()
        .then(() => this.loadGAPI())
        .then(() => this.initGAPIClient())
        .then(() => this.loadRoot())
        .then(() => this.updateRootId())
        .catch(err => {
          console.error(err)
        })
    }
    return def
  },
  /**
   * Loads Google API JavaScript SDK
   */
  loadSDK: function() {
    return new Promise((resolve, reject) => {
      if (typeof gapi == 'undefined') {
        var script = document.createElement('script')
        script.onload = function() {
          resolve()
        }
        script.onerror = function() {
          reject(
            new Error(
              'opus/lib/google::loadSDK. Failed to load https://apis.google.com/js/api.js'
            )
          )
        }
        script.src = 'https://apis.google.com/js/api.js'
        document.getElementsByTagName('head')[0].appendChild(script)
      } else {
        resolve()
      }
    })
  },
  /**
   * Loads 'client:drive-share:auth2' gapi library
   */
  loadGAPI: function() {
    return new Promise((resolve, reject) => {
      if (gapi && gapi.client && gapi.drive && gapi.drive.share && gapi.auth2) {
        resolve()
      } else if (gapi) {
        gapi.load('client:drive-share:auth2', {
          callback: function() {
            resolve()
          },
          timeout: 5000,
          ontimeout: function() {
            reject(
              new Error(
                'opus/lib/google::loadGAPI. Failed to load client:drive-share:auth2 gapi library.'
              )
            )
          },
          onerror: function() {
            reject(
              new Error(
                'opus/lib/google::loadGAPI. Failed to load client:drive-share:auth2 gapi library.'
              )
            )
          }
        })
      } else {
        reject(new Error('opus/lib/google::loadGAPI. gapi is not defined.'))
      }
    })
  },
  /**
   * Initializes the Google API JavaScript client
   */
  initGAPIClient: function() {
    return new Promise((resolve, reject) => {
      if (this.share) {
        resolve()
      } else if (gapi && gapi.client && gapi.drive && gapi.drive.share) {
        this.share = new gapi.drive.share.ShareClient()
        gapi.client
          .init({
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ],
            clientId: config.google_app_id,
            scope: 'https://www.googleapis.com/auth/drive'
          })
          .then(
            function() {
              resolve()
            },
            function() {
              reject(
                new Error(
                  'opus/lib/google::loadGAPI. Failed to init Google API JavaScript client.'
                )
              )
            }
          )
      } else {
        reject(
          new Error(
            'opus/lib/google::loadGAPI. Google API JavaScript SDK is not properly loaded.'
          )
        )
      }
    })
  },

  /**
   * load google drive root
   */
  loadRoot: function() {
    return new Promise((resolve, reject) => {
      var unmountPopup = () => {
        console.log('unmount')
      }

      if (this.googledrive_root) {
        resolve(this.googledrive_root)
      } else {
        $http
          .get('googledrive', {
            __skip_errors: true,
            __quiet: true
          })
          .then(response => {
            if (response.data.length) {
              const root = [
                ...response.data[0],
                {
                  id: 'googledrive_root',
                  name: 'Google Drive',
                  type: 'googledrive',
                  mimeType: 'application/vnd.google-apps.folder',
                  haschild: 'Y',
                  children: [],
                  permissionbitmask: 2
                }
              ]
              this.googledrive_root = ['googledrive', 'cacheItem', root]
              if (gapi && gapi.client) {
                gapi.client.setToken(response.data[0].access_token)
              }
              resolve(this.googledrive_root)
            } else {
              reject(
                new Error('opus/lib/google::loadRoot. There is no googledrive data in our DB.')
              )
            }
          })
          .catch(response => {
            if (
              response.code == 'googledrive-cantrefreshtoken' ||
              this.failed_a_request
            ) {
              unmountPopup()
            }
            reject(
              new Error('opus/lib/google::loadRoot. Error loading googledrive data from our DB.')
            )
          })
      }
    })
  },

  /**
   * Requests actual root folder id and updates this.googledrive_root with new id
   */
  updateRootId: function() {
    return new Promise((resolve, reject) => {
      if (this.googledrive_root.root_folder_id) {
        resolve(this.googledrive_root)
      } else if (gapi && gapi.client && this.googledrive_root) {
        gapi.client
          .request({
            path: 'https://www.googleapis.com/drive/v3/files/root',
            params: {
              access_token: this.googledrive_root.access_token,
              fields: 'id',
              pageSize: 1
            },
            headers: {
              authorization: '1'
            }
          })
          .then(response => {
            if (response.result) {
              // stores.set(
              //   this.googledrive_root,
              //   {
              //     root_folder_id: response.result.id
              //   },
              //   true
              // )
              // stores.run('googledrive', 'onNew', this.googledrive_root)
              resolve(this.googledrive_root)
            } else {
              reject(
                new Error('opus/lib/google::updateRootId. Failed to load root folder data.')
              )
            }
          })
          .catch(err => {
            reject(new Error(err))
            console.log(err)
          })
      } else {
        reject(
          new Error('opus/lib/google::updateRootId. Google API was not loaded properly.')
        )
      }
    })
  },

  /**
   * Mounts Google Drive storage
   */
  mount: function() {
    var top = Math.round((screen.availHeight - 600) / 2)
    var left = Math.round((screen.availWidth - 800) / 2)
    var url =
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      'redirect_uri=' +
      encodeURIComponent(
        location.protocol +
          '//' +
          config.domains.storage +
          '/opus/googledrive.json?_a=auth'
      ) +
      '&prompt=consent' +
      '&response_type=code' +
      '&client_id=' +
      encodeURIComponent(config.google_app_id) +
      '&scope=profile+email+' +
      encodeURIComponent('https://www.googleapis.com/auth/drive') +
      '&access_type=offline'
    var handle
    var ie_handle
    var init = () => {
      this.init()
    }

    if (this.authWindow && !this.authWindow.closed) {
      this.authWindow.location.href = url
    } else {
      this.authWindow = window.open(
        url,
        'authWindow',
        'toolbar=0,menubar=0,status=0,width=800,height=600,top=' +
          (top < 0 ? 0 : top) +
          ',left=' +
          (left < 0 ? 0 : left)
      )
    }
    this.authWindow.focus()
    handle = window.onmessage = event => {
      if (event.data.command == 'setAuthCookie') {
        handle.remove()
        init()
      }
    }
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      ie_handle = window.setInterval(() => {
        if (!this.authWindow || this.authWindow.closed) {
          window.clearInterval(ie_handle)
          init()
        }
      }, 100)
    }
  },
  /**
   * Unmounts Google Drive storage
   */
  unmount: function() {
    var account_id = null

    account_id &&
      $http.post('googledrive', {
        _a: 'unmount',
        account_id: account_id
      })
  }
}
// topic.subscribe('xmpp.message.notification', function(data) {
//   var item,
//     serialized = data.notification.serialized

//   switch (data.notification.type) {
//     case 'googledrive_mount':
//       google_lib.info({ id: 'root' }).then(function(folder) {
//         if (folder) {
//           item = stores.get('googledrive', { id: 'googledrive_root' })
//           stores.set(
//             item,
//             {
//               root_folder_id: stores.get(folder, 'id')
//             },
//             true
//           )
//           stores.run('googledrive', 'onNew', item)
//         }
//       })
//       break
//     case 'googledrive_unmount':
//       stores.get('googledrive', { id: 'googledrive_root' }) &&
//         stores.run('googledrive', 'deleteItem', 'googledrive_root')
//       delete google_lib.googledrive_root
//       break
//   }
// })
export default google_lib
