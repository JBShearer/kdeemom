/* K'DEE MOM — GAME ENGINE (portrait 360x640 canvas) */
(function(){
var CW=360,CH=640,curRoom=0,keys=0,timer=780,inv=[],usedHS={},questItems={},paused=false,gameOver=false;
var kdeeHP=20,kdeeMaxHP=20;
var canvas=document.getElementById("scene"),ctx=canvas.getContext("2d");
var hotspots=makeHS();
var invEmoji={banana:"\uD83C\uDF4C",duck:"\uD83E\uDD86",bible:"\uD83D\uDCD6",flashlight:"\uD83D\uDD26",necronomicon:"\uD83D\uDCDA",shovel:"\u26CF\uFE0F",wrench:"\uD83D\uDD27",towel:"\uD83E\uDDF4",book:"\uD83D\uDCDA",tidepen:"\uD83E\uDDF4",phone:"\uD83D\uDCF1"};
var verbLabels={use:"\u270B USE",take:"\uD83E\uDD1A TAKE",talk:"\uD83D\uDCAC TALK",open:"\uD83D\uDCE6 OPEN",push:"\uD83D\uDC4A PUSH"};

/* K'Dee position & walking */
var kdeeX=180,kdeeY=560,kdeeTargetX=180,kdeeTargetY=560,kdeeWalking=false,walkSpeed=4;
var walkAnim=0,frameTick=0;

function drawKdee(c,x,y){
  var breathe=Math.sin(frameTick*0.04)*1;
  var bob=kdeeWalking?Math.sin(walkAnim*0.3)*2.5:breathe*0.5;
  var legOff=kdeeWalking?Math.sin(walkAnim*0.4)*4:0;
  var armOff=kdeeWalking?Math.sin(walkAnim*0.4)*3:0;

  // Shadow
  c.save();c.globalAlpha=0.18;c.fillStyle="#000";
  c.beginPath();c.ellipse(x,y+2,12,4,0,0,Math.PI*2);c.fill();c.restore();

  // Legs
  D(c,x-5+legOff,y-4+bob,5,6,"#4169E1");  // left leg
  D(c,x+1-legOff,y-4+bob,5,6,"#4169E1");  // right leg
  // Shoes
  D(c,x-6+legOff,y+1+bob,6,3,"#333");
  D(c,x+1-legOff,y+1+bob,6,3,"#333");

  // Body / shirt
  c.fillStyle=P.pink;
  c.beginPath();
  c.moveTo(x-8,y-14+bob);
  c.lineTo(x-9,y-4+bob);
  c.lineTo(x+9,y-4+bob);
  c.lineTo(x+8,y-14+bob);
  c.closePath();c.fill();
  // Shirt detail
  D(c,x-1,y-12+bob,2,8,"#FF85C8");

  // Skirt / jeans
  D(c,x-8,y-6+bob,16,5,"#4169E1");

  // Arms
  D(c,x-11,y-14+bob-armOff,4,10,P.pink);  // left arm
  D(c,x+7,y-14+bob+armOff,4,10,P.pink);   // right arm
  // Hands
  c.fillStyle=P.skin;
  c.beginPath();c.arc(x-9,y-4+bob-armOff,2.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(x+9,y-4+bob+armOff,2.5,0,Math.PI*2);c.fill();

  // Head
  c.fillStyle=P.skin;
  c.beginPath();c.arc(x,y-22+bob,10,0,Math.PI*2);c.fill();

  // Hair
  c.fillStyle=P.hair;
  c.beginPath();c.arc(x,y-27+bob,10,Math.PI,2*Math.PI);c.fill();
  D(c,x-10,y-26+bob,5,10,P.hair); // left hair
  D(c,x+5,y-26+bob,5,10,P.hair);  // right hair
  // Hair highlight
  c.fillStyle="rgba(255,255,200,0.25)";
  c.beginPath();c.arc(x+3,y-28+bob,4,0,Math.PI*2);c.fill();

  // Eyes
  c.fillStyle="#fff";
  c.fillRect(x-5,y-23+bob,4,3);c.fillRect(x+1,y-23+bob,4,3);
  c.fillStyle=P.eye;
  c.fillRect(x-4,y-22+bob,2,2);c.fillRect(x+2,y-22+bob,2,2);
  // Eye sparkle
  c.fillStyle="#fff";c.fillRect(x-4,y-23+bob,1,1);c.fillRect(x+2,y-23+bob,1,1);

  // Mouth (smile)
  c.strokeStyle=P.pink;c.lineWidth=1;
  c.beginPath();c.arc(x,y-17+bob,3,0.1*Math.PI,0.9*Math.PI);c.stroke();
}

function updateWalk(){
  if(!kdeeWalking)return;
  walkAnim++;
  var spd=kdeeHP<=0?Math.max(1,walkSpeed+kdeeHP*0.3):kdeeHP<5?3:walkSpeed;
  var dx=kdeeTargetX-kdeeX,dy=kdeeTargetY-kdeeY;
  var dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<spd+1){kdeeX=kdeeTargetX;kdeeY=kdeeTargetY;kdeeWalking=false;walkAnim=0;return;}
  kdeeX+=dx/dist*spd;kdeeY+=dy/dist*spd;
}

function walkTo(tx,ty,cb){
  kdeeTargetX=Math.max(20,Math.min(340,tx));
  kdeeTargetY=Math.max(480,Math.min(600,ty));
  kdeeWalking=true;
  if(cb){var check=setInterval(function(){if(!kdeeWalking){clearInterval(check);cb();}},50);}
}

/* Draw glowing navigation arrows with labels */
function drawNavArrows(c){
  var hs=hotspots[curRoom]||[];
  var pulse=0.5+0.5*Math.sin(frameTick*0.06);
  hs.forEach(function(h){
    if(!h.open||h.open.indexOf("goto:")!==0)return;
    var cx=h.x+h.w/2,cy=h.y+h.h/2;
    var isLeft=h.x<20,isRight=h.x>320,isTop=h.y<40,isBottom=h.y>580;
    c.save();c.globalAlpha=0.6+0.4*pulse;

    if(isLeft){
      // Left door indicator
      c.fillStyle="rgba(255,215,0,"+0.12*pulse+")";c.fillRect(0,cy-25,18,50);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(12,cy-12);c.lineTo(2,cy);c.lineTo(12,cy+12);c.closePath();c.fill();
      c.font="bold 7px monospace";c.textAlign="center";c.fillText(h.name.substring(0,8),9,cy+24);c.textAlign="left";
    } else if(isRight){
      c.fillStyle="rgba(255,215,0,"+0.12*pulse+")";c.fillRect(342,cy-25,18,50);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(348,cy-12);c.lineTo(358,cy);c.lineTo(348,cy+12);c.closePath();c.fill();
      c.font="bold 7px monospace";c.textAlign="center";c.fillText(h.name.substring(0,8),351,cy+24);c.textAlign="left";
    } else if(isTop){
      c.fillStyle="rgba(255,215,0,"+0.12*pulse+")";c.fillRect(cx-25,0,50,16);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(cx-10,12);c.lineTo(cx,2);c.lineTo(cx+10,12);c.closePath();c.fill();
    } else if(isBottom){
      c.fillStyle="rgba(255,215,0,"+0.12*pulse+")";c.fillRect(cx-25,624,50,16);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(cx-10,628);c.lineTo(cx,638);c.lineTo(cx+10,628);c.closePath();c.fill();
    } else {
      // Interior door — archway label
      c.fillStyle="rgba(255,215,0,"+0.25*pulse+")";
      c.beginPath();c.arc(cx,h.y+h.h,h.w/2+4,Math.PI,2*Math.PI);c.rect(cx-h.w/2-4,h.y+h.h,h.w+8,6);c.fill();
      c.fillStyle=P.gold;c.font="bold 8px monospace";c.textAlign="center";
      c.fillText("\u25B6 "+h.name,cx,h.y+h.h+16);c.textAlign="left";
    }
    c.restore();
  });
}

function drawHoverHighlights(c){
  var hs=hotspots[curRoom]||[];
  var pulse=0.5+0.5*Math.sin(frameTick*0.08);
  hs.forEach(function(h){
    if(!h._hover)return;
    // Soft glow outline
    c.save();
    c.shadowColor="rgba(255,215,0,0.6)";c.shadowBlur=8;
    c.strokeStyle="rgba(255,215,0,"+(0.4+0.3*pulse)+")";
    c.lineWidth=2;
    c.beginPath();
    var r=3;var hx=h.x-2,hy=h.y-2,hw=h.w+4,hh=h.h+4;
    c.moveTo(hx+r,hy);c.lineTo(hx+hw-r,hy);c.quadraticCurveTo(hx+hw,hy,hx+hw,hy+r);
    c.lineTo(hx+hw,hy+hh-r);c.quadraticCurveTo(hx+hw,hy+hh,hx+hw-r,hy+hh);
    c.lineTo(hx+r,hy+hh);c.quadraticCurveTo(hx,hy+hh,hx,hy+hh-r);
    c.lineTo(hx,hy+r);c.quadraticCurveTo(hx,hy,hx+r,hy);
    c.closePath();c.stroke();
    c.restore();

    // Tooltip label above object
    if(!isDoor(h)){
      var tx=h.x+h.w/2,ty=h.y-8;
      c.font="bold 8px monospace";
      var tw=c.measureText(h.name).width+8;
      c.fillStyle="rgba(0,0,0,0.7)";
      c.beginPath();
      var bx=tx-tw/2,by=ty-10;
      c.moveTo(bx+2,by);c.lineTo(bx+tw-2,by);c.quadraticCurveTo(bx+tw,by,bx+tw,by+2);
      c.lineTo(bx+tw,by+11);c.quadraticCurveTo(bx+tw,by+13,bx+tw-2,by+13);
      c.lineTo(bx+2,by+13);c.quadraticCurveTo(bx,by+13,bx,by+11);
      c.lineTo(bx,by+2);c.quadraticCurveTo(bx,by,bx+2,by);
      c.closePath();c.fill();
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(h.name,tx,ty-1);c.textAlign="left";
    }
  });
}

/* Vignette overlay for depth */
function drawVignette(c){
  var grd=c.createRadialGradient(CW/2,CH/2,CH*0.25,CW/2,CH/2,CH*0.7);
  grd.addColorStop(0,"rgba(0,0,0,0)");
  grd.addColorStop(1,"rgba(0,0,0,0.35)");
  c.fillStyle=grd;c.fillRect(0,0,CW,CH);
}

/* Ambient particles per room */
var particles=[];
function spawnParticles(roomIdx){
  particles=[];
  var type=null;
  if(roomIdx===8||roomIdx===12)type="dust";      // Attic, Gym
  if(roomIdx===4)type="steam";                     // Bathroom
  if(roomIdx===10)type="sparkle";                  // Jesus Bathroom
  if(roomIdx===11)type="ember";                    // Basement
  if(!type)return;
  for(var i=0;i<18;i++){
    particles.push({x:Math.random()*CW,y:Math.random()*CH*0.6,vx:(Math.random()-0.5)*0.3,vy:-0.2-Math.random()*0.4,life:Math.random()*120+60,maxLife:180,type:type,size:1+Math.random()*2});
  }
}
function drawParticles(c){
  particles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;p.life--;
    if(p.life<=0){p.x=Math.random()*CW;p.y=CH*0.6;p.life=p.maxLife;p.vy=-0.2-Math.random()*0.4;}
    var alpha=Math.min(1,p.life/30)*0.4;
    c.save();c.globalAlpha=alpha;
    if(p.type==="dust"){c.fillStyle="#c9a56c";}
    else if(p.type==="steam"){c.fillStyle="#ddeeff";}
    else if(p.type==="sparkle"){c.fillStyle="#FFD700";}
    else if(p.type==="ember"){c.fillStyle="#FF4500";}
    c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill();
    c.restore();
  });
}

