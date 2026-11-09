(() => {
  'use strict';
  const cfg=window.PROCLEANING_PUBLIC_CONFIG||{};
  const connected=cfg.mode==='connected' && !!cfg.supabaseUrl && !!cfg.turnstileSiteKey;
  function update(){
    const th=document.documentElement.lang==='th';
    const v=th?{
      title:'คำขอเดียว เลขอ้างอิงเดียว',text:'ใช้ฟอร์มขอใบเสนอราคาเพียงหน้าเดียว เมื่อเปิดระบบเชื่อมต่อจริง ข้อมูลจะบันทึกเข้าฐานข้อมูลโดยตรง และจัดคิวส่งอีเมลตอบรับให้อัตโนมัติ ไม่เปิดแอป Mail',cta:'เริ่มขอใบเสนอราคา →',demo:'โหมดทดลองอยู่: ยังไม่มีการรับข้อมูลจากลูกค้าจริง'}:
      {title:'One request. One reference.',text:'Use one RFQ form. When connected, your details save directly to our system and the acknowledgement email is queued automatically—no Mail app.',cta:'Start a quotation request →',demo:'Demo mode: real customer intake is not yet connected.'};
    for(const [id,value] of [['pc-unified-title',v.title],['pc-unified-text',v.text],['pc-unified-cta',v.cta],['pc-unified-mode',connected?(th?'โหมดเชื่อมต่อ: ระบบ RFQ ออนไลน์':'Connected RFQ mode'):v.demo]]){
      const el=document.getElementById(id);if(el)el.textContent=value;
    }
  }
  update();document.addEventListener('DOMContentLoaded',update);document.querySelectorAll('[data-language]').forEach(x=>x.addEventListener('click',()=>setTimeout(update,0)));
})();
