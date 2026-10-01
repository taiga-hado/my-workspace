/* 求職者送客の窓口 - 問い合わせ（資料ダウンロード）フォーム共通
 * ご希望のセグメント（service checkbox）は必須・1つ以上（2026-10-01）。
 * トップ（#contact）と /contact/ の2か所で使う。送信先は GAS Web App（従来と同じ）。
 * 送信後は /thanks/（資料ページ）へ遷移し、そこで選んだ領域の資料と面談予約URLを出す。
 * 直近の送信内容は localStorage（madoguchi_submissions）に残し、資料ページが領域の判定に使う。 */
(function(){
  'use strict';
  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxKPd--F16UiULPqRmbz_jLjWGt-Xy9y_aipISPsgFhFiHcdZsOaSHNoc2AsCZXgQcR/exec';
  var STORAGE_KEY = 'madoguchi_submissions';
  var NEXT = '/thanks/';
  // フリーメール（独自ドメイン以外）は登録不可
  var FREE_EMAIL_DOMAINS = [
    'gmail.com','googlemail.com','yahoo.co.jp','yahoo.com','ymail.ne.jp',
    'hotmail.com','hotmail.co.jp','outlook.com','outlook.jp','live.jp','live.com','msn.com',
    'icloud.com','me.com','mac.com','aol.com','aol.jp',
    'protonmail.com','proton.me','mail.com','gmx.com','gmx.net','yandex.com','zoho.com',
    'docomo.ne.jp','ezweb.ne.jp','au.com','softbank.ne.jp','i.softbank.jp','ymobile.ne.jp',
    'rakuten.jp','rakumail.jp','excite.co.jp','goo.jp','nifty.com','biglobe.ne.jp'
  ];

  function isFreeEmail(email){
    var at = email.lastIndexOf('@');
    if(at < 0) return false;
    return FREE_EMAIL_DOMAINS.indexOf(email.slice(at + 1).trim().toLowerCase()) !== -1;
  }

  function bind(form){
    var emailInput = form.querySelector('input[name="email"]');
    var err = form.querySelector('.iq-err');
    var submitBtn = form.querySelector('button[type="submit"]');
    var tag = form.getAttribute('data-tag') || '';

    function showError(msg){
      if(!err) return;
      err.textContent = msg || '';
      err.hidden = !msg;
    }
    function validateEmailDomain(){
      var bad = emailInput && isFreeEmail(emailInput.value || '');
      if(emailInput) emailInput.classList.toggle('is-invalid', !!bad);
      if(bad) showError('フリーメールアドレスはご利用いただけません。企業の独自ドメインのメールアドレスをご入力ください。');
      else if(err && err.textContent.indexOf('フリーメール') === 0) showError('');
      return !bad;
    }
    if(emailInput){
      emailInput.addEventListener('blur', validateEmailDomain);
      emailInput.addEventListener('input', function(){ if(err && !err.hidden) validateEmailDomain(); });
    }
    form.querySelectorAll('.iq-area input[type="checkbox"]').forEach(function(cb){
      var sync = function(){ cb.closest('.iq-area').classList.toggle('is-checked', cb.checked); };
      cb.addEventListener('change', sync); sync();
    });

    function serviceValues(){
      var checked = form.querySelectorAll('input[name="service"]:checked');
      return Array.prototype.map.call(checked, function(c){ return c.value; }).join('、');
    }

    function buildSubmission(){
      var d = new FormData(form);
      var attr = (window.MADOGUCHI_ATTRIBUTION && window.MADOGUCHI_ATTRIBUTION.get()) || {};
      return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
        submittedAt: new Date().toISOString(),
        company: d.get('company')||'',
        department: d.get('department')||'',
        lastName: d.get('lastName')||'',
        firstName: d.get('firstName')||'',
        email: d.get('email')||'',
        service: serviceValues(),
        monthly: d.get('monthly')||'',
        message: d.get('message')||'',
        tag: tag,
        utm_source: attr.utm_source||'',
        utm_medium: attr.utm_medium||'',
        utm_campaign: attr.utm_campaign||'',
        utm_term: attr.utm_term||'',
        utm_content: attr.utm_content||'',
        gclid: attr.gclid||'',
        yclid: attr.yclid||'',
        landing_page: attr.landing_page||'',
        first_landing: attr.first_landing||'',
        first_referrer: attr.first_referrer||'',
        ref: attr.ref||'',
        userAgent: navigator.userAgent,
        referer: document.referrer || location.href
      };
    }

    function saveLocal(submission){
      try {
        var list = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
        list.unshift(submission);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
      } catch(e){}
    }

    function post(submission){
      var params = new URLSearchParams();
      Object.keys(submission).forEach(function(k){ params.append(k, submission[k] == null ? '' : String(submission[k])); });
      return fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body: params.toString() });
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      // ハニーポット（人には見えない欄）が埋まっていたら送らずに成功を装う
      var hp = form.querySelector('input[name="website"]');
      if(hp && hp.value){ location.href = NEXT; return; }
      if(!form.checkValidity()){ form.reportValidity(); return; }
      if(!validateEmailDomain()){ emailInput.focus(); return; }
      // ご希望のセグメントは必須（1つ以上）
      if(!serviceValues()){
        showError('ご希望のセグメントを1つ以上お選びください。');
        var first = form.querySelector('.iq-area input[type="checkbox"]');
        if(first) first.focus();
        return;
      }
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '送信中…'; }
      var submission = buildSubmission();
      saveLocal(submission);
      post(submission).catch(function(){ /* no-cors: opaque, ignore */ }).then(function(){
        // 広告コンバージョン計測のため、資料ページ（/thanks/）へ遷移して資料を出す
        var q = submission.service.indexOf('第二新卒') !== -1 && submission.service.indexOf('新卒領域') !== -1 ? 'both'
              : submission.service.indexOf('第二新卒') !== -1 ? 'chuto'
              : submission.service.indexOf('新卒領域') !== -1 ? 'shinsotsu' : 'both';
        location.href = NEXT + '?area=' + q;
      });
    });
  }

  document.querySelectorAll('form.iq-form').forEach(bind);
})();