/* Room transition fade */
var fadeAlpha=0,fadeDir=0,fadeCb=null;
function fadeToRoom(roomIdx){
  fadeDir=1;fadeCb=function(){
    curRoom=roomIdx;
    kdeeX=180;kdeeY=560;kdeeTargetX=180;kdeeTargetY=560;kdeeWalking=false;
    spawnParticles(curRoom);
    updateHUD();setDesc("Entered "+ROOMS[curRoom].name);
    fadeDir=-1;
    checkBattle(roomIdx);
  };
}

function drawScene(){
  ctx.clearRect(0,0,CW,CH);
  var room=ROOMS[curRoom];
  if(room&&room.bg)room.bg(ctx);
  drawVignette(ctx);
  drawParticles(ctx);
  drawNavArrows(ctx);
  drawKdee(ctx,Math.round(kdeeX),Math.round(kdeeY));
  drawHoverHighlights(ctx);

  // Tap flash feedback
  if(tapFlash){
    ctx.save();ctx.globalAlpha=tapFlash.t/8*0.5;
    ctx.strokeStyle=P.gold;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(tapFlash.x,tapFlash.y,12-tapFlash.t,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    tapFlash.t--;if(tapFlash.t<=0)tapFlash=null;
  }

  ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,0,CW,22);
  ctx.fillStyle=P.gold;ctx.font="bold 10px monospace";ctx.textAlign="center";
  ctx.fillText(room.name,CW/2,15);ctx.textAlign="left";

  // Fade overlay
  if(fadeDir!==0){
    fadeAlpha+=fadeDir*0.06;
    if(fadeAlpha>=1){fadeAlpha=1;if(fadeCb){fadeCb();fadeCb=null;}}
    if(fadeAlpha<=0){fadeAlpha=0;fadeDir=0;}
    ctx.fillStyle="rgba(0,0,0,"+fadeAlpha+")";ctx.fillRect(0,0,CW,CH);
  }
}

var animRunning=false;
function gameLoop(){if(!animRunning)return;frameTick++;if(battleActive){updateBattle();drawBattle(ctx);}else if(miniActive){updateCatchGame();drawCatchGame(ctx);}else{updateWalk();drawScene();}requestAnimationFrame(gameLoop);}
function startLoop(){if(!animRunning){animRunning=true;gameLoop();}}

function updateHUD(){
  document.getElementById("hk").textContent="\uD83D\uDD11 KEYS: "+keys+"/3";
  document.getElementById("hr").textContent=ROOMS[curRoom].name;
  var m=Math.floor(timer/60),s=timer%60;
  document.getElementById("hs").textContent="\u23F0 "+m+":"+(s<10?"0":"")+s;
  var hpEl=document.getElementById("hhp");
  if(hpEl)hpEl.textContent="\u2764 "+kdeeHP+"/"+kdeeMaxHP;
}

function setDesc(t){document.getElementById("desc-text").textContent=t;}

/* --- PROGRESSIVE INTERACTION DIALOG --- */
/* Click → walk → dialog with LOOK text + verb buttons. Each verb reveals its response. */
var activeHS=null;
var verbColors={use:"#00CED1",take:"#FFD700",talk:"#FF69B4",open:"#FF8C00",push:"#CD5C5C"};

function showInteraction(h){
  activeHS=h;
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  // Force animation replay
  d.classList.remove("on");inner.style.animation="none";
  void d.offsetHeight; // reflow
  inner.style.animation="";d.classList.add("on");

  document.getElementById("dlg-portrait").textContent="\uD83D\uDC69";
  document.getElementById("dlg-portrait").style.borderColor="#FF69B4";
  document.getElementById("dlg-name").textContent=h.name;

  // Always show LOOK description first
  typeText(document.getElementById("dlg-text"),h.look||"Hmm... nothing special.");

  // Build verb buttons for all available actions
  buildVerbButtons(h);
  paused=true;
}

function buildVerbButtons(h){
  var choices=document.getElementById("dlg-choices");
  choices.innerHTML="";
  var verbs=["use","take","talk","open","push"];
  var hasAny=false;
  verbs.forEach(function(v){
    if(!h[v])return;
    if(v==="open"&&h.open&&h.open.indexOf("goto:")===0)return;
    hasAny=true;
    var uid=curRoom+"_"+h.id+"_"+v;
    var btn=document.createElement("div");
    btn.className="dlg-ch";
    btn.setAttribute("data-verb",v);
    var label=verbLabels[v]||v.toUpperCase();
    var color=verbColors[v]||"#FFD700";

    if(usedHS[uid]){
      btn.textContent=label+" \u2713";
      btn.style.opacity="0.35";
      btn.style.borderColor="rgba(255,255,255,0.1)";
      btn.style.color="#888";
    } else {
      btn.textContent=label;
      btn.style.borderColor=color;
      btn.style.color=color;
    }
    btn.addEventListener("click",function(e){
      e.stopPropagation();
      performAction(h,v);
    });
    choices.appendChild(btn);
  });
  // Show continue prompt if no actions available
  document.getElementById("dlg-continue").style.display=hasAny?"none":"";
}

