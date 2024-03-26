(()=>{"use strict";class e{version="1.0";steamAuth=new o("Off");steamWebApi=new o("Off");market=new o("Off");configuration=new s;hasRequiredPermissions=!1}class t{constructor(e){this.username=e.username,this.steamId=e.steamId,this.sessionId=e.sessionId,this.tradeOfferUrl=e.tradeOfferUrl,this.avatarUrl=e.avatarUrl,this.steamApiKey=e.steamApiKey}}class s{isExtensionEnabled=!0;serverLocation="world"}class o{constructor(e,t=!1){this.description=e,this.status=t}}class r{async onStart(){}onRun(e=!1){}async onStop(){}}let n=function(e){return e.Closed="Closed",e.Opened="Opened",e.Authorized="Authorized",e}({}),i=function(e){return e.GetApiKey="getApiKey",e.GetSteamId="getSteamId",e.GetTradeLink="getTradeLink",e.AcceptOffer="acceptOffer",e.CancelOffer="cancelOffer",e.DeclineOffer="declineOffer",e.SendOffer="sendOffer",e.GetLogs="getLogs",e.AuthToken="authToken",e}({});class a{constructor(){this.listeners=new Map}listen(e,t){const s=this.getListeners(e);return s.push(t),this.listeners.set(e,s),()=>{let s=this.getListeners(e);s=s?.filter((e=>e===t)),this.listeners.set(e,s)}}emit(e,t){const s=this.getListeners(e);for(const o of s)o(e,t)}getListeners(e){let t=this.listeners.get(e);return t||(t=[]),t}}const c="steam-service-accept-offer",d="steam-service-send-offer",h="steam-service-cancel-offer",u="steam-service-decline-offer",l="steam-service-get-offer-url",g="steam-service-get-web-api-key",m="steam-service-get-user-summaries",f="extension-session-get",p="extension-session-update",w="extension-session-onupdate",v=()=>{function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()};class S extends a{timeoutMs=5e3;constructor(){super(),this.isActive=!1,this.connectionStatus=n.Closed,this.connectionId=void 0,this.handlers=new Map}async handleMarket(e,t){switch(j.logger.log(`Event: "${e}" Payload: ${JSON.stringify(t)}`),e){case i.GetSteamId:return await this.onGetSteamId();case i.GetTradeLink:return await this.onGetTradeLink();case i.AcceptOffer:return await j.to.offscreen.invoke(c,t.post);case i.CancelOffer:return await j.to.offscreen.invoke(h,t.tradeofferid??t.tradeOfferId);case i.DeclineOffer:return await j.to.offscreen.invoke(u,t.tradeofferid??t.tradeOfferId);case i.SendOffer:return await j.to.offscreen.invoke(d,t.post);case i.AuthToken:this.onAuthToken(t);break;case i.GetApiKey:return await this.onGetSteamId();case i.GetLogs:return{success:!0};default:throw new Error(`[Error][WSClient]: Unknown event ${e}`)}}async connect(e="wss://appws.dota2.net"){try{this.webSocket=new WebSocket(e),this.webSocket.onmessage=e=>{this.onMessage(e)},this.webSocket.onerror=e=>this.onError(e),this.webSocket.onopen=()=>{this.onOpen()}}catch(e){this.onClose(e)}}terminate(){this.webSocket?.close(),this.webSocket=void 0,this.handlers=new Map,this.isActive=!1,this.connectionStatus=n.Closed,clearInterval(this.pingIntervalId),this.pingIntervalId=void 0}async authorize(){const{profile:e,version:t}=j.store.get();return await this.writeAsync("auth-direct",{s64:e?.steamId,token:"",type:"extension",version:t,info:""})}onError(e){j.logger.error(e)}onClose(e){this.connectionStatus=n.Closed,this.emit("connectionStatusChanged",this.connectionStatus),j.logger.log(`onClose: Code: ${e.code} Reason: ${JSON.stringify(e.reason)}`)}async onOpen(){j.logger.log("WebSocket connection is opened"),this.connectionStatus=n.Opened,this.emit("connectionStatusChanged",this.connectionStatus),clearInterval(this.pingIntervalId),this.pingIntervalId=setInterval((()=>{if(this.webSocket&&this.webSocket?.readyState===WebSocket.OPEN){if(!this.isActive)return j.logger.log("WebSocket connection is died"),void this.webSocket.close(4001,"WebSocket connection died");this.webSocket.send("ping"),this.isActive=!1}}),15e3),this.webSocket&&(this.webSocket.onclose=e=>this.onClose(e)),(await this.authorize()).success&&(this.isActive=!0,this.connectionStatus=n.Authorized,this.emit("connectionStatusChanged",this.connectionStatus),j.logger.log("WebSocket connection has been authorized"))}async onMessage(e){try{if("string"==typeof e.data){if("pong"===e.data)return void(this.isActive=!0);const t=JSON.parse(e.data);if(t.e&&t.c){const e=await this.handleMarket(t.e,t.d);return void(e&&this.write(t.e,e,t.c))}if(t.h)return void this.handlers.get(t.h)?.(t.d);if("auth ok"===t.e)return this.isActive=!0,this.connectionId=t.d.cid,void(this.connectionStatus=n.Authorized)}}catch(e){return void j.logger.error(e)}}onAuthToken(e){this.wsAuthToken=e.t}async onGetSteamId(){const{profile:e}=j.store.get();return e&&e.steamApiKey?{success:!0,data:e.steamApiKey,steamId:e.steamId}:(j.logger.error("WebSocket onGetSteamId: Steam profile or steam web api key is not valid"),{success:!1})}async onGetTradeLink(){const{profile:e}=j.store.get();return e&&e.tradeOfferUrl?{success:!0,steamId:e.steamId,tradeOfferUrl:e.tradeOfferUrl}:(j.logger.error("WebSocket onGetTradeLink: Steam profile or trade offer url is not valid"),{success:!1})}write(e,t,s){try{const o={e,d:t};if("function"==typeof s){const e=v();o.h=e,this.handlers.set(e,s)}"string"==typeof s&&(o.c=s),this.webSocket?.send(JSON.stringify(o))}catch(e){j.logger.error(e)}}async writeAsync(e,t){return new Promise(((s,o)=>{this.write(e,t,(e=>s(e))),setTimeout((()=>o(new Error("MarketWebSocketService timeout error"))),this.timeoutMs)}))}}const k=chrome.runtime.getURL("img/favicon_csgo.png"),y=(e,t,s)=>{chrome.notifications.create(e,{title:t,iconUrl:k,type:"basic",message:s})};let b=function(e){return e.NoSteamAuth="SteamAuthMissing",e.ConfirmTradeOffer="ConfirmTradeOffer",e}({});const A=e=>new Promise((t=>{setTimeout((()=>{t()}),e)}));class I{static async getSteamId(){const e=await chrome.cookies.get({url:"https://steamcommunity.com",name:"steamLoginSecure"});return e?.value?.split("%7C%7C")?.[0]??void 0}static async getSessionId(){const e=await chrome.cookies.get({url:"https://steamcommunity.com",name:"sessionid"});return e?.value??void 0}static async getSteamCookies(){const e=["steamLoginSecure","sessionid"],t=[];for(const s of e){const e=await chrome.cookies.get({url:"https://steamcommunity.com",name:s});e?.value&&t.push(`${s}=${e.value}`)}return t}static async getSteamAccessToken(){const e=await chrome.cookies.get({url:"https://steamcommunity.com",name:"steamLoginSecure"});return e?.value?.split("%7C%7C")?.[1]??void 0}static async refreshSteamAuthData(){const e=await chrome.tabs.create({url:"https://steamcommunity.com",active:!1});await A(2e3),e.id&&await chrome.tabs.remove(e.id)}static validateTokenExpireDate(e){const t=(e=>{const t=e.split(".");if(3!==t.length)throw new Error("Invalid JWT");const s=t[1].replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(s))})(e);return t.exp?t.exp<(new Date).getTime()/1e3?"expired":"valid":"not-valid"}}const x="market-app-background-run",O="firefox-workaround",C="background-offscreen-connection",L="configuration",E="profile",M=()=>"firefox"===R(),R=()=>{const e=navigator.userAgent;return e.match(/chrome|chromium|crios/i)?"chrome":e.match(/firefox|fxios/i)?"firefox":e.match(/safari/i)?"safari":e.match(/opr/i)?"opera":e.match(/edg/i)?"edge":void 0},_=(e,t)=>chrome.i18n.getMessage(e,t)||e,U=async e=>{let t="",s="#FFF";switch(e){case T.Green:t="On",s="#00FF00";break;case T.Red:t="Err",s="#FF0000"}chrome.action.setBadgeText({text:t}),chrome.action.setBadgeBackgroundColor({color:s})},W=async e=>{const t=e?"":"_grey";await chrome.action.setIcon({path:{48:chrome.runtime.getURL(`img/favicon_csgo${t}_48.png`),128:chrome.runtime.getURL(`img/favicon_csgo${t}.png`)}})};let T=function(e){return e.None="None",e.Green="Green",e.Red="Red",e}({});class P{responseHandlers=new Map;requestHandlers=new Map;constructor(e,t){this.logger=t,chrome.runtime.onConnect.addListener((t=>{t.name===e&&this.onConnect(t)}))}get isConnected(){return!!this.port}connect(e){const t=chrome.runtime.connect({name:e});this.onConnect(t)}onConnect(e){this.port&&this.port.disconnect(),this.logger.log("New connection: ",e.name),this.port=e,this.port.onMessage.addListener((e=>(this.reducer(e),!0))),this.port.onDisconnect.addListener((()=>{this.logger.log("Disconnected with: "+String(this.port?.name));for(const e of Array.from(this.requestHandlers.values()))e[1].abort(new Error("Port has been disconnected"));this.requestHandlers.clear(),this.port&&"error"in this.port&&this.port.error&&this.logger.error(this.port.error),this.port=void 0}))}addListener(e,t){this.responseHandlers.set(e,t),this.logger.log("Listener added: ",e)}removeListener(e){this.responseHandlers.delete(e)}async invoke(e,...t){this.logger.log("Invoke: ",e);const s=v();this.port?.postMessage({channel:e,payload:t??[],id:s});const o=new AbortController;return await new Promise(((e,t)=>{o.signal.onabort=e=>{t(e.currentTarget.reason)},this.requestHandlers.set(s,[t=>{this.requestHandlers.delete(s),e(t)},o])}))}async send(e,...t){this.logger.log("Send: ",e);const s=v();this.port?.postMessage({channel:e,payload:t??[],id:s})}async reducer(e){if("response"in e||"error"in e){const t=this.requestHandlers.get(e.id);if(!t)return;if("error"in e){const s=new Error;return s.name=e.name,s.message=e.message,s.stack=e.stack,void t[1].abort(s)}return void t[0](e.payload)}const t=this.responseHandlers.get(e.channel);if(t)try{const s=await t(...e.payload);this.port?.postMessage({id:e.id,response:!0,channel:e.channel,payload:s})}catch(t){this.port?.postMessage({id:e.id,error:!0,message:t.message,name:t.name,stack:t.stack,channel:e.channel})}else{this.logger.warn(`Unable to resolve reducer for "${e.channel}"`);const t=new Error(`Unable to resolve reducer for "${e.channel}"`);this.port?.postMessage({id:e.id,error:!0,message:t.message,name:t.name,stack:t.stack,channel:e.channel})}}}const G="https://steamcommunity.com/*";class N extends r{static default={origins:[G]};constructor(e){super(),this.store=e}async onStart(){const e=await chrome.permissions.contains(N.default);this.store.update({hasRequiredPermissions:e}),chrome.permissions.onAdded.addListener((e=>{this.store.update({hasRequiredPermissions:!!e.origins?.find((e=>e===G))})})),chrome.permissions.onRemoved.addListener((e=>{this.store.update({hasRequiredPermissions:!e.origins?.find((e=>e===G))})}))}static async requestAdditionalPermissions(){return await chrome.permissions.request(N.default)}}const q=new class{pool=[];constructor(e="default",t=!1){this.source=e,this.debug=t}add(e){const t=[];for(let s=0;s<e.length;s++){let o=e[s];"string"!=typeof o&&(o=JSON.stringify(o)),t.push(o)}this.pool.push((new Date).toISOString()+" "+t.join(" ")),this.pool.length>200&&this.pool.splice(0,1)}appendPrefix(e){return[`[${(new Date).toISOString()}][${this.source}]`,...e]}log(...e){this.debug&&console.log(...this.appendPrefix(e)),this.add(e)}warn(...e){this.debug&&console.warn(...this.appendPrefix(e)),this.add(e)}error(...e){this.debug&&console.error(...this.appendPrefix(e)),this.add(e)}}("background",!1),D=new class{async set(e,t){const s={};return s[e]=t,await chrome.storage.local.set(s),t}async get(e,t){const s=await chrome.storage.local.get(e);return s[e]?s[e]:t??void 0}},K=new class extends a{constructor(){super(),this.state=new e}get(){return this.state}update(e,t=!1){t&&(delete e.steamAuth,delete e.steamWebApi,delete e.market);const s=(o=this.state,JSON.parse(JSON.stringify(o)));var o;const r=Object.assign(this.state,e);return this.emit("update",{prev:s,next:r,diff:e}),r}},z=M()?new class{listeners=new Map;constructor(e,t){this.portName=e,this.logger=t,window&&!window.nativeCommunicationStore&&(window.nativeCommunicationStore=[]);const s=window.nativeCommunicationStore.find((t=>t.portName===e));if(s)return s;window.nativeCommunicationStore.push(this)}get isConnected(){return!0}connect(e){}addListener(e,t){this.logger.log("Listener added: ",e),this.listeners.set(e,t)}removeListener(e){this.listeners.delete(e)}async invoke(e,...t){this.logger.log("Invoke: ",e);const s=this.listeners.get(e);if(!s)throw new Error("Unable to invoke listener for "+e);return await s(...t)}async send(e,...t){this.logger.log("Send: ",e);const s=this.listeners.get(e);s?await s(...t):this.logger.warn("Unable to send data to listener "+e)}}(C,q):new P(C,q),F=new P("background-popup-connection",q),H=new N(K),$=new class extends r{constructor(e,t,s){super(),this.logger=e,this.store=t,this.storage=s,this.store.listen("update",(async(e,t)=>{await this.onStoreUpdate(t)}))}async onStart(){const e=await this.restoreExtensionState();await this.subscribeForChromeEvents(),this.onRun(!0,!1===e.configuration?.isExtensionEnabled)}onRun=((e,t=1e3)=>{let s;return(...o)=>{s&&clearTimeout(s),s=setTimeout((()=>e(...o)),t)}})((async(e=!1,t=!1)=>{try{const{profile:s,configuration:o,hasRequiredPermissions:r}=this.store.get();if(!r)return void this.logger.log("Prevent run: missing required permissions");if(!e&&s&&!o.isExtensionEnabled)return void this.logger.log("Prevent run: extension is disabled");await this.createOffscreenPage(),await this.checkSteamAuth();const n=await this.refreshUserData(t);if(!n||!o.isExtensionEnabled)return;await this.refreshApiKey(n),await this.refreshWebSocket()}catch(e){this.logger.log("Unable to make a run in background service"),this.logger.error(e)}}),1e3);async onStop(){this.unsubscribeFromMarketUpdates?.(),this.marketWebSocketService?.terminate(),this.marketWebSocketService=void 0,this.store.update({market:{status:!1,description:"off"},steamAuth:{status:!1,description:"off"},steamWebApi:{status:!1,description:"off"}})}async onStoreUpdate({prev:e,next:t,diff:s}){const{isExtensionEnabled:o,serverLocation:r}=t.configuration,n=e.configuration.isExtensionEnabled!==t.configuration.isExtensionEnabled,i=e.profile&&!t.profile;await j.to.popup.send(w,this.store.get()),e.configuration.serverLocation!==r&&await this.refreshWebSocket(!0),s.configuration&&await this.storage.set(L,t.configuration),await this.storage.set(E,t.profile),(!o&&n||i)&&await this.onStop(),o&&n&&this.onRun()}async subscribeForChromeEvents(){await chrome.alarms.create(x,{delayInMinutes:2,periodInMinutes:2}),chrome.alarms.onAlarm.addListener((e=>{e.name===x&&(this.logger.log("Alarm invoked: "+x),this.onRun())})),M()&&(await chrome.alarms.create(O,{delayInMinutes:1/6,periodInMinutes:1/6}),chrome.alarms.onAlarm.addListener((e=>{e.name===O&&(this.logger.log("Firefox alarm invoked: "+O),A(1))}))),chrome.cookies.onChanged.addListener((e=>{e.cookie.domain.includes("steamcommunity")&&(this.logger.log("Cookie change invoked: "+x),this.onRun(!0,!0))}))}async restoreExtensionState(){this.logger.log("Restore extension state");const e={},t=await this.storage.get(L);return t&&(e.configuration=t),e.profile=await this.storage.get(E),this.store.update(e),e}async createOffscreenPage(){if("chrome"===R()){if(!await chrome.offscreen.hasDocument()){const e="Offscreen API: creating a separated page to get username, trade offer url and web api key, automatically send trade offers requests.";this.logger.log(e),await chrome.offscreen.createDocument({url:chrome.runtime.getURL("offscreen.html"),reasons:[chrome.offscreen.Reason.DOM_PARSER,chrome.offscreen.Reason.DOM_SCRAPING],justification:e})}j.to.offscreen.isConnected||j.to.offscreen.connect(C)}}async checkSteamAuth(){const e=await I.getSteamAccessToken();if(!e)return y(b.NoSteamAuth,_("steam_authorization_is_missing"),_("open_https_steamcommunity_com_and_authorize_into_your_own_account")),void this.logger.log("Steam authorization is missing");switch(I.validateTokenExpireDate(e)){case"expired":this.logger.log("Steam session expired, trying to update"),await I.refreshSteamAuthData();break;case"not-valid":return y(b.NoSteamAuth,_("steam_authorization_is_not_valid"),_("open_https_steamcommunity_com_and_authorize_into_your_own_account")),void this.logger.log("Steam authorization is not valid");case"valid":return chrome.notifications.clear(b.NoSteamAuth),void this.logger.log("Steam authorization is okay")}}async refreshUserData(e=!1){const s={},o=await I.getSteamId(),r=await I.getSessionId();try{const{avatarUrl:n,username:i}=await j.to.offscreen.invoke(m);return r&&o&&i?(s.profile=new t({sessionId:r,steamId:o,username:i,avatarUrl:n}),s.steamAuth={status:!0,description:"ok"},s.profile.tradeOfferUrl=await j.to.offscreen.invoke(l)):(s.steamAuth={status:!1,description:"auth_failed"},s.profile=void 0),j.store.update(s,e),s.profile}catch(t){let o="error";t instanceof Error&&(o=t.message),s.steamAuth={status:!1,description:o},j.store.update(s,e)}}async refreshApiKey(e,t=!1){const s={};try{return s.profile=e,s.profile.steamApiKey=await j.to.offscreen.invoke(g),s.steamWebApi={status:!0,description:"ok"},j.store.update(s,t),s.profile.steamApiKey}catch(e){let o="error";e instanceof Error&&(o=e.message),s.steamWebApi={status:!1,description:o},j.store.update(s,t)}}async refreshWebSocket(e=!1){const{serverLocation:t}=this.store.get().configuration,s={};try{if((this.marketWebSocketService?.connectionStatus===n.Closed||e)&&(this.unsubscribeFromMarketUpdates?.(),this.marketWebSocketService?.terminate(),this.marketWebSocketService=void 0),!this.marketWebSocketService){s.market={status:!1,description:"off"},this.marketWebSocketService=new S,this.unsubscribeFromMarketUpdates=this.marketWebSocketService.listen("connectionStatusChanged",((e,t)=>{const s={status:t===n.Authorized,description:t};j.store.update({market:s})}));const e="world"===t?"wss://appws.dota2.net/":"wss://appws.csgobuy.cn/";await this.marketWebSocketService.connect(e)}}catch(e){s.market={status:!1,description:"auth_failed"}}j.store.update(s)}}(q,K,D),J=new class{constructor(e){this.store=e,this.store.listen("update",(async(e,t)=>{await this.onStoreUpdate(t)}))}async onStart(){await U(T.None),await W(!1)}async onStoreUpdate({prev:e,next:t}){const{isExtensionEnabled:s}=t.configuration,o=e.profile&&!t.profile,r=t.market.status&&t.steamAuth.status&&t.steamWebApi.status;return s&&!o&&t.hasRequiredPermissions?s?(await W(!0),r?void await U(T.Green):void await U(T.Red)):void 0:(await U(T.None),void await W(!1))}}(K),B=new class extends r{async onStart(){chrome.runtime.onMessageExternal.addListener(((e,t,s)=>(this.externalMessageHandler(e,s),!0)))}async externalMessageHandler(e,t){switch(j.logger.log("External message handler invoked: "+String(e.cmd)),e.cmd){case"checkInstall":t({success:!0});break;case"start":t(await this.onStartMessage());break;case"getApiKey":t(await this.onGetApiKeyMessage())}}async onStartMessage(){const{configuration:e,hasRequiredPermissions:t}=j.store.get();return t&&e.isExtensionEnabled?{success:!0}:{success:!1}}async onGetApiKeyMessage(){const{profile:e}=j.store.get();return e&&e.steamApiKey?{success:!0,data:e.steamApiKey,steamId:e.steamId}:(j.logger.error("WebSocket onGetSteamId: Steam profile or steam web api key is not valid"),{success:!1})}};z.addListener(f,K.get.bind(K)),z.addListener("declarative-net-requests-set-referer-header-rule",(async(e,t,s)=>{const o={id:e,priority:1,action:{type:"modifyHeaders",requestHeaders:[{operation:"set",header:"Referer",value:s}]},condition:{urlFilter:t,resourceTypes:["xmlhttprequest"]}};await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:[e],addRules:[o]}),j.logger.log("Rule has been applied: ",o)}).bind(K)),z.addListener("background-restart",(()=>{chrome.runtime.reload()})),F.addListener(f,K.get.bind(K)),F.addListener(p,(e=>{K.update(e)}));const j={logger:q,to:{offscreen:z,popup:F},services:{background:$,badge:J,permissions:H,installCheck:B},store:K,storage:D};j.logger.log("Background API has been loaded"),j.services.installCheck.onStart(),j.services.permissions.onStart(),j.services.background.onStart(),j.services.badge.onStart()})();