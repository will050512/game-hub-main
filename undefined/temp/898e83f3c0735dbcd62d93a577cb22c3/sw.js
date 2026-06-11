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
    "revision": "b16840877c279889ec25b38a19ab113f"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-BpVCRmk3.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Jcz0PX92.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dix8vAXf.css",
    "revision": null
  },
  {
    "url": "assets/settingsStore-BRFaLRuW.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-CyebcyNc.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-BlY63med.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-DYnqwWFg.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-wBoVNDLR.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-CpzW3beM.js",
    "revision": null
  },
  {
    "url": "assets/index-DU3R-7Wf.js",
    "revision": null
  },
  {
    "url": "assets/index-DN7Xxo07.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-DgeqtopT.js",
    "revision": null
  },
  {
    "url": "assets/index-DFBUyE17.js",
    "revision": null
  },
  {
    "url": "assets/index-D6pTBB3A.js",
    "revision": null
  },
  {
    "url": "assets/index-D1DU6c2c.js",
    "revision": null
  },
  {
    "url": "assets/index-d08ezBV4.js",
    "revision": null
  },
  {
    "url": "assets/index-Cw7QftXq.js",
    "revision": null
  },
  {
    "url": "assets/index-Cr2a1l8u.js",
    "revision": null
  },
  {
    "url": "assets/index-CeX4KfxN.js",
    "revision": null
  },
  {
    "url": "assets/index-C3x_8_YV.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/index-Bwvs398N.js",
    "revision": null
  },
  {
    "url": "assets/index-BUX2brNK.js",
    "revision": null
  },
  {
    "url": "assets/index-BcWxTFhh.js",
    "revision": null
  },
  {
    "url": "assets/index-Bb-GRWD1.js",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BJqGnCae.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BjHP1AHL.css",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-DeZYZr6c.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-CgCxVM_q.css",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CUBcA2hY.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-BbnN_Idu.css",
    "revision": null
  },
  {
    "url": "assets/currencyStore-EuJr_66Y.js",
    "revision": null
  },
  {
    "url": "assets/CanvasEffectsManager-kmUPxDjJ.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-_WBQq4Fd.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-DlQpZLSH.css",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-EjCJIc8E.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/audio-BxVQ28ed.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-C1CcZz_e.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-CSssGE35.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-mqxzMV_k.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-GbZBedgM.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-XARiTbq8.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-BkBDU9_J.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-Dpb2v15H.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-BfkZ-Oue.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-DYxcoa4q.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-Fv_MTcqJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-C6mtLcFY.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-C2HD6_SA.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-CxHcDtGC.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-CfVK--O8.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-BNMAj231.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-DuuQcM4v.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-DMC-0-e3.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-Cr9_7PvS.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-BaPsau1o.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-D1cAXXVq.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-BAui_s2b.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-Dd1BNT34.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-CqoQFbbv.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-B3a6OYLo.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-Bcffjf3s.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-m68K8i6e.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-BkWVzom4.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-MTWN0y_H.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-CMUVwuTM.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-CfAHLSK8.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-Baj7txFH.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-CpwfGZ3Y.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-BCkR83rd.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-VuToOWQJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-DYTJXnKh.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-BZPil9Zw.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-B5WcMrXz.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-DdDmnNXH.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-Dxqh0-z9.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-BeSQlERt.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-EAe7J2sV.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-BtXBYR-T.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-D0tjpp9E.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-CPrzz_B_.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-Cp4eJlF5.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-vnduw6Kg.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-C0fdXTUB.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-CJl1upaR.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-bFjw5FgH.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-D3pXJH7j.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-CI7y-kXi.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-DPFbDb1g.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-6UrGTLmO.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-CGiY_6UR.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-CFfqRZM-.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-BEbmUafB.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-DVzWn8LZ.js",
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