function performAction(h,v){
  var uid=curRoom+"_"+h.id+"_"+v;
  var txt=h[v];
  if(!txt)return;

  // Already done
  if(usedHS[uid]){
    typeText(document.getElementById("dlg-text"),"Already did that.");
    return;
  }

  // Determine the key verb for this hotspot
  var keyVerb=null;
  if(h.hasKey){
    var kv=["push","open","use"];
    for(var i=0;i<kv.length;i++){if(h[kv[i]]){keyVerb=kv[i];break;}}
  }

  // Key discovery
  if(h.hasKey&&v===keyVerb){
    keys++;usedHS[uid]=true;
    document.getElementById("dlg-portrait").textContent="\uD83D\uDD11";
    document.getElementById("dlg-portrait").style.borderColor="#FFD700";
    typeText(document.getElementById("dlg-text"),txt+"\n\n\uD83D\uDD11 KEY FOUND! ("+keys+"/3)");
    buildVerbButtons(h);
    updateHUD();
    if(keys>=3)setTimeout(function(){winGame();},1500);
    return;
  }

  // Quest item pickup
  if(h.quest&&v==="take"){
    inv.push(h.quest);usedHS[uid]=true;
    questItems[h.quest]=true;
    document.getElementById("dlg-portrait").textContent=invEmoji[h.quest]||"\uD83C\uDF81";
    document.getElementById("dlg-portrait").style.borderColor="#00CED1";
    typeText(document.getElementById("dlg-text"),txt||("Picked up "+h.quest+"!"));
    buildVerbButtons(h);
    updateInv();
    return;
  }

  // Non-quest take (generic collectible)
  if(v==="take"&&!h.quest){
    usedHS[uid]=true;
    var itemName=h.id;
    inv.push(itemName);
    invEmoji[itemName]=invEmoji[itemName]||"\uD83D\uDCE6";
    document.getElementById("dlg-portrait").textContent=invEmoji[itemName];
    document.getElementById("dlg-portrait").style.borderColor="#FFD700";
    typeText(document.getElementById("dlg-text"),txt);
    buildVerbButtons(h);
    updateInv();
    return;
  }

  // Mini-game trigger: kitchen cabinets
  if(h.id==="cab"&&v==="open"&&!usedHS[uid]){
    usedHS[uid]=true;
    hideDlg();
    startCatchGame();
    return;
  }

  // Regular action
  usedHS[uid]=true;
  typeText(document.getElementById("dlg-text"),txt);
  buildVerbButtons(h);
}

/* Typewriter text effect */
var typeTimer=null;
function typeText(el,text){
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  el.textContent="";
  var i=0;
  typeTimer=setInterval(function(){
    if(i>=text.length){clearInterval(typeTimer);typeTimer=null;return;}
    el.textContent+=text.charAt(i);
    i++;
  },18);
  // Click to skip
  el._skipHandler=function(){
    if(typeTimer){clearInterval(typeTimer);typeTimer=null;el.textContent=text;}
    el.removeEventListener("click",el._skipHandler);
  };
  el.addEventListener("click",el._skipHandler);
}

function showSimpleDlg(name,text,emoji){
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void d.offsetHeight;inner.style.animation="";d.classList.add("on");
  document.getElementById("dlg-portrait").textContent=emoji||"\uD83D\uDC69";
  document.getElementById("dlg-name").textContent=name;
  document.getElementById("dlg-text").textContent=text;
  document.getElementById("dlg-choices").innerHTML="";
  paused=true;
}

function hideDlg(){
  if(gameOver)return; // Don't dismiss win/lose dialogs
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  document.getElementById("dlg").classList.remove("on");
  document.getElementById("dlg-continue").style.display="";
  document.getElementById("dlg-portrait").style.borderColor="#FFD700";
  activeHS=null;paused=false;
}

function goToRoom(roomIdx){
  fadeToRoom(roomIdx);
}

function navigateToRoom(h){
  var targetRoom=parseInt(h.open.split(":")[1]);
  var doorX=h.x+h.w/2,doorY=Math.max(480,Math.min(600,h.y+h.h));
  setDesc("Going to "+h.name+"...");
  walkTo(doorX,doorY,function(){goToRoom(targetRoom);});
}

function isDoor(h){return h.open&&h.open.indexOf("goto:")===0;}

/* Click an object → walk to it → show interaction dialog */
function interactWith(h){
  if(isDoor(h)){navigateToRoom(h);return;}
  var hx=h.x+h.w/2,hy=Math.max(480,Math.min(600,h.y+h.h+20));
  setDesc(h.name+"...");
  walkTo(hx,hy,function(){showInteraction(h);});
}

/* --- FULL INVENTORY SYSTEM --- */
var invDetails={
  banana:{emoji:"\uD83C\uDF4C",name:"Banana",desc:"A perfectly ripe banana. For scale, obviously."},
  duck:{emoji:"\uD83E\uDD86",name:"General Quackers",desc:"Leader of the rubber duck army. Seen things. Won't talk about it."},
  bible:{emoji:"\uD83D\uDCD6",name:"Bible",desc:"Proverbs 31. Divine guidance for finding lost keys. (Results may vary.)"},
  flashlight:{emoji:"\uD83D\uDD26",name:"Flashlight",desc:"Found at the workbench. Batteries at 12%. Classic."},
  necronomicon:{emoji:"\uD83D\uDCDA",name:"Necronomicon",desc:"It whispers. Mostly complaints. Do NOT read aloud at bedtime."},
  shovel:{emoji:"\u26CF\uFE0F",name:"Shovel",desc:"From the shed. The dog is VERY interested in this."},
  wrench:{emoji:"\uD83D\uDD27",name:"Wrench",desc:"A sturdy wrench. Opens things that shouldn't be opened."},
  towel:{emoji:"\uD83E\uDDF4",name:"Towel",desc:"Seen better days. Mostly decorative at this point."},
  book:{emoji:"\uD83D\uDCDA",name:"Parenting Book",desc:"'Parenting Without Losing Your Mind.' Chapter 1: Too late."},
  tidepen:{emoji:"\uD83E\uDDF4",name:"Tide Pen",desc:"For stain emergencies. Which is every day."},
  phone:{emoji:"\uD83D\uDCF1",name:"K'Dee's Phone",desc:"47 unread texts. 3 missed calls from 'Mom.' Battery at 8%. 214 photos of the kids. One good selfie."},
  bookshelf:{emoji:"\uD83D\uDCDA",name:"Parenting Book",desc:"'Parenting Without Losing Your Mind.' Still on chapter 1."},
  tools:{emoji:"\uD83D\uDD27",name:"Wrench",desc:"Heavy duty. Good for opening stubborn trunks."},
  shelf:{emoji:"\uD83E\uDDF4",name:"Tide Pen",desc:"Almost empty. Story of K'Dee's life."},
  flowers:{emoji:"\uD83C\uDF3A",name:"Flowers",desc:"A self-care purchase. Smells like lavender and victory."},
  drinks:{emoji:"\uD83E\uDD64",name:"Energy Drinks",desc:"Confiscated from Greyson. Three empty cans. Gross."},
  beds:{emoji:"\uD83C\uDF3F",name:"Fresh Herbs",desc:"Rosemary and basil. Tonight's dinner is going to be great."},
  fthermo:{emoji:"\uD83C\uDF21\uFE0F",name:"Thermometer",desc:"102.3. Poor Forest. Sending healing vibes."},
  dumbbells:{emoji:"\uD83C\uDFCB\uFE0F",name:"Dumbbell",desc:"Almost lifted one. Almost."}
};

function updateInv(){
  var bc=document.getElementById("bag-count");
  bc.textContent=inv.length>0?("("+inv.length+")"):"";
}

