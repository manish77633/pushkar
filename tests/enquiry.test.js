const {test, beforeEach} = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const handler = require('../api/enquiry');

for (const key of ['SMTP_USER','SMTP_PASS','RECEIVER_EMAIL','RECAPTCHA_SECRET_KEY']) process.env[key] = 'test-value';
const valid = () => ({name:'Jane Doe',country:'India',email:'jane@example.com',mobile:'9876543210',message:'I would like to visit Pushkar.',issuedAt:Date.now()-10000,recaptchaToken:'valid',sourcePage:'Pushkar Fair',sourceSection:'Tour itinerary',pageUrl:'https://example.com/pushkar-fair',website:''});
let sent, failMail, invalidChallenge, captchaErrorCode;
beforeEach(() => {
  process.env.CAPTCHA_ENABLED = 'false';
  sent = []; failMail = false; invalidChallenge = false; captchaErrorCode = '';
  nodemailer.createTransport = () => ({sendMail: async data => { if (failMail) throw Object.assign(new Error('SMTP unavailable'), {code:'ECONNECTION'}); sent.push(data); }});
  global.fetch = async (url, options) => {
    if (String(url).includes('siteverify')) return {ok:true,json:async()=>({success:!invalidChallenge,hostname:'example.com','error-codes':captchaErrorCode?[captchaErrorCode]:[]})};
    throw new Error(`Unexpected network call: ${url}`);
  };
});
async function request(body=valid(), method='POST') {
  const req = {method,body,headers:{host:'example.com',origin:'https://example.com','content-type':'application/json','x-forwarded-for':'203.0.113.1'}};
  const res = {code:200,setHeader(){},status(code){this.code=code;return this;},json(data){this.body=data;return this;}};
  await handler(req,res);
  return res;
}
test('valid enquiry sends email with page and section', async () => {
  const response = await request(); assert.equal(response.code,200); assert.equal(sent.length,1);
  assert.match(sent[0].text,/Tour itinerary/); assert.equal(sent[0].replyTo,'jane@example.com');
});
test('temporary CAPTCHA bypass sends without a token or verification request', async () => {
  const response = await request({...valid(), recaptchaToken: ''});
  assert.equal(response.code, 200);
  assert.equal(sent.length, 1);
});
test('invalid email and missing fields are rejected', async () => {
  assert.equal((await request({...valid(),email:'wrong'})).code,400);
  assert.equal((await request({...valid(),name:''})).code,400);
  assert.equal(sent.length,0);
});
test('reCAPTCHA and honeypot reject spam', async () => {
  process.env.CAPTCHA_ENABLED = 'true';
  invalidChallenge=true; assert.equal((await request()).code,400);
  invalidChallenge=false; assert.equal((await request({...valid(),website:'spam'})).code,400);
});
test('invalid reCAPTCHA secret reports setup error', async () => {
  process.env.CAPTCHA_ENABLED = 'true';
  invalidChallenge=true; captchaErrorCode='invalid-input-secret';
  const response=await request();
  assert.equal(response.code,503);
  assert.match(response.body.error,/CAPTCHA setup/);
});
test('SMTP failure returns an error and permits retry', async () => {
  failMail=true; assert.equal((await request()).code,502);
  failMail=false; assert.equal((await request()).code,200);
});
test('different visitors can submit', async () => {
  assert.equal((await request()).code,200);
  assert.equal((await request({...valid(),email:'other@example.com'})).code,200);
});
