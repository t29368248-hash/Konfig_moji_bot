const CHANNEL="@konfingMoji", SUPPORT="@Mojttaba6", CARD_NUMBER="6037997523216357", CARD_NAME="حسینی", ADMIN_ID="7326981788";
const PLANS={
 wireguard:[["wg5","⚡ ۵ گیگ",5,25000],["wg10","⚡ ۱۰ گیگ",10,40000],["wg20","⚡ ۲۰ گیگ",20,80000],["wg50","⚡ ۵۰ گیگ",50,200000]],
 gaming:[["game1","🎮 ۱ گیگ",1,12000],["game5","🎮 ۵ گیگ",5,60000],["game10","🎮 ۱۰ گیگ",10,120000],["game20","🎮 ۲۰ گیگ",20,240000],["game50","🎮 ۵۰ گیگ",50,600000]],
 web:[["web1","🌐 ۱ گیگ",1,3000],["web5","🌐 ۵ گیگ",5,15000],["web10","🌐 ۱۰ گیگ",10,30000],["web20","🌐 ۲۰ گیگ",20,60000],["web50","🌐 ۵۰ گیگ",50,150000]]
};
const DB=typeof BOT_DATA!=="undefined"?BOT_DATA:null;
const kb=a=>({inline_keyboard:a});
const home=()=>kb([[{text:"🛒 خرید کانفیگ",callback_data:"buy"}],[{text:"🎫 پشتیبانی",callback_data:"support"}]]);
const buy=()=>kb([[{text:"⚡ وایرگارد",callback_data:"type:wireguard"}],[{text:"🎮 گیمینگ",callback_data:"type:gaming"}],[{text:"🌐 وب",callback_data:"type:web"}],[{text:"🔙 بازگشت",callback_data:"home"}]]);
const price=n=>Number(n).toLocaleString("fa-IR");
const tg=async(e,m,p)=>{let r=await fetch(`https://api.telegram.org/bot${e.BOT_TOKEN}/${m}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(p)});let j=await r.json();if(!j.ok)throw Error(j.description||m);return j.result};
const send=(e,c,t,k)=>tg(e,"sendMessage",{chat_id:c,text:t,reply_markup:k,parse_mode:"HTML",disable_web_page_preview:true});
const member=async(e,u)=>{try{let r=await tg(e,"getChatMember",{chat_id:CHANNEL,user_id:u});return["creator","administrator","member"].includes(r.status)}catch{return false}};
const gate=async(e,c,u)=>{if(await member(e,u))return true;await send(e,c,"🔒 ابتدا عضو کانال شوید، سپس عضویت را بررسی کنید.",kb([[{text:"📢 عضویت در کانال",url:"https://t.me/konfingMoji"}],[{text:"✅ بررسی عضویت",callback_data:"check"}]]));return false};
const findPlan=id=>{for(const type of Object.keys(PLANS)){const p=PLANS[type].find(x=>x[0]===id);if(p)return{type,p}}return null};
const typename=t=>t==="wireguard"?"وایرگارد":t==="gaming"?"گیمینگ":"وب";
const save=async(o)=>{if(DB)await DB.put("order:"+o.id,JSON.stringify(o),{expirationTtl:2592000})};
const get=async id=>{if(!DB)return null;let x=await DB.get("order:"+id);return x?JSON.parse(x):null};
const update=async(id,patch)=>{let o=await get(id);if(!o)return;Object.assign(o,patch);await save(o);return o};
const plans=t=>kb([...PLANS[t].map(p=>[{text:`${p[1]} — ${price(p[3])} تومان`,callback_data:`plan:${p[0]}`}]),[{text:"🔙 بازگشت",callback_data:"buy"}]]);
const payment=id=>kb([[{text:`💳 ${CARD_NUMBER}`,copy_text:{text:CARD_NUMBER}}],[{text:"📤 ارسال فیش پرداخت",callback_data:`receipt:${id}`}],[{text:"🔙 بازگشت",callback_data:"buy"}]]);
const support=()=>kb([[{text:"💬 @Mojttaba6",url:"https://t.me/Mojttaba6"}],[{text:"🔙 بازگشت به منوی اصلی",callback_data:"home"}]]);
const approve=id=>kb([[{text:"✅ قبول",callback_data:`approve:${id}`},{text:"❌ رد",callback_data:`reject:${id}`}]]);

async function cb(e,q){
 const u=q.from.id,c=q.message.chat.id,m=q.message.message_id,d=q.data;
 await tg(e,"answerCallbackQuery",{callback_query_id:q.id});
 if(d==="check"){if(await member(e,u))await tg(e,"editMessageText",{chat_id:c,message_id:m,text:"✅ عضویت تأیید شد.\n\nبه ربات خوش آمدید.",reply_markup:home(),parse_mode:"HTML"});else await tg(e,"answerCallbackQuery",{callback_query_id:q.id,text:"❌ هنوز عضو کانال نیستید.",show_alert:false});return}
 if(!(await gate(e,c,u)))return;
 if(d==="home"){return tg(e,"editMessageText",{chat_id:c,message_id:m,text:"🏠 <b>منوی اصلی</b>",reply_markup:home(),parse_mode:"HTML"})}
 if(d==="buy"){return tg(e,"editMessageText",{chat_id:c,message_id:m,text:"🛒 <b>خرید کانفیگ</b>\nنوع کانفیگ را انتخاب کنید:",reply_markup:buy(),parse_mode:"HTML"})}
 if(d==="support"){return tg(e,"editMessageText",{chat_id:c,message_id:m,text:"🎫 <b>پشتیبانی</b>\n\n@Mojttaba6",reply_markup:support(),parse_mode:"HTML"})}
 if(d.startsWith("type:")){let t=d.split(":")[1];return tg(e,"editMessageText",{chat_id:c,message_id:m,text:`📦 <b>${typename(t)}</b>\n\nحجم را انتخاب کنید:`,reply_markup:plans(t),parse_mode:"HTML"})}
 if(d.startsWith("plan:")){
  let f=findPlan(d.substring(5));if(!f)return;
  let id=`${u}-${Date.now()}`,o={id,userId:u,type:f.type,gb:f.p[2],price:f.p[3],status:"awaiting_receipt",createdAt:new Date().toISOString()};
  await save(o);
  return tg(e,"editMessageText",{chat_id:c,message_id:m,text:`🧾 <b>اطلاعات پرداخت</b>\n\nنوع: <b>${typename(f.type)}</b>\nحجم: <b>${f.p[2]} گیگ</b>\nمبلغ: <b>${price(f.p[3])} تومان</b>\n\n💳 کارت: <b>${CARD_NUMBER}</b>\n👤 به نام: <b>${CARD_NAME}</b>\n\nشماره کارت را با دکمه زیر کپی کنید و سپس فیش را ارسال کنید.`,reply_markup:payment(id),parse_mode:"HTML"})}
 if(d.startsWith("receipt:")){let id=d.substring(8),o=await get(id);if(o&&o.userId===u&&DB)await update(id,{status:"waiting_receipt_upload"});await send(e,c,"📤 عکس فیش پرداخت را همینجا ارسال کنید.");return}
 if(d.startsWith("approve:")||d.startsWith("reject:")){
  if(String(u)!==ADMIN_ID)return;
  let id=d.substring(d.indexOf(":")+1),o=await get(id);if(!o){await send(e,c,"⚠️ سفارش در KV پیدا نشد. ابتدا KV را به Worker متصل کنید.");return}
  if(d.startsWith("reject:")){await update(id,{status:"rejected"});await send(e,o.userId,"❌ فیش پرداخت شما رد شد.\nپشتیبانی: @Mojttaba6");return}
  await update(id,{status:"approved_waiting_config"});
  await send(e,o.userId,"✅ پرداخت شما تأیید شد.\n\n⏳ کانفیگ پس از ارسال ادمین برای شما فرستاده می‌شود.");
  return send(e,c,`📤 کانفیگ مشتری را به صورت Reply به همین پیام بفرستید.\n\n👤 مشتری: <code>${o.userId}</code>\n📦 ${typename(o.type)} — ${o.gb} گیگ`,null);
 }
}
async function msg(e,m){
 const c=m.chat.id,u=m.from?.id;if(!u)return;
 if(String(u)===ADMIN_ID&&m.reply_to_message){
  let x=(m.reply_to_message.text||"").match(/مشتری:\s*<code>(\d+)<\/code>/);
  if(x){await tg(e,"copyMessage",{chat_id:Number(x[1]),from_chat_id:c,message_id:m.message_id});await send(e,Number(x[1]),"📦 <b>کانفیگ شما آماده است.</b>");await send(e,c,"✅ کانفیگ برای مشتری ارسال شد.");return}
 }
 if(m.text==="/start"){if(await gate(e,c,u))await send(e,c,"سلام 👋\nبه <b>Konfig Moji</b> خوش آمدید.",home());return}
 if(!(await gate(e,c,u)))return;
 if(m.photo||m.document){
  await tg(e,"forwardMessage",{chat_id:ADMIN_ID,from_chat_id:c,message_id:m.message_id});
  if(DB){
   let l=await DB.list({prefix:"order:"});
   for(const k of l.keys){let o=await get(k.name.slice(6));if(o&&String(o.userId)===String(u)&&["awaiting_receipt","waiting_receipt_upload"].includes(o.status)){await tg(e,"sendMessage",{chat_id:ADMIN_ID,text:`🧾 <b>فیش پرداخت</b>\n👤 <code>${u}</code>\n📦 ${typename(o.type)} — ${o.gb} گیگ\n💰 ${price(o.price)} تومان`,parse_mode:"HTML",reply_markup:approve(o.id)});await update(o.id,{status:"receipt_received"});break}}
  }else await send(e,ADMIN_ID,"🧾 فیش دریافت شد؛ برای تأیید خودکار باید KV متصل باشد.");
  await send(e,c,"✅ فیش برای ادمین ارسال شد.");return
 }
 await send(e,c,"از منوی زیر انتخاب کنید:",home());
}
export default{async fetch(r,e){if(r.method==="GET")return new Response("Konfig Moji Bot is running ✅");if(r.method!=="POST")return new Response("Method Not Allowed",{status:405});try{let u=await r.json();if(u.callback_query)await cb(e,u.callback_query);else if(u.message)await msg(e,u.message)}catch(err){console.error(err)}return new Response("OK")}};