function showInv(){
  var screen=document.getElementById("inv-screen");
  screen.classList.add("on");
  var grid=document.getElementById("inv-grid");
  var empty=document.getElementById("inv-empty");
  var detail=document.getElementById("inv-detail");
  grid.innerHTML="";detail.classList.remove("on");
  if(inv.length===0){empty.style.display="block";return;}
  empty.style.display="none";
  inv.forEach(function(it,idx){
    var info=invDetails[it]||{emoji:invEmoji[it]||"\u2753",name:it,desc:"A mysterious item."};
    var cell=document.createElement("div");cell.className="inv-cell";
    cell.innerHTML='<div class="inv-cell-emoji">'+info.emoji+'</div><div class="inv-cell-name">'+info.name+'</div>';
    cell.addEventListener("click",function(){
      // Deselect others
      var all=grid.querySelectorAll(".inv-cell");
      for(var j=0;j<all.length;j++)all[j].classList.remove("selected");
      cell.classList.add("selected");
      document.getElementById("inv-detail-emoji").textContent=info.emoji;
      document.getElementById("inv-detail-name").textContent=info.name;
      document.getElementById("inv-detail-desc").textContent=info.desc;
      detail.classList.add("on");
    });
    grid.appendChild(cell);
  });
}

function hideInv(){document.getElementById("inv-screen").classList.remove("on");}
document.getElementById("bagbtn").addEventListener("click",function(){
  if(document.getElementById("inv-screen").classList.contains("on")){hideInv();}else{showInv();}
});
document.getElementById("inv-close").addEventListener("click",hideInv);

/* --- CATCH MINI-GAME --- */
/* Kitchen cabinet avalanche: catch falling Tupperware! */
var miniActive=false,miniScore=0,miniTimer=0,miniCatcher=0,miniItems=[],miniMaxTime=360;
var catchEmojis=["\uD83E\uDD63","\uD83C\uDF72","\uD83E\uDD62","\uD83C\uDF5C","\uD83E\uDD64","\uD83C\uDF75","\uD83C\uDF56","\uD83E\uDDC1","\uD83C\uDF6A","\uD83E\uDDC0"];
var catchColors=["#e74c3c","#3498db","#2ecc71","#FFD700","#9b59b6","#FF8C00","#FF69B4","#00CED1","#CD5C5C","#90EE90"];

function startCatchGame(){
  miniActive=true;miniScore=0;miniTimer=0;miniItems=[];miniCatcher=CW/2;
  paused=true;
  // Spawn initial items
  for(var i=0;i<3;i++) spawnCatchItem();
}

function spawnCatchItem(){
  var idx=Math.floor(Math.random()*catchEmojis.length);
  miniItems.push({
    x:30+Math.random()*(CW-60),
    y:-20-Math.random()*60,
    vy:1.5+Math.random()*1.5+miniTimer*0.003,
    emoji:catchEmojis[idx],
    color:catchColors[idx],
    w:24,h:24,
    caught:false,missed:false
  });
}

function drawCatchGame(c){
  // Background
  c.fillStyle="#f5e6d3";c.fillRect(0,0,CW,CH);
  // Cabinets at top
  for(var i=0;i<4;i++){
    D(c,10+i*87,10,78,55,P.dbrown);D(c,14+i*87,14,70,47,P.brown);
    // Open door effect
    D(c,14+i*87,14,70,47,"rgba(0,0,0,0.3)");
  }
  c.fillStyle="#654321";c.font="bold 12px monospace";c.textAlign="center";
  c.fillText("CATCH THE TUPPERWARE!",CW/2,85);
  c.fillStyle="#888";c.font="9px monospace";
  c.fillText("Move mouse/touch to catch",CW/2,100);c.textAlign="left";

  // Score & timer bar
  var timeLeft=Math.max(0,1-miniTimer/miniMaxTime);
  D(c,20,110,CW-40,8,"#333");
  D(c,20,110,Math.floor((CW-40)*timeLeft),8,timeLeft>0.3?"#2ecc71":"#e74c3c");
  c.fillStyle=P.gold;c.font="bold 10px monospace";c.textAlign="center";
  c.fillText("CAUGHT: "+miniScore,CW/2,135);c.textAlign="left";

  // Falling items
  miniItems.forEach(function(item){
    if(item.caught||item.missed)return;
    c.font="20px serif";c.textAlign="center";
    c.fillText(item.emoji,item.x,item.y+20);
    // Shadow
    c.save();c.globalAlpha=0.1;c.fillStyle="#000";
    c.beginPath();c.ellipse(item.x,item.y+28,12,3,0,0,Math.PI*2);c.fill();c.restore();
    c.textAlign="left";
  });

  // Catcher (K'Dee's hands / basket)
  var cy=CH-80;
  // Basket
  c.fillStyle="#8B4513";
  c.beginPath();
  c.moveTo(miniCatcher-28,cy);c.lineTo(miniCatcher-22,cy+24);
  c.lineTo(miniCatcher+22,cy+24);c.lineTo(miniCatcher+28,cy);
  c.closePath();c.fill();
  c.fillStyle="#A0522D";
  c.beginPath();
  c.moveTo(miniCatcher-24,cy+4);c.lineTo(miniCatcher-19,cy+20);
  c.lineTo(miniCatcher+19,cy+20);c.lineTo(miniCatcher+24,cy+4);
  c.closePath();c.fill();
  // Weave lines
  c.strokeStyle="rgba(0,0,0,0.15)";c.lineWidth=1;
  for(var w=-16;w<=16;w+=8){
    c.beginPath();c.moveTo(miniCatcher+w,cy+2);c.lineTo(miniCatcher+w*0.8,cy+22);c.stroke();
  }
  // K'Dee mini
  c.fillStyle=P.skin;c.beginPath();c.arc(miniCatcher,cy-18,8,0,Math.PI*2);c.fill();
  c.fillStyle=P.hair;c.beginPath();c.arc(miniCatcher,cy-23,8,Math.PI,2*Math.PI);c.fill();
  c.fillStyle=P.eye;c.fillRect(miniCatcher-3,cy-19,2,2);c.fillRect(miniCatcher+1,cy-19,2,2);
  D(c,miniCatcher-6,cy-10,12,12,P.pink);

  // Caught flash
  miniItems.forEach(function(item){
    if(item.caught&&item.flash>0){
      c.save();c.globalAlpha=item.flash/10;
      c.fillStyle=P.gold;c.font="bold 14px monospace";c.textAlign="center";
      c.fillText("+1",item.cx,item.cy-10);
      c.textAlign="left";c.restore();
      item.flash--;
    }
  });
}

function updateCatchGame(){
  miniTimer++;
  // Spawn new items
  if(miniTimer%30===0)spawnCatchItem();
  if(miniTimer%60===0&&miniTimer<240)spawnCatchItem(); // extra in second half

  var catchY=CH-80;
  miniItems.forEach(function(item){
    if(item.caught||item.missed)return;
    item.y+=item.vy;
    // Check catch
    if(item.y+20>=catchY&&item.y+20<=catchY+28&&Math.abs(item.x-miniCatcher)<30){
      item.caught=true;item.flash=10;item.cx=item.x;item.cy=catchY;
      miniScore++;
    }
    // Missed
    if(item.y>CH+20)item.missed=true;
  });

  // End
  if(miniTimer>=miniMaxTime){
    miniActive=false;paused=false;
    var msg="";
    if(miniScore>=10)msg="K'Dee caught "+miniScore+" containers! Legendary reflexes! Found a hidden sippy cup too!";
    else if(miniScore>=5)msg="K'Dee caught "+miniScore+" containers! Not bad for 8 AM!";
    else msg="K'Dee caught "+miniScore+" containers. The floor got the rest. Classic Tuesday.";
    showSimpleDlg("AVALANCHE!",msg,"\uD83E\uDD63");
  }
}

// Mouse/touch control for mini-game
canvas.addEventListener("mousemove",function(e){
  if(!miniActive)return;
  var p=getCanvasCoords(e);
  miniCatcher=Math.max(30,Math.min(CW-30,p.x));
});

function getCanvasCoords(e){
  var r=canvas.getBoundingClientRect();
  var sx=CW/r.width,sy=CH/r.height;
  var cx,cy;
  if(e.touches){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}
  else{cx=e.clientX;cy=e.clientY;}
  return{x:(cx-r.left)*sx,y:(cy-r.top)*sy};
}

