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
    "revision": "6484aff2e075517ed170c300ef3df208"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-B86z_oS-.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dix8vAXf.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dat7P9Ud.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/registry-CybGMt6n.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-q5uamYJJ.css",
    "revision": null
  },
  {
    "url": "assets/LobbyView-BPLN2Xro.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-CLTUQT7A.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-nvCqu0my.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-CaNFkrTC.js",
    "revision": null
  },
  {
    "url": "assets/index-_MaC6Mt8.js",
    "revision": null
  },
  {
    "url": "assets/index-Y1jzLSPq.js",
    "revision": null
  },
  {
    "url": "assets/index-Th7uo_Ga.js",
    "revision": null
  },
  {
    "url": "assets/index-Dq8RkY5u.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-C_RS0wGL.js",
    "revision": null
  },
  {
    "url": "assets/index-Cn_Ue0c5.js",
    "revision": null
  },
  {
    "url": "assets/index-Cm-_4Lo6.js",
    "revision": null
  },
  {
    "url": "assets/index-CLbHQ9l8.js",
    "revision": null
  },
  {
    "url": "assets/index-CCadeIX3.js",
    "revision": null
  },
  {
    "url": "assets/index-C44FKEjE.js",
    "revision": null
  },
  {
    "url": "assets/index-BZ37fnKK.js",
    "revision": null
  },
  {
    "url": "assets/index-BXLFA7cN.css",
    "revision": null
  },
  {
    "url": "assets/index-BrYfOsLS.js",
    "revision": null
  },
  {
    "url": "assets/index-Brxefy8D.js",
    "revision": null
  },
  {
    "url": "assets/index-BGQ-yAxz.js",
    "revision": null
  },
  {
    "url": "assets/index-BAaqNz7l.js",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BjHP1AHL.css",
    "revision": null
  },
  {
    "url": "assets/GameResultView-a2ARH3fG.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-Dao9ZGRz.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-D9K5h-Z0.css",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-BSHjPTEi.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-BbnN_Idu.css",
    "revision": null
  },
  {
    "url": "assets/DoodleCard-dBEjkVcE.css",
    "revision": null
  },
  {
    "url": "assets/DoodleCard-CoyKZWn-.js",
    "revision": null
  },
  {
    "url": "assets/currencyStore-Bw21O39T.js",
    "revision": null
  },
  {
    "url": "assets/CanvasEffectsManager-kmUPxDjJ.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-rg0U_BOW.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-DlQpZLSH.css",
    "revision": null
  },
  {
    "url": "assets/audio-5l2P0_Ia.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-B8giD5lb.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-CfhXh4U7.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-9r_deWfC.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-D-Py616-.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-FAgR56O6.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-B0FCcMfH.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-D3cePMQf.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-pD3S_3pu.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-B6ghmurb.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-9vtNhDBF.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-CY55mGc-.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-XAc_X-Qw.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-BEROG5jF.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-DylhgVLp.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-0QB-yR-3.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-BgERw8SV.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-BVHAhj_k.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-5CGp04QC.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-BFuk8E4m.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-tw86OIZF.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-AwtFAg0r.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-BMqCDIdM.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-DVjlmKjZ.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-WQqIbWqb.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-DoUXo3v4.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-Bn0YkeCw.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-xD_AQ4Fj.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-nLPU_UAv.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-DVYkqF2-.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-5XYJbBMA.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-BS-wnv9Q.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-GPuvaBrx.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-Bg1Vmwpf.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-BaT8Twm1.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-U0GioOAi.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-BipyMvva.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-B3fe_F6q.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-KnJMrBfw.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-BtMGf_n-.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-Dj5_8O62.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-Py_BOAMy.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-DPCaJw4p.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-C3zgWAe5.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-CHr2_xDf.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-DIvTYn2k.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-C5wFZ1Hd.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-gVZmWgnq.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-CYDIXxts.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-Lgpyb2rl.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-BC-GUFTc.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-D-BOw1SZ.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-C1z9jMj8.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-Dhy8nOrB.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-mEKM48EQ.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-DOcUP_rw.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-B-8q_YOO.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-C0dYmemt.js",
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




