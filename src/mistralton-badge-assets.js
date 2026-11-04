window.MISTRALTON_BADGE_ASSETS={"source":"IRBI a/1/1/7:7,46 + a/1/1/5; native fifth badge receipt","backgroundSha256":"09931ad67743796e8b0d7cfbfecc902f8f28abce7e811391b5881bf470e5bb1a","models":{"quakeBadgeM":{"url":"assets/field-effects/quakeBadgeM/gymbadge5.glb","sourceMembers":[41,42,43],"frames":361},"quakeBadgeF":{"url":"assets/field-effects/quakeBadgeF/gymbadge5f.glb","sourceMembers":[164,165,166],"frames":361}},"materialAlpha":{"quakeBadgeM":{},"quakeBadgeF":{}},"effects":{"7":{"descriptor":[15,0,0,270,16,41,0,0,18,19,20,65535,42,43,44,65535,1,0],"background":"badgeBackground","item":"quakeBadgeM","frames":361,"particles":false,"descriptorSha256":"17260b30cec05ebd3c0a6f6a202454135c55d438abe0e5cf1279bcb11c4dae99","label":"Medaglia Sisma","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"},"46":{"descriptor":[15,0,0,270,16,164,0,0,18,19,20,65535,165,166,167,65535,1,0],"background":"badgeBackground","item":"quakeBadgeF","frames":361,"particles":false,"descriptorSha256":"3930d0b681ab17c008b19ffe8cebac178ff1144eaa5435146f8de7a9ca377337","label":"Medaglia Sisma","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"}},"hashes":{"41":"2fca34374935a90b5779adb64d04cb08cd93eff3bd5bc1a58a69aa3cffb13f99","42":"d2c19c43b11c1b83419d190e0a27326e667b1951a61cbd2f6963832c21d221d2","43":"a9d4aaa412e7eed95b64ae5cf53cbcaa1c5d492b3cae4c29a55345aad463eaa8","164":"4a047091fa8cb15013f182c52d3e61e95c8db4924682cf55d5b52457480fa4b8","165":"aaf8c6a1f4dd066ed8e4d59dc7910d4f04b749beeef9dd778ea8c952c8508632","166":"fca8fcf18f25e386e3628200f55bbbfa7d2c6908adc5063f3ea7cd923ed70470"}};
(function(root){
  const extension=root.MISTRALTON_BADGE_ASSETS;
  function install(target=root.FIELD_EFFECT_ASSETS){
    if(!target?.models?.badgeBackground)throw Error('Native badge background unavailable');
    if(target.hashes?.['16']!==extension.backgroundSha256)throw Error('Native badge background mismatch');
    for(const key of ['models','materialAlpha','effects','hashes'])Object.assign(target[key]??={},extension[key]);
    return target;
  }
  root.MistraltonBadgeAssets={install};
  if(root.FIELD_EFFECT_ASSETS)install();
})(typeof window!=='undefined'?window:globalThis);