function findHS(mx,my){
  var hs=hotspots[curRoom]||[];
  for(var i=hs.length-1;i>=0;i--){var h=hs[i];if(isDoor(h))continue;if(mx>=h.x&&mx<=h.x+h.w&&my>=h.y&&my<=h.y+h.h)return h;}
  for(var i=hs.length-1;i>=0;i--){
    var h=hs[i];if(!isDoor(h))continue;
    var ex=h.x,ey=h.y,ew=h.w,eh=h.h;
    if(h.x<20){ex=0;ew=Math.max(h.w,40);}
    if(h.x>300){ex=Math.min(h.x,320);ew=360-ex;}
    if(h.y<40){ey=0;eh=Math.max(h.h,50);}
    if(h.y+h.h>600){eh=640-h.y;}
    if(mx>=ex&&mx<=ex+ew&&my>=ey&&my<=ey+eh)return h;
  }
  return null;
}

canvas.addEventListener("click",function(e){
  if(battleActive){var p=getCanvasCoords(e);battleClick(p.x,p.y);return;}
  if(paused||gameOver)return;
  var p=getCanvasCoords(e);var h=findHS(p.x,p.y);
  if(h){interactWith(h);}else{walkTo(p.x,p.y);setDesc("Nothing interesting there.");}
});

/* Touch: long-press shows tooltip, short tap interacts */
var touchTimer=null,touchStart=null,tapFlash=null;
canvas.addEventListener("touchstart",function(e){
  e.preventDefault();
  if(battleActive){var p=getCanvasCoords(e);battleClick(p.x,p.y);return;}
  if(miniActive){var p=getCanvasCoords(e);miniCatcher=Math.max(30,Math.min(CW-30,p.x));return;}
  if(paused||gameOver)return;
  var p=getCanvasCoords(e);
  touchStart={x:p.x,y:p.y,time:Date.now()};
  // Long-press: after 300ms show tooltip
  touchTimer=setTimeout(function(){
    var h=findHS(p.x,p.y);
    if(h){
      // Set hover for visual feedback
      var hs=hotspots[curRoom]||[];hs.forEach(function(hh){hh._hover=false;});
      h._hover=true;
      if(isDoor(h)){setDesc("\u25B6 Go to "+h.name);}else{setDesc("\uD83D\uDC41 "+h.name);}
      // Clear after 1.5s
      setTimeout(function(){h._hover=false;setDesc("What should K'Dee do?");},1500);
    }
    touchTimer=null;touchStart=null;
  },300);
},{passive:false});
canvas.addEventListener("touchmove",function(e){
  if(miniActive){e.preventDefault();var t=e.touches[0];var r=canvas.getBoundingClientRect();miniCatcher=Math.max(30,Math.min(CW-30,(t.clientX-r.left)*(CW/r.width)));}
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!touchStart)return;
  var elapsed=Date.now()-touchStart.time;
  if(touchTimer){clearTimeout(touchTimer);touchTimer=null;}
  if(elapsed<300&&!paused&&!gameOver){
    // Short tap: interact
    var p=touchStart;
    var h=findHS(p.x,p.y);
    // Tap flash
    tapFlash={x:p.x,y:p.y,t:8};
    if(h){interactWith(h);}else{walkTo(p.x,p.y);setDesc("Nothing interesting there.");}
  }
  touchStart=null;
},{passive:false});

canvas.addEventListener("mousemove",function(e){
  if(miniActive||battleActive)return; // handled by other listeners
  var p=getCanvasCoords(e);var hs=hotspots[curRoom]||[];var found=null;
  hs.forEach(function(h){h._hover=false;if(p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h){found=h;h._hover=true;}});
  if(found){if(isDoor(found)){setDesc("\u25B6 Go to "+found.name);}else{setDesc("\uD83D\uDC41 "+found.name);}canvas.style.cursor="pointer";}
  else{setDesc("What should K'Dee do?");canvas.style.cursor="crosshair";}
});

document.getElementById("dlg-continue").addEventListener("click",hideDlg);
document.getElementById("dlg").addEventListener("click",function(e){if(e.target===document.getElementById("dlg")||e.target===document.getElementById("dlg-inner"))hideDlg();});

/* --- TURN-BASED BATTLE SYSTEM --- */
var battleActive=false,battleDone={},battleState=null;

var FIGHTERS={
  milo:{
    name:"MILO",emoji:"\uD83D\uDE4B",hp:8,maxHp:8,
    hair:"#654321",hairStyle:"shaggy",skin:P.skin,shirt:"#3498db",short:true,
    attacks:[
      {name:"CHATTER",dmg:0,msg:"Milo talks about his day at school. It's... VERY detailed."},
      {name:"SHOW DRAWING",dmg:1,msg:"Milo shows K'Dee a drawing. It's beautiful. She loses focus."},
      {name:"HUG LEGS",dmg:1,msg:"Milo hugs K'Dee's legs. She can't move!"},
      {name:"'BUT MOM...'",dmg:2,msg:"Milo says 'But MOM' in that tone. Critical emotional damage!"}
    ],
    intro:"Milo blocks the doorway!\n'MOM! Mom. Mom. Mommy. MOMMM!'",
    defeat:"Milo finishes his story about a caterpillar he saw at recess.\n'OK bye mom!' He runs off.",
    itemEffects:{banana:{dmg:3,msg:"K'Dee hands Milo the banana. He's THRILLED. Distracted!"},duck:{dmg:4,msg:"K'Dee gives Milo Gen. Quackers. He immediately starts playing!"}}
  },
  holly:{
    name:"HOLLY",emoji:"\uD83E\uDD17",hp:10,maxHp:10,
    hair:"#654321",hairStyle:"long",skin:P.skin,shirt:"#DDA0DD",tall:true,
    attacks:[
      {name:"FLYING HUG",dmg:3,msg:"Holly launches for a hug and COMPLETELY flattens K'Dee."},
      {name:"TRIP & FALL",dmg:2,msg:"Holly trips over her own feet and lands on K'Dee. Again."},
      {name:"SQUEEZE",dmg:1,msg:"Holly hugs so tight K'Dee's ribs creak."},
      {name:"TACKLE LOVE",dmg:2,msg:"Holly runs at K'Dee with arms wide open. Nowhere to hide!"}
    ],
    intro:"Holly spots K'Dee from across the room.\n'MOMMYYYY!' She starts running. Oh no.",
    defeat:"Holly finally lands a hug that doesn't cause injury.\n'Love you mom!' She cartwheels away.",
    itemEffects:{towel:{dmg:4,msg:"K'Dee throws towel like a matador. Holly hugs the towel instead!"},book:{dmg:3,msg:"K'Dee reads aloud. Holly sits down to listen. Crisis averted!"}}
  },
  greyson:{
    name:"GREYSON",emoji:"\uD83E\uDDD4",hp:12,maxHp:12,
    hair:"#1a1a1a",hairStyle:"dark",moustache:true,skin:P.skin,shirt:"#111",
    attacks:[
      {name:"PHILOSOPHIZE",dmg:1,msg:"'Mom, do we really CHOOSE to find keys, or do keys find US?'"},
      {name:"EXISTENTIAL Q",dmg:2,msg:"'What if the keys don't WANT to be found?' K'Dee's brain hurts."},
      {name:"DEEP STARE",dmg:1,msg:"Greyson stares meaningfully into the middle distance. Unsettling."},
      {name:"NIETZSCHE",dmg:2,msg:"'Mom. God is dead.' 'Greyson it's 8 AM.' 'Time is a construct.'"}
    ],
    intro:"Greyson is sitting in his gaming chair, illuminated by RGB.\n'Ah, Mother. We need to talk about the nature of existence.'",
    defeat:"Greyson nods sagely.\n'You've passed the test. The keys are within you.'\n'...Greyson.' 'OK fine. Try the garage.'",
    itemEffects:{necronomicon:{dmg:5,msg:"K'Dee shows the Necronomicon. Greyson is IMPRESSED. 'Finally, some culture.'"},bible:{dmg:4,msg:"'Have you considered... faith?' Greyson short-circuits."}}
  },
  gwyneth:{
    name:"GWYNETH",emoji:"\uD83D\uDE34",hp:6,maxHp:6,
    hair:"#654321",hairStyle:"long",skin:P.skin,shirt:P.sky,narcolepsy:true,
    attacks:[
      {name:"*SNORE*",dmg:0,msg:"Gwyneth is asleep. She does nothing. Somehow this is still stressful."},
      {name:"SLEEP TALK",dmg:1,msg:"'The unicorns...' Gwyneth mutters in her sleep. K'Dee is confused."},
      {name:"ROLL OVER",dmg:2,msg:"Gwyneth rolls over in her sleep and lands on K'Dee's foot."},
      {name:"*zzzzz*",dmg:0,msg:"Gwyneth sleeps harder. This is honestly impressive."}
    ],
    intro:"Gwyneth is lying on the floor.\n'Gwyneth? ...Gwyneth?'\n*snoring sounds*\nOh. Narcolepsy nap.",
    defeat:"Gwyneth wakes up suddenly.\n'Oh hi mom! Was I asleep?' 'For the whole battle.' 'What battle?'",
    itemEffects:{phone:{dmg:5,msg:"K'Dee plays an alarm on her phone. Gwyneth JOLTS awake. 'I'M UP!'"},banana:{dmg:3,msg:"K'Dee waves banana under Gwyneth's nose. She stirs slightly."}}
  },
  forest:{
    name:"FOREST",emoji:"\uD83E\uDD12",hp:5,maxHp:5,
    hair:"#F0E68C",hairStyle:"shock",beard:"#CD5C5C",skin:P.skin,shirt:"#556b2f",
    attacks:[
      {name:"*WHEEZE*",dmg:1,msg:"Forest wheezes so hard the room shakes. K'Dee is concerned."},
      {name:"COUGH",dmg:1,msg:"Forest coughs directly at K'Dee. She cringes. Bio-warfare!"},
      {name:"SNEEZE",dmg:2,msg:"ACHOO! Forest sneezes and K'Dee gets blown back!"},
      {name:"GROAN",dmg:0,msg:"Forest groans pathetically. K'Dee loses morale."}
    ],
    intro:"Forest is lying in bed, a mess of tissues and misery.\n'...mom? *wheeze* I think I'm dying.'\n'You have a cold, Forest.' '*wheeze* ...still dying.'",
    defeat:"Forest blows his nose triumphantly.\n'I feel 2% better. Thanks mom.' He immediately falls back asleep.",
    itemEffects:{towel:{dmg:3,msg:"K'Dee drapes the towel over Forest. He feels CARED FOR."},flashlight:{dmg:2,msg:"K'Dee checks Forest's throat with the flashlight. 'Say ahh.' 'BLEH.'"}}
  },
  daed:{
    name:"DAED",emoji:"\uD83E\uDDD4",hp:1,maxHp:1,
    hair:"#654321",hairStyle:"mullet",truckerHat:true,oily:true,skin:P.skin,shirt:"#555",
    attacks:[
      {name:"ESCAPE!",dmg:0,msg:"Daed is already halfway out the door. 'Gotta check on the Corvette!'"}
    ],
    intro:"Daed appears, covered in car oil as usual.\n'Oh hey babe, I was just—'\n'DAED.'",
    defeat:"Daed escapes before combat even really starts.\n'Gotta go! Corvette needs me!' *door slams*\nClassic Daed.",
    itemEffects:{wrench:{dmg:2,msg:"K'Dee brandishes the wrench. 'IS THIS YOURS?' Daed sweats."}}
  }
};

