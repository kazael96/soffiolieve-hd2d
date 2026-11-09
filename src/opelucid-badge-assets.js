window.OPELUCID_BADGE_ASSETS={"source":"IRBI a/1/1/7:9,48 + a/1/1/5; native freeze badge receipt","backgroundSha256":"09931ad67743796e8b0d7cfbfecc902f8f28abce7e811391b5881bf470e5bb1a","models":{"freezeBadgeM":{"url":"assets/field-effects/freezeBadgeM/gymbadge7.glb","sourceMembers":[49,50,51],"frames":361},"freezeBadgeF":{"url":"assets/field-effects/freezeBadgeF/gymbadge7f.glb","sourceMembers":[172,173,174],"frames":361}},"materialAlpha":{"freezeBadgeM":{},"freezeBadgeF":{}},"effects":{"9":{"descriptor":[15,0,0,270,16,49,0,0,18,19,20,65535,50,51,52,65535,1,0],"background":"badgeBackground","item":"freezeBadgeM","frames":361,"particles":false,"descriptorSha256":"454c711551919a4a70e451557cf3f95c125f2f4dd2cbd88b20ff44905deaa1b2","label":"Medaglia Stalattite","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"},"48":{"descriptor":[15,0,0,270,16,172,0,0,18,19,20,65535,173,174,175,65535,1,0],"background":"badgeBackground","item":"freezeBadgeF","frames":361,"particles":false,"descriptorSha256":"84310032ae5848e7a6fc9613e71519b96d24fe248189ed6a4377f39a2a9ebff3","label":"Medaglia Stalattite","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"}},"hashes":{"49":"19d4eba423778ca422f522fe80962ffc1f669ca563728f1a442984a1ca0540e1","50":"4a01e3d48a5a3f0bb3155787791728ccd77ba34bf88b972cf1cdc7d3fc728607","51":"7a061bc01381e37f67a92c980902a2eddb7ad359792127e3e3b548370926dd04","172":"d0a94d1b75bc46cbe339fa4e265fe365588147d88ec055f084ec7fc9bd84a869","173":"9fb226e3757ddcabc1535c8e23e38e3355c342e492469bc79adbec99deccece5","174":"0a4b696819fe0bbc006150a8c6d7e1962639c3481e574b45d01e79ef16029647"}};
(function(root){
  const extension=root.OPELUCID_BADGE_ASSETS;
  function install(target=root.FIELD_EFFECT_ASSETS){
    if(!target?.models?.badgeBackground)throw Error('Native badge background unavailable');
    if(target.hashes?.['16']!==extension.backgroundSha256)throw Error('Native badge background mismatch');
    for(const key of ['models','materialAlpha','effects','hashes'])Object.assign(target[key]??={},extension[key]);
    return target;
  }
  root.OpelucidBadgeAssets={install};
  if(root.FIELD_EFFECT_ASSETS)install();
})(typeof window!=='undefined'?window:globalThis);
