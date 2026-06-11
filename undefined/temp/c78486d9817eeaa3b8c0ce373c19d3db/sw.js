import {registerRoute as workbox_routing_registerRoute} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-routing/registerRoute.mjs';
import {StaleWhileRevalidate as workbox_strategies_StaleWhileRevalidate} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-strategies/StaleWhileRevalidate.mjs';
import {ExpirationPlugin as workbox_expiration_ExpirationPlugin} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-expiration/ExpirationPlugin.mjs';
import {CacheFirst as workbox_strategies_CacheFirst} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-strategies/CacheFirst.mjs';
import {clientsClaim as workbox_core_clientsClaim} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-core/clientsClaim.mjs';
import {precacheAndRoute as workbox_precaching_precacheAndRoute} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-precaching/precacheAndRoute.mjs';
import {cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs';
import {NavigationRoute as workbox_routing_NavigationRoute} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-routing/NavigationRoute.mjs';
import {createHandlerBoundToURL as workbox_precaching_createHandlerBoundToURL} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-precaching/createHandlerBoundToURL.mjs';/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */








self.skipWaiting();

workbox_core_clientsClaim();


/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute([
  {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  },
  {
    "url": "index.html",
    "revision": "5bfcb21d5a5e75163f637a6298c22de9"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-CBrMqxgf.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dix8vAXf.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-DB8-xgzM.js",
    "revision": null
  },
  {
    "url": "assets/settingsStore-D0qpZtZs.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-DeHns2my.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-BlY63med.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-DKyUP0o0.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-Bd8eiEm0.js",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-CtYDADAQ.js",
    "revision": null
  },
  {
    "url": "assets/index-rpIcufoT.js",
    "revision": null
  },
  {
    "url": "assets/index-fgxNeQqn.js",
    "revision": null
  },
  {
    "url": "assets/index-DVEVgelv.js",
    "revision": null
  },
  {
    "url": "assets/index-DV44Vn6X.js",
    "revision": null
  },
  {
    "url": "assets/index-DpZJ85Sd.js",
    "revision": null
  },
  {
    "url": "assets/index-DnXHDx1A.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-DhHLzchL.js",
    "revision": null
  },
  {
    "url": "assets/index-DHcsUcLo.js",
    "revision": null
  },
  {
    "url": "assets/index-D3-hVyi1.js",
    "revision": null
  },
  {
    "url": "assets/index-C_N5sF5Z.js",
    "revision": null
  },
  {
    "url": "assets/index-CHWUQjV6.js",
    "revision": null
  },
  {
    "url": "assets/index-C-7Pkfeh.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/index-BZB6vX7f.js",
    "revision": null
  },
  {
    "url": "assets/index-BtH9iwVZ.js",
    "revision": null
  },
  {
    "url": "assets/index-B9rYokUH.js",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-Bq3bkPnV.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BjHP1AHL.css",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-ygD4oj7m.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-W9lIK0AF.css",
    "revision": null
  },
  {
    "url": "assets/gameOptimizationProfiles-BBf8MQxO.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-DN3R05S7.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CIzEQQdN.css",
    "revision": null
  },
  {
    "url": "assets/currencyStore-DAg-cgPB.js",
    "revision": null
  },
  {
    "url": "assets/CanvasEffectsManager-kmUPxDjJ.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-KeqrdUWi.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-DlQpZLSH.css",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-yEvWTQ1K.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/audio-BiBie2MG.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-Cfs3usuu.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-JxIshGHL.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-IMNHKncX.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-GzkOXIQq.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-CUdRvPqm.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-DgQDnE5E.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-B23rhAwm.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-DWquwDCH.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-DSL7BSVU.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-CgjffYST.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-DHMB4Nxe.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-xstPWea5.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-D5lyYouy.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-c2Eh5cIG.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-DLKfIkSC.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-D328LPVy.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-n-98gH9Y.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-BF0VhJED.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-CEUzDtB2.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-BArQbQ97.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-2RNBykq6.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-FM3VK25J.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-Bpe8Oneh.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-BJ257G1a.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-DdlHEbpZ.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-_lvjn4Dc.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-Blj4h1oo.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-DMYC6CPm.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-luc-j_sJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-BBt8x07T.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-ChpO4dHC.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-D_R3GyFW.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-BXNLLqi5.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-BtBC5Tsl.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-BRJXMBO_.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton--6qZi1pn.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-DWK-2wsl.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-wi7wur2C.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-DuNfdscm.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-BH6uCMHD.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-rbYHEiHy.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-gxq7tHgH.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-CRTqU_49.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-BXsizy0j.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-Dx6kdCx0.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-Db4V1s0D.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-B-KIo-qu.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-CkUM-aMD.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-FuamiRQX.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-BJth2i2y.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-BkyTL-6I.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-DKOjx4hP.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-MHSUnCmz.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-Cb1twWoJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-o4HM6dw-.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-Cx4njTzk.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-fPjgDP8o.js",
    "revision": null
  },
  {
    "url": "assets/achievements-BLbmGv-o.js",
    "revision": null
  },
  {
    "url": "icons/icon-192.svg",
    "revision": "3a517b9e188e2fbcf3cc16edc056bd3a"
  },
  {
    "url": "icons/icon-512.svg",
    "revision": "d34a0dbcc0d798895b55b08704411272"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "92a25cff57b2c04c26f6f6da48337efa"
  }
], {});
workbox_precaching_cleanupOutdatedCaches();
workbox_routing_registerRoute(new workbox_routing_NavigationRoute(workbox_precaching_createHandlerBoundToURL("index.html")));


workbox_routing_registerRoute(/\.(?:js|css)$/, new workbox_strategies_StaleWhileRevalidate({ "cacheName":"static-resources", plugins: [] }), 'GET');
workbox_routing_registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp)$/, new workbox_strategies_CacheFirst({ "cacheName":"images", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 2592000 })] }), 'GET');
workbox_routing_registerRoute(/\.(?:woff|woff2|ttf|eot)$/, new workbox_strategies_CacheFirst({ "cacheName":"fonts", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536000 })] }), 'GET');