var battleRoomMap={3:"milo",5:"daed",19:"greyson",20:"holly",21:"forest"};
// Gwyneth triggers second visit to room 20
var gwynBattle=false;

function checkBattle(roomIdx){
  // Holly & Gwyn room: first visit=Holly, second=Gwyneth
  if(roomIdx===20&&battleDone["holly"]&&!battleDone["gwyneth"]&&!gwynBattle){
    gwynBattle=true;
    setTimeout(function(){startBattle("gwyneth");},600);
    return;
  }
  var fid=battleRoomMap[roomIdx];
  if(!fid||battleDone[fid])return;
  setTimeout(function(){startBattle(fid);},600);
}

function startBattle(fighterId){
  var f=FIGHTERS[fighterId];if(!f)return;
  battleActive=true;paused=true;
  battleState={
    id:fighterId,
    fighter:f,
    enemyHP:f.hp,
    turn:"intro",
    msg:f.intro,
    turnCount:0,
    shakeTimer:0,
    flashTimer:0,
    flashColor:"",
    selectedItem:null,
    kdeeAnim:0,
    enemyAnim:0,
    msgQueue:[],
    phase:"intro" // intro, player, enemy, enemyAct, victory
  };
}

function drawBattleFighter(c,f,x,y,anim,isEnemy){
  var bob=Math.sin(anim*0.05)*2;
  var shake=battleState.shakeTimer>0&&isEnemy?Math.sin(battleState.shakeTimer*2)*3:0;
  x+=shake;
  // Shadow
  c.save();c.globalAlpha=0.15;c.fillStyle="#000";
  c.beginPath();c.ellipse(x,y+2,14,4,0,0,Math.PI*2);c.fill();c.restore();

  var h=f.short?-2:f.tall?4:0;

  // Legs
  D(c,x-5,y-4+bob,5,6+h,"#4169E1");D(c,x+1,y-4+bob,5,6+h,"#4169E1");
  D(c,x-6,y+1+h+bob,6,3,"#333");D(c,x+1,y+1+h+bob,6,3,"#333");
  // Body
  c.fillStyle=f.shirt;
  c.beginPath();c.moveTo(x-9,y-16+bob-h);c.lineTo(x-10,y-4+bob);c.lineTo(x+10,y-4+bob);c.lineTo(x+9,y-16+bob-h);c.closePath();c.fill();
  // Oil stains for Daed
  if(f.oily){
    c.fillStyle="rgba(40,30,10,0.4)";
    c.beginPath();c.arc(x-4,y-10+bob,2,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(x+3,y-12+bob,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(x+1,y-6+bob,2,0,Math.PI*2);c.fill();
  }
  // Arms
  D(c,x-12,y-16+bob-h,4,12,f.shirt);D(c,x+8,y-16+bob-h,4,12,f.shirt);
  c.fillStyle=f.skin;
  c.beginPath();c.arc(x-10,y-4+bob,2.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(x+10,y-4+bob,2.5,0,Math.PI*2);c.fill();
  // Head
  c.fillStyle=f.skin;c.beginPath();c.arc(x,y-24+bob-h,10,0,Math.PI*2);c.fill();
  // Hair
  c.fillStyle=f.hair;
  if(f.hairStyle==="shaggy"){
    c.beginPath();c.arc(x,y-29+bob-h,10,Math.PI,2*Math.PI);c.fill();
    D(c,x-10,y-28+bob-h,6,8,f.hair);D(c,x+5,y-28+bob-h,6,8,f.hair);
    D(c,x-8,y-26+bob-h,4,6,f.hair);D(c,x+6,y-26+bob-h,4,6,f.hair);
  }else if(f.hairStyle==="long"){
    c.beginPath();c.arc(x,y-29+bob-h,10,Math.PI,2*Math.PI);c.fill();
    D(c,x-10,y-28+bob-h,5,16,f.hair);D(c,x+5,y-28+bob-h,5,16,f.hair);
  }else if(f.hairStyle==="dark"){
    c.beginPath();c.arc(x,y-29+bob-h,10,Math.PI,2*Math.PI);c.fill();
    D(c,x-9,y-28+bob-h,18,5,f.hair);
  }else if(f.hairStyle==="shock"){
    c.beginPath();c.arc(x,y-29+bob-h,10,Math.PI,2*Math.PI);c.fill();
    // Spiky shock of blonde hair
    for(var sp=0;sp<5;sp++){
      c.beginPath();c.moveTo(x-8+sp*4,y-33+bob-h);c.lineTo(x-6+sp*4,y-40+bob-h-sp%2*3);c.lineTo(x-4+sp*4,y-33+bob-h);c.closePath();c.fill();
    }
  }else if(f.hairStyle==="mullet"){
    c.beginPath();c.arc(x,y-29+bob-h,10,Math.PI,2*Math.PI);c.fill();
    D(c,x-8,y-28+bob-h,16,4,f.hair);
    // Mullet: party in the back
    D(c,x-6,y-20+bob-h,12,14,f.hair);
  }
  // Trucker hat for Daed
  if(f.truckerHat){
    RR(c,x-12,y-36+bob-h,24,8,3,"#cc0000");
    D(c,x-14,y-29+bob-h,28,4,"#cc0000");
  }
  // Moustache for Greyson
  if(f.moustache){
    c.fillStyle="#1a1a1a";
    c.beginPath();c.moveTo(x-5,y-18+bob-h);c.quadraticCurveTo(x,y-15+bob-h,x+5,y-18+bob-h);c.quadraticCurveTo(x,y-16+bob-h,x-5,y-18+bob-h);c.fill();
  }
  // Beard for Forest
  if(f.beard){
    c.fillStyle=f.beard;
    c.beginPath();c.moveTo(x-6,y-18+bob-h);c.quadraticCurveTo(x,y-10+bob-h,x+6,y-18+bob-h);c.fill();
  }
  // Eyes
  if(f.narcolepsy){
    // Closed eyes (sleeping)
    c.strokeStyle="#333";c.lineWidth=1;
    c.beginPath();c.arc(x-4,y-24+bob-h,2,0,Math.PI);c.stroke();
    c.beginPath();c.arc(x+4,y-24+bob-h,2,0,Math.PI);c.stroke();
    // Zzz
    c.fillStyle="rgba(100,150,255,0.5)";c.font="bold 8px monospace";
    c.fillText("z",x+12,y-32+bob-h+Math.sin(anim*0.03)*3);
    c.font="bold 6px monospace";c.fillText("z",x+18,y-38+bob-h+Math.sin(anim*0.03+1)*3);
  }else{
    c.fillStyle="#fff";c.fillRect(x-6,y-26+bob-h,5,4);c.fillRect(x+1,y-26+bob-h,5,4);
    c.fillStyle="#333";c.fillRect(x-5,y-25+bob-h,3,3);c.fillRect(x+2,y-25+bob-h,3,3);
  }
  // Mouth
  if(!f.narcolepsy){
    c.strokeStyle="#333";c.lineWidth=1;
    c.beginPath();c.arc(x,y-18+bob-h,3,0.1*Math.PI,0.9*Math.PI);c.stroke();
  }
  // Oily hands for Daed
  if(f.oily){
    c.fillStyle="rgba(40,30,10,0.3)";
    c.beginPath();c.arc(x-10,y-4+bob,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(x+10,y-4+bob,3,0,Math.PI*2);c.fill();
  }
}

function drawBattle(c){
  // BG
  c.fillStyle="#1a0a2e";c.fillRect(0,0,CW,CH);
  // Battle arena floor
  var fg=c.createLinearGradient(0,400,0,CH);fg.addColorStop(0,"#2a1a3e");fg.addColorStop(1,"#0a0a1a");c.fillStyle=fg;c.fillRect(0,400,CW,CH-400);
  // Floor pattern
  for(var i=0;i<CW;i+=30){c.strokeStyle="rgba(255,255,255,0.03)";c.lineWidth=1;c.beginPath();c.moveTo(i,400);c.lineTo(i-40,CH);c.stroke();}
  // VS glow
  c.fillStyle="rgba(255,69,180,0.04)";c.beginPath();c.arc(CW/2,300,120,0,Math.PI*2);c.fill();

  var bs=battleState;if(!bs)return;
  var f=bs.fighter;

  // Enemy fighter (right side, top)
  drawBattleFighter(c,f,250,340,bs.enemyAnim,true);
  // K'Dee (left side, bottom)
  drawKdee(c,110,500);

  // HP bars
  // Enemy HP
  c.fillStyle="#333";c.fillRect(185,230,130,12);
  var ehpW=Math.max(0,bs.enemyHP/f.maxHp)*126;
  c.fillStyle=bs.enemyHP>f.maxHp*0.5?"#2ecc71":bs.enemyHP>f.maxHp*0.25?"#FFD700":"#e74c3c";
  c.fillRect(187,232,ehpW,8);
  c.fillStyle="#fff";c.font="bold 8px monospace";c.fillText(f.name+" HP:"+bs.enemyHP+"/"+f.maxHp,188,228);

  // K'Dee HP
  c.fillStyle="#333";c.fillRect(45,420,130,12);
  var khpW=Math.max(0,kdeeHP/kdeeMaxHP)*126;
  c.fillStyle=kdeeHP>10?"#2ecc71":kdeeHP>5?"#FFD700":"#e74c3c";
  if(kdeeHP<=0)c.fillStyle="#8B0000";
  c.fillRect(47,422,Math.max(0,khpW),8);
  c.fillStyle="#fff";c.font="bold 8px monospace";c.fillText("K'DEE HP:"+kdeeHP+"/"+kdeeMaxHP,48,418);

  // Shake flash
  if(bs.flashTimer>0){
    c.fillStyle=bs.flashColor;c.globalAlpha=bs.flashTimer/10*0.3;
    c.fillRect(0,0,CW,CH);c.globalAlpha=1;
  }

  // Message box
  RR(c,15,530,CW-30,95,6,"rgba(0,0,0,0.85)");
  c.strokeStyle="rgba(255,215,0,0.3)";c.lineWidth=1;c.strokeRect(17,532,CW-34,91);
  // Message text (word wrap with newline support)
  c.fillStyle="#eee";c.font="11px monospace";
  var msgLines=(bs.msg||"").split("\n"),allLines=[];
  for(var ml=0;ml<msgLines.length;ml++){
    var words=msgLines[ml].split(" "),line="";
    for(var w=0;w<words.length;w++){
      var test=line+(line?" ":"")+words[w];
      if(c.measureText(test).width>CW-60){allLines.push(line);line=words[w];}else{line=test;}
    }
    if(line)allLines.push(line);else allLines.push("");
  }
  for(var l=0;l<Math.min(allLines.length,6);l++){c.fillText(allLines[l],28,548+l*13);}

  // Action buttons (player turn)
  if(bs.phase==="player"){
    // Attack options
    var btnY=440;
    var actions=[{label:"\u270B SLAP",color:"#e74c3c"},{label:"\uD83D\uDCAC NAG",color:"#FF69B4"},{label:"\uD83D\uDC5C PURSE",color:"#FFD700"}];
    for(var a=0;a<actions.length;a++){
      var bx=15+a*80;
      RR(c,bx,btnY,72,26,4,actions[a].color);
      c.fillStyle="#fff";c.font="bold 8px monospace";
      c.fillText(actions[a].label,bx+6,btnY+17);
    }
    // Item button (if has items)
    if(inv.length>0){
      RR(c,255,btnY,90,26,4,"#00CED1");
      c.fillStyle="#fff";c.font="bold 8px monospace";c.fillText("\uD83C\uDF81 USE ITEM",260,btnY+17);
    }
  }

  // Item selection UI
  if(bs.phase==="items"){
    c.fillStyle="rgba(0,0,0,0.7)";c.fillRect(0,0,CW,CH);
    RR(c,20,150,CW-40,340,8,"#1a0a2e");
    c.strokeStyle=P.gold;c.lineWidth=2;c.strokeRect(22,152,CW-44,336);
    c.fillStyle=P.gold;c.font="bold 12px monospace";c.fillText("USE WHICH ITEM?",90,180);
    // Item grid
    for(var i=0;i<inv.length&&i<8;i++){
      var ix=35+(i%4)*78,iy=200+Math.floor(i/4)*75;
      var info=invDetails[inv[i]]||{emoji:invEmoji[inv[i]]||"\u2753",name:inv[i]};
      RR(c,ix,iy,68,65,5,"rgba(255,255,255,0.05)");
      c.strokeStyle="rgba(255,215,0,0.3)";c.strokeRect(ix+1,iy+1,66,63);
      c.font="24px monospace";c.fillText(info.emoji,ix+20,iy+32);
      c.fillStyle="#ccc";c.font="7px monospace";
      var nm=info.name||inv[i];if(nm.length>10)nm=nm.substring(0,9)+"..";
      c.fillText(nm,ix+4,iy+52);
      c.fillStyle=P.gold;
    }
    // Back button
    RR(c,130,450,100,28,4,"#CD5C5C");
    c.fillStyle="#fff";c.font="bold 10px monospace";c.fillText("\u2190 BACK",155,468);
  }

  // Continue prompt
  if(bs.phase==="intro"||bs.phase==="enemyAct"||bs.phase==="victory"){
    c.fillStyle="rgba(255,255,255,0.3)";c.font="9px monospace";
    c.fillText("[ TAP TO CONTINUE ]",110,622);
  }
}

function battleClick(mx,my){
  var bs=battleState;if(!bs)return;

  if(bs.phase==="intro"){
    bs.phase="player";
    bs.msg="What will K'Dee do?";
    return;
  }

  if(bs.phase==="victory"){
    battleActive=false;paused=false;battleDone[bs.id]=true;
    battleState=null;
    updateHUD();
    return;
  }

  if(bs.phase==="enemyAct"){
    // After seeing enemy attack, go to player turn
    bs.phase="player";
    bs.msg="What will K'Dee do?";
    return;
  }

  if(bs.phase==="items"){
    // Check back button
    if(mx>=130&&mx<=230&&my>=450&&my<=478){
      bs.phase="player";bs.msg="What will K'Dee do?";return;
    }
    // Check item clicks
    for(var i=0;i<inv.length&&i<8;i++){
      var ix=35+(i%4)*78,iy=200+Math.floor(i/4)*75;
      if(mx>=ix&&mx<=ix+68&&my>=iy&&my<=iy+65){
        useItemInBattle(inv[i]);
        return;
      }
    }
    return;
  }

  if(bs.phase==="player"){
    var btnY=440;
    // SLAP
    if(mx>=15&&mx<=87&&my>=btnY&&my<=btnY+26){
      playerAttack("SLAP",3+Math.floor(Math.random()*2),"K'Dee slaps "+bs.fighter.name+"! Mom-strength activated!");
      return;
    }
    // NAG
    if(mx>=95&&mx<=167&&my>=btnY&&my<=btnY+26){
      playerAttack("NAG",2+Math.floor(Math.random()*2),"K'Dee unleashes a legendary mom-nag! '...and ANOTHER thing!'");
      return;
    }
    // PURSE
    if(mx>=175&&mx<=247&&my>=btnY&&my<=btnY+26){
      playerAttack("PURSE",4,"K'Dee swings her purse! It weighs 47 pounds somehow!");
      return;
    }
    // USE ITEM
    if(inv.length>0&&mx>=255&&mx<=345&&my>=btnY&&my<=btnY+26){
      bs.phase="items";bs.msg="Choose an item to use...";
      return;
    }
  }
}

function playerAttack(name,dmg,msg){
  var bs=battleState;
  // Daed special: escapes immediately
  if(bs.id==="daed"){
    bs.enemyHP=0;
    bs.msg=bs.fighter.defeat;
    bs.phase="victory";
    bs.flashTimer=8;bs.flashColor="rgba(255,215,0,0.3)";
    return;
  }
  // Gwyneth special: attacks don't work well
  if(bs.id==="gwyneth"){
    dmg=Math.max(0,dmg-1);
    msg+="\n...Gwyneth doesn't notice. She's asleep.";
  }
  bs.enemyHP-=dmg;
  bs.shakeTimer=10;
  bs.flashTimer=6;bs.flashColor="rgba(255,100,100,0.2)";
  if(bs.enemyHP<=0){
    bs.enemyHP=0;
    bs.msg=msg+"\n\n"+bs.fighter.defeat;
    bs.phase="victory";
  }else{
    bs.msg=msg;
    bs.phase="enemyTurn";
    setTimeout(function(){enemyTurn();},800);
  }
}

function useItemInBattle(itemId){
  var bs=battleState;
  var f=bs.fighter;
  var effect=f.itemEffects&&f.itemEffects[itemId];
  if(effect){
    bs.enemyHP-=effect.dmg;
    bs.shakeTimer=12;
    bs.flashTimer=8;bs.flashColor="rgba(0,206,209,0.3)";
    if(bs.enemyHP<=0){
      bs.enemyHP=0;
      bs.msg=effect.msg+"\n\n"+f.defeat;
      bs.phase="victory";
    }else{
      bs.msg=effect.msg;
      bs.phase="enemyTurn";
      setTimeout(function(){enemyTurn();},800);
    }
  }else{
    // Generic item use
    var dmg=2;
    var info=invDetails[itemId]||{name:itemId};
    bs.enemyHP-=dmg;
    bs.shakeTimer=8;
    bs.flashTimer=6;bs.flashColor="rgba(255,215,0,0.2)";
    var msg="K'Dee uses "+info.name+"! "+bs.fighter.name+" is mildly confused.";
    if(bs.enemyHP<=0){
      bs.enemyHP=0;
      bs.msg=msg+"\n\n"+f.defeat;
      bs.phase="victory";
    }else{
      bs.msg=msg;
      bs.phase="enemyTurn";
      setTimeout(function(){enemyTurn();},800);
    }
  }
}

function enemyTurn(){
  var bs=battleState;if(!bs)return;
  var f=bs.fighter;
  // Daed always escapes
  if(bs.id==="daed"){bs.phase="victory";bs.msg=f.defeat;return;}
  var atk=f.attacks[Math.floor(Math.random()*f.attacks.length)];
  var dmg=atk.dmg;
  kdeeHP-=dmg;
  bs.msg=atk.msg;
  if(dmg>0){bs.flashTimer=6;bs.flashColor="rgba(255,0,0,0.15)";}
  bs.phase="enemyAct";
  bs.turnCount++;
  updateHUD();
}

function updateBattle(){
  if(!battleState)return;
  battleState.kdeeAnim++;
  battleState.enemyAnim++;
  if(battleState.shakeTimer>0)battleState.shakeTimer--;
  if(battleState.flashTimer>0)battleState.flashTimer--;
}

function winGame(){
  gameOver=true;paused=true;clearInterval(timerInterval);
  document.getElementById("dlg-continue").style.display="none";
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void d.offsetHeight;inner.style.animation="";d.classList.add("on");
  document.getElementById("dlg-portrait").textContent="\uD83C\uDF89";
  document.getElementById("dlg-portrait").style.borderColor="#FFD700";
  document.getElementById("dlg-name").textContent="YOU WIN!";
  var m=Math.floor((780-timer)/60),s=(780-timer)%60;
  typeText(document.getElementById("dlg-text"),"K'Dee found all 3 keys in "+m+"m "+s+"s! She grabs her purse, kisses the kids, and heads out the door. Have fun, don't die!");
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again" style="border-color:#FFD700;color:#FFD700">\uD83C\uDF89 PLAY AGAIN</div>';
  document.getElementById("play-again").addEventListener("click",function(){location.reload();});
}

function loseGame(){
  gameOver=true;paused=true;clearInterval(timerInterval);
  document.getElementById("dlg-continue").style.display="none";
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void d.offsetHeight;inner.style.animation="";d.classList.add("on");
  document.getElementById("dlg-portrait").textContent="\u23F0";
  document.getElementById("dlg-portrait").style.borderColor="#CD5C5C";
  document.getElementById("dlg-name").textContent="TIME'S UP!";
  typeText(document.getElementById("dlg-text"),"K'Dee is officially late. The kids are feral. The dog ate something suspicious. "+keys+"/3 keys found. Try again?");
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again2" style="border-color:#CD5C5C;color:#CD5C5C">\u23F0 TRY AGAIN</div>';
  document.getElementById("play-again2").addEventListener("click",function(){location.reload();});
}

var timerInterval;
function startTimer(){timerInterval=setInterval(function(){if(paused||gameOver)return;timer--;updateHUD();if(timer<=0){clearInterval(timerInterval);loseGame();}},1000);}

document.getElementById("startbtn").addEventListener("click",function(){
  document.getElementById("title").style.display="none";
  document.getElementById("game").classList.add("on");
  kdeeX=180;kdeeY=560;
  spawnParticles(curRoom);
  drawScene();updateHUD();
  startLoop();startTimer();
});

document.getElementById("qbtn").addEventListener("click",function(){
  if(confirm("Quit game?")){gameOver=true;animRunning=false;clearInterval(timerInterval);document.getElementById("game").classList.remove("on");document.getElementById("title").style.display="flex";}
});

})();