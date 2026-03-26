/* K'DEE MOM — GAME ENGINE (portrait 360x640 canvas) */
(function(){
var CW=360,CH=640,curRoom=0,keys=0,timer=780,inv=[],usedHS={},questItems={},paused=false,gameOver=false;
var kdeeHP=20,kdeeMaxHP=20;
var canvas=document.getElementById("scene"),ctx=canvas.getContext("2d");
var hotspots=makeHS();
var invEmoji={banana:"\uD83C\uDF4C",duck:"\uD83E\uDD86",bible:"\uD83D\uDCD6",flashlight:"\uD83D\uDD26",necronomicon:"\uD83D\uDCDA",shovel:"\u26CF\uFE0F",wrench:"\uD83D\uDD27",towel:"\uD83E\uDDF4",book:"\uD83D\uDCDA",tidepen:"\uD83E\uDDF4",phone:"\uD83D\uDCF1"};
var verbLabels={use:"\u270B USE",take:"\uD83E\uDD1A TAKE",talk:"\uD83D\uDCAC TALK",open:"\uD83D\uDCE6 OPEN",push:"\uD83D\uDC4A PUSH"};

/* K'Dee position & walking */
var kdeeX=180,kdeeY=520,kdeeTargetX=180,kdeeTargetY=520,kdeeWalking=false,walkSpeed=4;
var walkAnim=0,frameTick=0;

/* Holly random encounter state */
var hollyRunning=false,hollyX=-40,hollyY=520,hollyTimer=Math.floor(400+Math.random()*200);
var hollyAnim=0,hollyMsg="",hollyMsgTimer=0,hollyCatchable=false;
var hollyTrip=false,hollyTripTimer=0;

/* Milo follow state — after Big Hug win he tags along for a few rooms */
var miloFollowing=false,miloRoomsLeft=0,miloFollowX=180,miloFollowY=540,miloFollowAnim=0;
var miloMsg="",miloMsgTimer=0;
function drawKdee(c,x,y){
  var breathe=Math.sin(frameTick*0.04)*1;
  var bob=kdeeWalking?Math.sin(walkAnim*0.3)*3.5:breathe*0.7;
  var legOff=kdeeWalking?Math.sin(walkAnim*0.4)*6:0;
  var armOff=kdeeWalking?Math.sin(walkAnim*0.4)*4:0;
  var sc=1.6;// world scale — bigger characters

  c.save();c.translate(x,y);c.scale(sc,sc);

  // Shadow
  c.save();c.globalAlpha=0.18;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,2,12,4,0,0,Math.PI*2);c.fill();c.restore();

  // Legs
  D(c,-5+legOff,-4+bob,5,7,"#4169E1");
  D(c,1-legOff,-4+bob,5,7,"#4169E1");
  // Shoes
  D(c,-6+legOff,2+bob,7,4,"#333");
  D(c,1-legOff,2+bob,7,4,"#333");

  // Body / shirt
  c.fillStyle=P.pink;
  c.beginPath();
  c.moveTo(-8,-15+bob);
  c.lineTo(-9,-4+bob);
  c.lineTo(9,-4+bob);
  c.lineTo(8,-15+bob);
  c.closePath();c.fill();
  // Shirt detail
  D(c,-1,-13+bob,2,9,"#FF85C8");

  // Skirt / jeans
  D(c,-8,-6+bob,16,6,"#4169E1");

  // Arms
  D(c,-12,-15+bob-armOff,4,11,P.pink);
  D(c,8,-15+bob+armOff,4,11,P.pink);
  // Hands
  c.fillStyle=P.skin;
  c.beginPath();c.arc(-10,-4+bob-armOff,3,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(10,-4+bob+armOff,3,0,Math.PI*2);c.fill();

  // Head
  c.fillStyle=P.skin;
  c.beginPath();c.arc(0,-24+bob,12,0,Math.PI*2);c.fill();

  // Hair
  c.fillStyle=P.hair;
  c.beginPath();c.arc(0,-29+bob,12,Math.PI,2*Math.PI);c.fill();
  D(c,-12,-28+bob,6,12,P.hair);
  D(c,6,-28+bob,6,12,P.hair);
  // Hair highlight
  c.fillStyle="rgba(255,255,200,0.25)";
  c.beginPath();c.arc(4,-31+bob,5,0,Math.PI*2);c.fill();

  // Eyes
  c.fillStyle="#fff";
  c.fillRect(-6,-25+bob,5,4);c.fillRect(1,-25+bob,5,4);
  c.fillStyle=P.eye;
  c.fillRect(-5,-24+bob,3,3);c.fillRect(2,-24+bob,3,3);
  // Eye sparkle
  c.fillStyle="#fff";c.fillRect(-5,-25+bob,1,1);c.fillRect(2,-25+bob,1,1);

  // Mouth (smile)
  c.strokeStyle=P.pink;c.lineWidth=1.2;
  c.beginPath();c.arc(0,-19+bob,4,0.1*Math.PI,0.9*Math.PI);c.stroke();

  c.restore();
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

/* Holly random encounter: countdown and update */
var HOLLY_SAFE_ROOMS=[10,11,14,15,16]; // No Holly in Jesus Bath, Basement, Maze
function updateHolly(){
  if(battleActive||paused||gameOver)return;
  if(hollyRunning){
    hollyAnim++;
    if(hollyMsgTimer>0)hollyMsgTimer--;
    if(hollyTrip){
      hollyTripTimer--;
      // Phase 1 (frames 60-40): collapsed on ground, slide slowly
      if(hollyTripTimer>40){hollyX+=0.5;}
      // Phase 2 (frames 40-0): scramble up and flee fast
      else{hollyX+=6;}
      if(hollyTripTimer<=0){
        hollyRunning=false;hollyTrip=false;hollyX=-40;hollyMsg="";hollyMsgTimer=0;hollyCatchable=false;
        hollyTimer=Math.floor(500+Math.random()*300);
      }
      return;
    }
    hollyX+=3; // she moves slowly and quietly — that's what makes it unsettling
    if(hollyX>60&&hollyX<200&&hollyMsgTimer===0){
      hollyMsg="...hi.";hollyMsgTimer=80;
    }
    if(hollyX>230&&hollyMsg==="...hi."&&hollyMsgTimer<30){
      hollyMsg="...bye.";hollyMsgTimer=60;
      // Deal 1 damage
      kdeeHP=Math.max(0,kdeeHP-1);updateHUD();
    }
    if(hollyX>400){
      hollyRunning=false;hollyX=-40;hollyMsg="";hollyMsgTimer=0;hollyCatchable=false;
      hollyTimer=Math.floor(400+Math.random()*200);
    }
    return;
  }
  if(HOLLY_SAFE_ROOMS.indexOf(curRoom)>=0)return;
  hollyTimer--;
  if(hollyTimer<=0&&Math.random()<0.05){
    hollyRunning=true;hollyX=-40;hollyY=Math.floor(460+Math.random()*40);hollyAnim=0;
    hollyCatchable=true;hollyMsg="";hollyMsgTimer=40;
    hollyTimer=Math.floor(400+Math.random()*200);
  }
}

/* Draw running Holly during encounter */
function drawHolly(c){
  if(!hollyRunning)return;
  var sc=1.8;

  if(hollyTrip){
    // Tripped — draw her collapsed/scrambling
    var phase=hollyTripTimer; // 60→0
    c.save();c.translate(hollyX,hollyY);c.scale(sc,sc);
    if(phase>40){
      // Collapsed flat on ground
      c.save();c.rotate(Math.PI/2);// rotated 90° — lying down
      // Body horizontal
      c.fillStyle="#DDA0DD";c.fillRect(-12,-4,24,8);
      // Head
      c.fillStyle=P.skin;c.beginPath();c.arc(15,0,7,0,Math.PI*2);c.fill();
      // Hair splayed
      c.fillStyle="#654321";c.beginPath();c.arc(15,-4,7,Math.PI,2*Math.PI);c.fill();
      D(c,12,-10,6,10,"#654321");D(c,17,-10,6,10,"#654321");
      // Stars above head
      c.fillStyle=P.gold;c.font="bold 8px monospace";c.textAlign="center";
      c.fillText("*_*",15,-14+Math.sin(phase*0.3)*2);c.textAlign="left";
      // Legs splayed
      D(c,-16,-6,8,4,"#8B668B");D(c,-16,2,8,4,"#8B668B");
      c.restore();
    } else {
      // Scrambling back up and fleeing — wobbly upright
      var wobble=Math.sin(phase*0.8)*(phase/40)*6;
      c.save();c.rotate(wobble*0.08);
      D(c,-5,-8,4,12,"#8B668B");D(c,2,-8,4,12,"#8B668B");
      c.fillStyle="#DDA0DD";c.beginPath();
      c.moveTo(-7,-20);c.lineTo(-8,-8);c.lineTo(8,-8);c.lineTo(7,-20);c.closePath();c.fill();
      D(c,-14,-20,4,14,"#DDA0DD");D(c,7,-20,4,14,"#DDA0DD");// arms flailing
      c.fillStyle=P.skin;c.beginPath();c.arc(0,-28,8,0,Math.PI*2);c.fill();
      c.fillStyle="#654321";c.beginPath();c.arc(0,-32,8,Math.PI,2*Math.PI);c.fill();
      D(c,-8,-31,4,18,"#654321");D(c,4,-31,4,18,"#654321");
      // Wide eyes — panicked
      c.fillStyle="#fff";c.fillRect(-4,-30,3,4);c.fillRect(1,-30,3,4);
      c.fillStyle="#333";c.fillRect(-3,-29,2,3);c.fillRect(2,-29,2,3);
      c.restore();
    }
    c.restore();
    return;
  }

  var bob=Math.sin(hollyAnim*0.15)*1.5;// very gentle sway — she moves quietly
  var legSwing=Math.sin(hollyAnim*0.2)*4;// slow deliberate stride
  c.save();c.translate(hollyX,hollyY);c.scale(sc,sc);
  // Very faint shadow — she moves like a ghost
  c.save();c.globalAlpha=0.08;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,2,10,3,0,0,Math.PI*2);c.fill();c.restore();
  // Long legs (tall character)
  D(c,-5+legSwing,-8+bob,4,12,"#8B668B");
  D(c,2-legSwing,-8+bob,4,12,"#8B668B");
  D(c,-6+legSwing,3+bob,5,3,"#333");
  D(c,2-legSwing,3+bob,5,3,"#333");
  // Long body
  c.fillStyle="#DDA0DD";c.beginPath();
  c.moveTo(-7,-20+bob);c.lineTo(-8,-8+bob);c.lineTo(8,-8+bob);c.lineTo(7,-20+bob);
  c.closePath();c.fill();
  // Long arms hanging at sides (not flailing — calm)
  D(c,-11,-20+bob,4,14,"#DDA0DD");
  D(c,7,-20+bob,4,14,"#DDA0DD");
  // Head (higher up — tall)
  c.fillStyle=P.skin;c.beginPath();c.arc(0,-28+bob,8,0,Math.PI*2);c.fill();
  // Long straight hair
  c.fillStyle="#654321";c.beginPath();c.arc(0,-32+bob,8,Math.PI,2*Math.PI);c.fill();
  D(c,-8,-31+bob,4,18,"#654321");D(c,4,-31+bob,4,18,"#654321");
  // Eyes — half-lidded, calm, slightly unsettling
  c.fillStyle="#fff";c.fillRect(-4,-29+bob,3,2);c.fillRect(1,-29+bob,3,2);
  c.fillStyle="#333";c.fillRect(-3,-29+bob,2,2);c.fillRect(2,-29+bob,2,2);
  // Slight smile — gentle, not alarmed
  c.strokeStyle="#c0a0b0";c.lineWidth=0.8;
  c.beginPath();c.arc(0,-23+bob,2.5,0.15*Math.PI,0.85*Math.PI);c.stroke();
  c.restore();

  // Holly message overlay — light bubble above her head, visible immediately
  if(hollyMsg){
    var alpha=Math.min(1,hollyMsgTimer/10);
    c.save();c.globalAlpha=alpha;
    c.font="bold 11px monospace";
    var tw=c.measureText(hollyMsg).width+18;
    var tx=Math.min(Math.max(hollyX,tw/2+5),355-tw/2);
    // Light speech bubble — cream background, dark text, easy to read
    RR(c,tx-tw/2,hollyY-70,tw,20,4,"rgba(255,248,220,0.96)");
    c.strokeStyle="rgba(180,140,200,0.7)";c.lineWidth=1;
    c.beginPath();
    c.moveTo(tx-tw/2+4,hollyY-50);c.lineTo(tx-tw/2+4,hollyY-70);c.lineTo(tx+tw/2-4,hollyY-70);c.lineTo(tx+tw/2-4,hollyY-50);
    c.stroke();
    // Text — dark so it shows on the light background
    c.fillStyle="#2a1a3e";c.textAlign="center";
    c.fillText(hollyMsg,tx,hollyY-56);
    c.textAlign="left";
    c.restore();
  }
}

/* Milo follow: update position trailing K'Dee, random chatter */
var MILO_QUIPS=["'Mom can I tell you something?'","'MOM. Mom. Mommy.'","'Did you know dinosaurs—'","'I made you a drawing!'","'Can we read later?'","'...mom?'","'The book said—'","'I love you!'"];
function updateMilo(){
  if(!miloFollowing)return;
  miloFollowAnim++;
  // Trail slightly behind K'Dee
  miloFollowX+=(kdeeX-30-miloFollowX)*0.12;
  miloFollowY+=(kdeeY-miloFollowY)*0.12;
  if(miloMsgTimer>0)miloMsgTimer--;
  // Random quips
  if(miloMsgTimer===0&&Math.random()<0.004){
    miloMsg=MILO_QUIPS[Math.floor(Math.random()*MILO_QUIPS.length)];miloMsgTimer=100;
  }
}
function drawMilo(c){
  if(!miloFollowing)return;
  var bob=Math.sin(miloFollowAnim*0.2)*2;
  var leg=Math.sin(miloFollowAnim*0.25)*5;
  var sc=0.85;// small kid
  c.save();c.translate(miloFollowX,miloFollowY);c.scale(sc,sc);
  // Shadow
  c.save();c.globalAlpha=0.1;c.fillStyle="#000";c.beginPath();c.ellipse(0,4,8,3,0,0,Math.PI*2);c.fill();c.restore();
  // Legs
  D(c,-4+leg,0,4,10,"#3498db");D(c,1-leg,0,4,10,"#3498db");
  D(c,-5+leg,9,5,3,"#333");D(c,1-leg,9,5,3,"#333");
  // Body
  c.fillStyle="#87CEEB";c.beginPath();c.moveTo(-6,-12+bob);c.lineTo(-7,0+bob);c.lineTo(7,0+bob);c.lineTo(6,-12+bob);c.closePath();c.fill();
  // Arms with book
  D(c,-10,-12+bob,4,9,"#87CEEB");D(c,6,-12+bob,4,9,"#87CEEB");
  // Book in hand
  RR(c,6,-8+bob,8,10,2,"#e74c3c");c.fillStyle="#fff";c.font="bold 4px monospace";c.fillText("📖",6,-2+bob);
  // Head
  c.fillStyle=P.skin;c.beginPath();c.arc(0,-20+bob,8,0,Math.PI*2);c.fill();
  // Hair
  c.fillStyle="#654321";c.beginPath();c.arc(0,-24+bob,8,Math.PI,2*Math.PI);c.fill();
  // Big happy eyes
  c.fillStyle="#fff";c.fillRect(-4,-22+bob,4,3);c.fillRect(1,-22+bob,4,3);
  c.fillStyle="#3498db";c.fillRect(-3,-22+bob,3,3);c.fillRect(2,-22+bob,3,3);
  c.fillStyle="#000";c.fillRect(-2,-21+bob,1,2);c.fillRect(3,-21+bob,1,2);
  // Big smile
  c.strokeStyle="#c07060";c.lineWidth=1;c.beginPath();c.arc(0,-14+bob,4,0.1*Math.PI,0.9*Math.PI);c.stroke();
  c.restore();
  // Speech bubble
  if(miloMsg&&miloMsgTimer>0){
    var alpha=Math.min(1,miloMsgTimer/10);
    c.save();c.globalAlpha=alpha;
    c.font="bold 9px monospace";
    var tw=c.measureText(miloMsg).width+14;
    var bx=Math.min(Math.max(miloFollowX-tw/2,2),CW-tw-2);
    RR(c,bx,miloFollowY-65,tw,18,4,"rgba(255,248,220,0.96)");
    c.fillStyle="#2a1a3e";c.textAlign="center";
    c.fillText(miloMsg,miloFollowX,miloFollowY-51);c.textAlign="left";
    c.restore();
  }
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
    c.save();c.globalAlpha=0.75+0.25*pulse;

    c.font="bold 8px monospace";
    var label=h.name;
    var tw=c.measureText(label).width;

    if(isLeft){
      // Glow strip
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(0,cy-28,22,56);
      // Arrow pointing left
      c.fillStyle=P.gold;c.beginPath();c.moveTo(14,cy-10);c.lineTo(4,cy);c.lineTo(14,cy+10);c.closePath();c.fill();
      // Label pill — inside canvas, to the right of the arrow
      var lx=20,ly=cy-9,lw=tw+10,lh=18;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="left";c.fillText(label,lx+5,ly+13);

    } else if(isRight){
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(338,cy-28,22,56);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(346,cy-10);c.lineTo(356,cy);c.lineTo(346,cy+10);c.closePath();c.fill();
      // Label pill — inside canvas, to the left of the arrow
      var lw=tw+10,lx=336-lw,ly=cy-9,lh=18;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="left";c.fillText(label,lx+5,ly+13);

    } else if(isTop){
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(cx-28,0,56,22);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(cx-10,14);c.lineTo(cx,4);c.lineTo(cx+10,14);c.closePath();c.fill();
      // Label pill below arrow
      var lw=tw+10,lx=Math.min(Math.max(cx-lw/2,2),CW-lw-2),ly=24,lh=16;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(label,cx,ly+12);

    } else if(isBottom){
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(cx-28,618,56,22);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(cx-10,626);c.lineTo(cx,636);c.lineTo(cx+10,626);c.closePath();c.fill();
      // Label pill above arrow
      var lw=tw+10,lx=Math.min(Math.max(cx-lw/2,2),CW-lw-2),ly=600,lh=16;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(label,cx,ly+12);

    } else {
      // Interior door — archway glow + label above the hotspot (always visible)
      c.fillStyle="rgba(255,215,0,"+0.18*pulse+")";
      c.beginPath();c.arc(cx,h.y+h.h,h.w/2+4,Math.PI,2*Math.PI);
      c.rect(cx-h.w/2-4,h.y+h.h,h.w+8,6);c.fill();
      // Label pill clamped above the door, never below canvas bottom
      var lw=tw+10,lx=Math.min(Math.max(cx-lw/2,2),CW-lw-2);
      var ly=Math.min(h.y+h.h+8,CH-20);
      RR(c,lx,ly,lw,16,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(label,cx,ly+12);
    }
    c.textAlign="left";
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
    // Milo follows but gets bored after a few rooms
    if(miloFollowing){
      miloRoomsLeft--;miloFollowX=210;miloFollowY=560;
      if(miloRoomsLeft<=0){
        miloFollowing=false;miloMsg="";miloMsgTimer=0;
        setDesc("Milo wandered off to read.");
      }
    }
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
  drawMilo(ctx);
  drawHolly(ctx);
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
function gameLoop(){if(!animRunning)return;frameTick++;if(battleActive){updateBattle();drawBattle(ctx);}else if(miniActive){updateCatchGame();drawCatchGame(ctx);}else if(frogActive){updateFrogger();drawFrogger(ctx);}else if(racerActive){updateRacer();drawRacer(ctx);}else if(tetActive){updateTetris();drawTetris(ctx);}else{updateWalk();updateHolly();updateMilo();drawScene();}requestAnimationFrame(gameLoop);}
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
  // Fix: reflow on inner (not d) to properly reset animation
  d.classList.remove("on");
  inner.style.animation="none";
  void inner.offsetWidth;  // reflow on inner — this is the critical fix
  inner.style.animation="";
  d.classList.add("on");

  // Set portrait based on hotspot category (default: look)
  setPortraitMode(getPortraitMode(h.id,"look"));
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
    setPortraitMode("key");
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
    setPortraitMode("excited");
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
    setPortraitMode("take");
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

  // Mini-game trigger: backyard BBQ (starts poop frogger)
  if(h.id==="bbq"&&v==="open"&&!usedHS[uid]){
    usedHS[uid]=true;
    hideDlg();
    startFrogger();
    return;
  }

  // Mini-game trigger: clothes pile (starts Tetris)
  if(h.id==="clothespile"&&(v==="push"||v==="take")&&!usedHS[uid]){
    hideDlg();
    startTetris();
    return;
  }

  // Regular action
  usedHS[uid]=true;
  // Update portrait reaction to match verb
  var verbMode=getPortraitMode(h.id,v);
  setPortraitMode(verbMode);
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

function showSimpleDlg(name,text,mode){
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  setPortraitMode(mode||"look");
  document.getElementById("dlg-name").textContent=name;
  typeText(document.getElementById("dlg-text"),text);
  document.getElementById("dlg-choices").innerHTML="";
  paused=true;
}

function hideDlg(){
  if(gameOver)return; // Don't dismiss win/lose dialogs
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  document.getElementById("dlg").classList.remove("on");
  document.getElementById("dlg-continue").style.display="";
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
  banana:{emoji:"\uD83C\uDF4C",name:"Banana",desc:"A perfectly ripe banana. Restores 3 HP when eaten.",type:"Food",battle:"Super effective vs. Milo!",heal:3},
  cookie:{emoji:"\uD83C\uDF6A",name:"Snack Cookie",desc:"Confiscated from Greyson's stash. Peanut butter. Restores 5 HP.",type:"Food",battle:"General battle item",heal:5},
  duck:{emoji:"\uD83E\uDD86",name:"General Quackers",desc:"Leader of the rubber duck army. Seen things. Won't talk about it.",type:"Companion",battle:"Super effective vs. Milo!"},
  bible:{emoji:"\uD83D\uDCD6",name:"Bible",desc:"Proverbs 31. Divine guidance for finding lost keys. (Results may vary.)",type:"Sacred Text",battle:"Super effective vs. Greyson, Space Jesus & Baal'thazar!"},
  flashlight:{emoji:"\uD83D\uDD26",name:"Flashlight",desc:"Found at the workbench. Batteries at 12%. Classic.",type:"Tool",battle:"Useful in battle vs. Forest"},
  necronomicon:{emoji:"\uD83D\uDCDA",name:"Necronomicon",desc:"It whispers. Mostly complaints. Do NOT read aloud at bedtime.",type:"Forbidden Text",battle:"Super effective vs. Greyson, Space Jesus & Baal'thazar!"},
  shovel:{emoji:"\u26CF\uFE0F",name:"Shovel",desc:"From the shed. The dog is VERY interested in this.",type:"Tool",battle:"Super effective vs. Baal'thazar!"},
  wrench:{emoji:"\uD83D\uDD27",name:"Wrench",desc:"A sturdy wrench. Opens things that shouldn't be opened.",type:"Tool",battle:"Super effective vs. Daed!"},
  towel:{emoji:"\uD83E\uDDF4",name:"Towel",desc:"Seen better days. Mostly decorative at this point.",type:"Textile",battle:"Super effective vs. Holly & Forest!"},
  book:{emoji:"\uD83D\uDCDA",name:"Parenting Book",desc:"'Parenting Without Losing Your Mind.' Chapter 1: Too late.",type:"Literature",battle:"Super effective vs. Holly!"},
  tidepen:{emoji:"\uD83E\uDDF4",name:"Tide Pen",desc:"For stain emergencies. Which is every day.",type:"Supply",battle:"General battle item"},
  phone:{emoji:"\uD83D\uDCF1",name:"K'Dee's Phone",desc:"Texts from Mom: 'Did you see what Janet did' (no context). 'I need to know about the casserole.' 'I attached a photo' (no photo). Forwarded chain email: IF YOU DON'T SHARE THIS. Battery: 8%. 214 kid photos. One good selfie.",type:"Technology",battle:"Super effective vs. Gwyneth!"},
  bookshelf:{emoji:"\uD83D\uDCDA",name:"Parenting Book",desc:"'Parenting Without Losing Your Mind.' Still on chapter 1.",type:"Literature",battle:"Super effective vs. Holly!"},
  tools:{emoji:"\uD83D\uDD27",name:"Wrench",desc:"Heavy duty. Good for opening stubborn trunks.",type:"Tool",battle:"Super effective vs. Daed!"},
  shelf:{emoji:"\uD83E\uDDF4",name:"Tide Pen",desc:"Almost empty. Story of K'Dee's life.",type:"Supply"},
  flowers:{emoji:"\uD83C\uDF3A",name:"Flowers",desc:"A self-care purchase. Smells like lavender and victory.",type:"Self-Care"},
  drinks:{emoji:"\uD83E\uDD64",name:"Energy Drinks",desc:"Confiscated from Greyson. Three empty cans. Gross.",type:"Contraband",battle:"Useful in battle vs. Greyson"},
  beds:{emoji:"\uD83C\uDF3F",name:"Fresh Herbs",desc:"Rosemary and basil. Tonight's dinner is going to be great.",type:"Ingredient"},
  fthermo:{emoji:"\uD83C\uDF21\uFE0F",name:"Thermometer",desc:"102.3. Poor Forest. Sending healing vibes.",type:"Medical"},
  dumbbells:{emoji:"\uD83C\uDFCB\uFE0F",name:"Dumbbell",desc:"Almost lifted one. Almost.",type:"Equipment"}
};

// Items that are super-effective somewhere
var battleItems=["banana","duck","bible","necronomicon","wrench","towel","book","phone","flashlight","drinks","shovel","cookie"];

function updateInv(){
  var bc=document.getElementById("bag-count");
  bc.textContent=inv.length>0?inv.length:"";
  var ic=document.getElementById("inv-count");
  if(ic)ic.textContent=inv.length>0?(inv.length+" ITEMS"):"EMPTY";
  // Pulse bag button to draw attention when item added
  var btn=document.getElementById("bagbtn");
  if(btn&&inv.length>0){btn.classList.remove("new-item");void btn.offsetWidth;btn.classList.add("new-item");}
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
    var info=invDetails[it]||{emoji:invEmoji[it]||"\u2753",name:it,desc:"A mysterious item.",type:"???"};
    var cell=document.createElement("div");cell.className="inv-cell";
    if(battleItems.indexOf(it)>=0)cell.classList.add("rarity-battle");
    var inner='<div class="inv-cell-emoji">'+info.emoji+'</div><div class="inv-cell-name">'+info.name+'</div>';
    if(info.battle)inner+='<div class="inv-cell-badge">\u2694</div>';
    cell.innerHTML=inner;
    cell.addEventListener("click",function(){
      var all=grid.querySelectorAll(".inv-cell");
      for(var j=0;j<all.length;j++)all[j].classList.remove("selected");
      cell.classList.add("selected");
      document.getElementById("inv-detail-emoji").textContent=info.emoji;
      document.getElementById("inv-detail-name").textContent=info.name;
      var typeEl=document.getElementById("inv-detail-type");
      if(typeEl)typeEl.textContent=info.type||"";
      document.getElementById("inv-detail-desc").textContent=info.desc;
      var battleEl=document.getElementById("inv-detail-battle");
      if(battleEl){
        if(info.battle){battleEl.textContent="\u2694 "+info.battle;battleEl.classList.add("on");}
        else{battleEl.classList.remove("on");}
      }
      detail.classList.add("on");
      // USE button for food items (only outside battle)
      var existingUse=document.getElementById("inv-use-btn");
      if(existingUse)existingUse.remove();
      if(info.heal&&!battleActive){
        var useBtn=document.createElement("button");
        useBtn.id="inv-use-btn";useBtn.textContent="🍽 EAT (+"+info.heal+" HP)";
        useBtn.style="font-family:monospace;font-size:0.75rem;color:#2ecc71;border:1px solid #2ecc71;background:transparent;padding:8px 20px;border-radius:16px;cursor:pointer;margin-top:8px;letter-spacing:1px;display:block;margin-left:auto;margin-right:auto";
        useBtn.addEventListener("click",function(){
          if(kdeeHP>=kdeeMaxHP){setDesc("K'Dee is already at full health!");return;}
          var healed=Math.min(info.heal,kdeeMaxHP-kdeeHP);
          kdeeHP=Math.min(kdeeMaxHP,kdeeHP+info.heal);
          updateHUD();
          inv.splice(inv.indexOf(it),1);
          setDesc(info.name+" eaten! +" +healed+" HP!");
          hideInv();
        });
        document.getElementById("inv-detail").appendChild(useBtn);
      }
    });
    grid.appendChild(cell);
  });
}

function hideInv(){document.getElementById("inv-screen").classList.remove("on");}
document.getElementById("bagbtn").addEventListener("click",function(){
  if(document.getElementById("inv-screen").classList.contains("on")){hideInv();}else{showInv();}
});
document.getElementById("inv-close").addEventListener("click",hideInv);

/* --- FROGGER MINI-GAME --- */
/* Backyard poop dodger: tap/click to hop K'Dee across the yard avoiding dog poop. */
var frogActive=false,frogRow=0,frogCol=3,frogTimer=0,frogLives=3,frogScore=0,frogLevel=1;
var frogPoops=[],frogComplete=false,frogMsgTimer=0,frogMsg="",frogMoveDelay=0;
var FROG_ROWS=7,FROG_COLS=7;// 7x7 grid
var FROG_CELLW=Math.floor(360/FROG_COLS),FROG_CELLH=Math.floor(490/FROG_ROWS);// visible play area
var FROG_TOP=80;// y offset from top of canvas

function startFrogger(){
  frogActive=true;frogRow=FROG_ROWS-1;frogCol=3;frogTimer=0;frogLives=3;frogScore=0;frogLevel=1;
  frogPoops=[];frogComplete=false;frogMsg="DODGE THE POOP!";frogMsgTimer=80;frogMoveDelay=0;
  paused=true;
  spawnFrogPoops();
}

function spawnFrogPoops(){
  frogPoops=[];
  // Each row (except top row = goal, bottom row = start) gets poop obstacles
  // Rows 1..FROG_ROWS-2 are danger rows
  for(var r=1;r<FROG_ROWS-1;r++){
    var count=2+frogLevel+Math.floor(Math.random()*2);
    var dir=(r%2===0)?1:-1;
    var speed=0.3+frogLevel*0.15+Math.random()*0.2;
    for(var i=0;i<count;i++){
      frogPoops.push({
        row:r,
        x:Math.random()*360,
        speed:speed*dir,
        size:frogLevel>=3?16:14
      });
    }
  }
}

function updateFrogger(){
  frogTimer++;
  if(frogMsgTimer>0)frogMsgTimer--;
  if(frogMoveDelay>0)frogMoveDelay--;
  if(frogComplete)return;

  // Move poops horizontally within their row
  frogPoops.forEach(function(p){
    p.x+=p.speed;
    if(p.x<-20)p.x=380;
    if(p.x>380)p.x=-20;
  });

  // Check collision
  if(frogRow>0&&frogRow<FROG_ROWS-1){
    var px=frogCol*FROG_CELLW+FROG_CELLW/2;
    var py=FROG_TOP+frogRow*FROG_CELLH+FROG_CELLH/2;
    frogPoops.forEach(function(p){
      if(p.row!==frogRow)return;
      var dist=Math.abs(p.x-px);
      if(dist<p.size+10){
        frogHit();
      }
    });
  }

  // Win condition: reached top
  if(frogRow===0){
    frogScore+=10+frogLevel*5;
    frogMsg="MADE IT! +"+(10+frogLevel*5)+" pts";frogMsgTimer=80;
    if(frogScore>=50){
      frogComplete=true;
      frogMsg="YOU ESCAPED! K'Dee: "+frogScore+" pts";frogMsgTimer=220;
      // Apply reward: small HP restore
      kdeeHP=Math.min(kdeeMaxHP,kdeeHP+2);updateHUD();
    } else {
      frogLevel++;frogRow=FROG_ROWS-1;frogCol=3;
      spawnFrogPoops();
    }
  }
}

function frogHit(){
  frogLives--;frogRow=FROG_ROWS-1;frogCol=3;
  frogMsg=frogLives>0?"POOP HIT! "+frogLives+" \u2665 left":"GAME OVER!";frogMsgTimer=90;
  if(frogLives<=0){
    frogComplete=true;
    frogMsg="K'Dee slipped. She smells. "+frogScore+" pts";frogMsgTimer=200;
    kdeeHP=Math.max(1,kdeeHP-2);updateHUD();
  }
}

function drawFrogger(c){
  // Sky bg
  var bg=c.createLinearGradient(0,0,0,FROG_TOP+FROG_ROWS*FROG_CELLH);
  bg.addColorStop(0,"#87CEEB");bg.addColorStop(1,"#5a8a40");
  c.fillStyle=bg;c.fillRect(0,0,CW,CH);

  // Title bar
  c.fillStyle="rgba(0,0,0,0.7)";c.fillRect(0,0,CW,FROG_TOP);
  c.fillStyle="#fff";c.font="bold 12px monospace";c.textAlign="center";
  c.fillText("POOP DODGER",CW/2,22);c.textAlign="left";
  c.fillStyle="#2ecc71";c.font="10px monospace";c.textAlign="center";
  c.fillText("Score: "+frogScore+"  Lives: "+"\u2665".repeat(Math.max(0,frogLives))+"  Level: "+frogLevel,CW/2,42);c.textAlign="left";

  // Draw grid rows
  for(var r=0;r<FROG_ROWS;r++){
    var ry=FROG_TOP+r*FROG_CELLH;
    var rh=FROG_CELLH;
    if(r===0){
      // Goal: grass patch
      c.fillStyle="#3a7a20";c.fillRect(0,ry,CW,rh);
      c.fillStyle="#FFD700";c.font="bold 10px monospace";c.textAlign="center";
      c.fillText("\u2605 SAFE ZONE \u2605",CW/2,ry+rh/2+4);c.textAlign="left";
    } else if(r===FROG_ROWS-1){
      // Start zone: path
      c.fillStyle="#7a6a50";c.fillRect(0,ry,CW,rh);
    } else {
      // Danger rows: alternate lawn stripes
      c.fillStyle=(r%2===0)?"#4a8a30":"#5a9a38";c.fillRect(0,ry,CW,rh);
      // Row divider
      c.strokeStyle="rgba(0,0,0,0.1)";c.lineWidth=1;c.beginPath();c.moveTo(0,ry);c.lineTo(CW,ry);c.stroke();
    }
  }

  // Draw poop obstacles
  frogPoops.forEach(function(p){
    var py=FROG_TOP+p.row*FROG_CELLH+FROG_CELLH/2;
    c.font=(p.size*1.4)+"px serif";c.textAlign="center";
    c.fillText("\uD83D\uDCA9",p.x,py+p.size/2);
    c.textAlign="left";
  });

  // Draw K'Dee (frog-mode: cute jumping sprite)
  var kx=frogCol*FROG_CELLW+FROG_CELLW/2;
  var ky=FROG_TOP+frogRow*FROG_CELLH+FROG_CELLH/2;
  var bounce=frogMoveDelay>0?-Math.sin(frogMoveDelay/8*Math.PI)*10:0;
  c.save();c.translate(kx,ky+bounce);
  // Mini K'Dee
  c.fillStyle=P.skin;c.beginPath();c.arc(0,-14,7,0,Math.PI*2);c.fill();
  c.fillStyle=P.hair;c.beginPath();c.arc(0,-18,7,Math.PI,2*Math.PI);c.fill();
  c.fillStyle=P.pink;c.fillRect(-7,-10,14,10);// body
  c.fillStyle="#4169E1";c.fillRect(-7,-2,14,5);// legs
  c.fillStyle=P.eye;c.fillRect(-3,-15,2,2);c.fillRect(1,-15,2,2);
  c.restore();

  // Overlay message
  if(frogMsgTimer>0&&frogMsg){
    var alpha=Math.min(1,frogMsgTimer/20);
    c.save();c.globalAlpha=alpha*0.92;
    var tw=c.measureText(frogMsg).width+20;
    c.font="bold 12px monospace";
    RR(c,CW/2-tw/2,CH/2-26,tw,28,6,"rgba(0,0,0,0.85)");
    c.fillStyle="#FFD700";c.textAlign="center";
    c.fillText(frogMsg,CW/2,CH/2-6);c.textAlign="left";
    c.restore();
  }

  // Done overlay
  if(frogComplete&&frogMsgTimer<150){
    c.fillStyle="rgba(0,0,0,0.6)";c.fillRect(0,CH-60,CW,60);
    c.fillStyle="#FFD700";c.font="bold 11px monospace";c.textAlign="center";
    c.fillText("[ TAP TO CONTINUE ]",CW/2,CH-25);c.textAlign="left";
  }

  // Timer progress bar
  var t=frogTimer;
  var barW=((t%300)/300)*CW;
  c.fillStyle="rgba(255,100,100,0.5)";c.fillRect(0,FROG_TOP-6,barW,4);
}

// Frogger input: swipe direction or tap arrows
var frogSwipeStart=null;
canvas.addEventListener("touchstart",function(e){
  if(!frogActive)return;
  var p=getCanvasCoords(e);frogSwipeStart={x:p.x,y:p.y};
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!frogActive)return;
  e.preventDefault();
  if(frogComplete){
    var msg=frogLives>0?"K'Dee made it through the poop! She smells like victory. +2 HP!":"K'Dee took a tumble. -2 HP. She's fine. Mostly.";
    frogActive=false;paused=false;
    showSimpleDlg("POOP DODGER",msg,frogLives>0?"excited":"hurt");return;
  }
  if(!frogSwipeStart)return;
  var p=getCanvasCoords(e);
  var dx=p.x-frogSwipeStart.x,dy=p.y-frogSwipeStart.y;
  frogSwipeStart=null;
  frogMove(dx,dy);
},{passive:false});

document.addEventListener("keydown",function(e){
  if(!frogActive)return;
  if(e.key==="ArrowUp"||e.key==="w")frogMove(0,-1);
  else if(e.key==="ArrowDown"||e.key==="s")frogMove(0,1);
  else if(e.key==="ArrowLeft"||e.key==="a")frogMove(-1,0);
  else if(e.key==="ArrowRight"||e.key==="d")frogMove(1,0);
  else if(e.key===" "||e.key==="Enter"){
    if(frogComplete){
      var msg=frogLives>0?"K'Dee made it through the poop! She smells like victory. +2 HP!":"K'Dee took a tumble. -2 HP. She's fine. Mostly.";
      frogActive=false;paused=false;
      showSimpleDlg("POOP DODGER",msg,frogLives>0?"excited":"hurt");
    }
  }
});

function frogMove(dx,dy){
  if(frogMoveDelay>0||frogComplete)return;
  if(Math.abs(dx)>Math.abs(dy)){frogCol+=dx>0?1:-1;}else{frogRow+=dy>0?1:-1;}
  frogCol=Math.max(0,Math.min(FROG_COLS-1,frogCol));
  frogRow=Math.max(0,Math.min(FROG_ROWS-1,frogRow));
  frogMoveDelay=10;
}

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
    showSimpleDlg("AVALANCHE!",msg,"excited");
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
  // Frogger: click left/right half to move
  if(frogActive){
    if(frogComplete){
      var msg=frogLives>0?"K'Dee made it through the poop! She smells like victory. +2 HP!":"K'Dee took a tumble. -2 HP. She's fine. Mostly.";
      frogActive=false;paused=false;
      showSimpleDlg("POOP DODGER",msg,frogLives>0?"excited":"hurt");return;
    }
    var p=getCanvasCoords(e);
    if(p.x<CW/2)frogMove(-1,0);else frogMove(1,0);
    return;
  }
  // Racer: click left/right half to lane change
  if(racerActive){
    var p=getCanvasCoords(e);
    if(p.x<CW/2)racerLaneMoveBy(-1);else racerLaneMoveBy(1);
    return;
  }
  // Tetris: click left half = move left, right half = move right
  if(tetActive){
    if(tetOver||tetWon){tetEndGame();return;}
    var p=getCanvasCoords(e);
    if(p.x<CW/2)tetMoveH(-1);else tetMoveH(1);
    return;
  }
  if(paused||gameOver)return;
  var p=getCanvasCoords(e);
  // Check if player clicked on running Holly
  if(hollyRunning&&hollyCatchable&&!hollyTrip){
    var hsc=1.4*30; // approximate catch radius
    if(Math.abs(p.x-hollyX)<hsc&&Math.abs(p.y-hollyY)<hsc){
      hollyTrip=true;hollyTripTimer=60;hollyCatchable=false;
      hollyMsg="";hollyMsgTimer=0;
      return;
    }
  }
  var h=findHS(p.x,p.y);
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
    // Check Holly tap
    if(hollyRunning&&hollyCatchable&&!hollyTrip){
      var hsc=1.4*30;
      if(Math.abs(p.x-hollyX)<hsc&&Math.abs(p.y-hollyY)<hsc){
        hollyTrip=true;hollyTripTimer=60;hollyCatchable=false;hollyMsg="";hollyMsgTimer=0;
        touchStart=null;return;
      }
    }
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

/* --- TURN-BASED BATTLE SYSTEM v2 --- */
/* Cinematic VS splash, attack animations, floating damage, unique character sprites */
var battleActive=false,battleDone={},battleState=null;
var dmgFloats=[];// {x,y,txt,color,life}

var FIGHTERS={
  milo:{
    name:"MILO",title:"THE SOCIAL READER",hp:8,maxHp:8,color:"#3498db",
    hair:"#654321",hairStyle:"shaggy",skin:P.skin,shirt:"#3498db",pants:"#4169E1",short:true,
    idleQuips:["*tugs K'Dee's shirt*","'Mom can you read to me?'","*holds up book dramatically*","'Guess what chapter I'm on!'"],
    attacks:[
      {name:"BOOK REPORT",dmg:0,quips:["Milo gives a full plot summary. All 312 pages.","'So in CHAPTER ONE the main character—' It's a saga.","'The book is SO GOOD and you have to hear all of it RIGHT NOW.'","Milo describes every character's feelings. In detail."]},
      {name:"SHOW DRAWING",dmg:1,quips:["Milo shows a drawing. 'It's you!' It's a blob.","'LOOK WHAT I MADE!' It's actually beautiful.","The drawing is... a dinosaur reading keys? Art."]},
      {name:"HUG LEGS",dmg:1,quips:["Milo bear-hugs K'Dee's legs. She's rooted!","*CLAMP* Milo is now a leg accessory.","'I love you THIS much!' Legs: immobilized."]},
      {name:"BUT MOM",dmg:2,quips:["'But MOOOOOM.' Critical emotional damage!","Milo deploys the puppy eyes. It's super effective!","'But you PROMISED to read with me.' K'Dee feels guilt.","'BUT MOM READ WITH ME.' Three words. Maximum devastation."]}
    ],
    intro:["Milo blocks the doorway with a stack of books.","'MOM! Mom. Mom. Mommy. MOMMM!'","He has something VERY important to share.","It's book-related. Obviously."],
    defeat:["Milo finishes his book summary.","'OK bye mom!' He sprints away with three books.","...blissful silence. Brief. Very brief."],
    itemEffects:{
      banana:{dmg:5,msg:["K'Dee hands Milo the banana.","His eyes go WIDE. 'FOR ME?!'","He peels it and runs off, narrating his banana adventure."],super:true},
      duck:{dmg:6,msg:["K'Dee deploys General Quackers.","Milo GASPS. 'A DUCK!'","He immediately starts a duck army campaign. Battle over."],super:true},
      phone:{dmg:3,msg:["K'Dee shows Milo a game on her phone.","He's hypnotized. Blessed silence."]}
    }
  },
  holly:{
    name:"HOLLY",title:"THE TALL SHADOW",hp:10,maxHp:10,color:"#DDA0DD",
    hair:"#654321",hairStyle:"long",skin:P.skin,shirt:"#DDA0DD",pants:"#8B668B",tall:true,
    idleQuips:["*appears silently behind K'Dee*","*has been standing there for a while*","*blinks slowly*","'...hi.'"],
    attacks:[
      {name:"SILENT APPEAR",dmg:3,quips:["Holly was just... there. She didn't walk over. She was THERE.","K'Dee turns around and Holly is six inches away. How long has she been there?!","Holly materializes from the hallway shadow. Scary-quiet for someone so tall.","She steps out from behind a door she did not just come through. UNSETTLING."]},
      {name:"LONG ARM REACH",dmg:2,quips:["Holly's arms are distractingly long. She reaches something K'Dee thought was safe.","The wingspan is REAL. K'Dee did not account for the wingspan.","Holly stretches and knocks something off a shelf three feet away. From here. Without moving."]},
      {name:"HOVER",dmg:1,quips:["Holly hovers just behind K'Dee's shoulder without saying anything.","She is SO tall she just... looms. Politely. It's very unnerving.","'...do you need help.' It is not a question. It is a fact that Holly will help."]},
      {name:"GENTLE GRIP",dmg:2,quips:["Holly holds K'Dee's wrist very gently. She is stronger than she looks.","The hug is soft. K'Dee is somehow immobilized anyway.","Holly wraps one arm around K'Dee's shoulders and just... doesn't let go. Very calm."]}
    ],
    intro:["K'Dee turns around.","Holly is already there.","She has been there for a while, apparently.","'...hi mom.'","She is very tall."],
    defeat:["Holly gives one slow, solemn nod.","'...okay.'","She drifts silently back down the hall.","K'Dee checks to make sure she's gone. She is. Somehow."],
    itemEffects:{
      towel:{dmg:5,msg:["K'Dee throws the towel.","Holly catches it with one hand without blinking.","'...thank you.' She folds it neatly. Battle confusion reigns."],super:true},
      book:{dmg:4,msg:["K'Dee reads aloud from the parenting book.","Holly sits cross-legged on the floor immediately.","She is TOO TALL for this to work. It works anyway."],super:true}
    }
  },
  greyson:{
    name:"GREYSON",title:"THE FRONTIER SCIENTIST",hp:12,maxHp:12,color:"#e67e22",
    hair:"#8B6914",hairStyle:"dark",moustache:true,skin:P.skin,shirt:"#c9a56c",pants:"#3d2b1f",
    idleQuips:["*strokes moustache thoughtfully*","*adjusts imaginary sheriff badge*","*squints at you like a horizon*","'Yep.'"],
    attacks:[
      {name:"SCIENCE FACT",dmg:1,quips:["'Did you know the average human spends 6 months looking for lost items?' K'Dee's eye twitches.","Greyson recites the chemical formula for stress. It does not help.","'According to my research—' K'Dee cannot take more research.","He holds up a flask. It bubbles ominously. 'It's fine.'"]},
      {name:"MARSHAL STARE",dmg:2,quips:["Greyson gives the thousand-yard western squint. Unsettling.","'I'm gonna need you to calm down, partner.' K'Dee is not calm.","He tilts his hat brim with one finger. Maximum drama. Somehow it works.","The stare says: I have seen things on Mars you wouldn't believe."]},
      {name:"MARTIAN LOGIC",dmg:2,quips:["'On Mars there are no keys because no one has pockets.' K'Dee stares.","'Have you considered relocating to a planet with fewer doors?'","He draws a diagram. It is a map of Mars with Texas borders on it.","'Mars colonists won't have this problem.' GREYSON."]},
      {name:"LASSO THEORY",dmg:1,quips:["Greyson mimes throwing a lasso. Somehow K'Dee trips.","'In the old west, you lost your horse, you walked.' 'GREYSON.'","He narrates the encounter like a nature documentary. K'Dee loses the will to argue."]}
    ],
    intro:["Greyson is at his chemistry set, cowboy hat on.","\u2605 A wanted poster of an alien hangs on the wall.","'Oh hey mom.'","'Greyson I need my keys.'","'Yep. Reckon they're around here somewhere.'"],
    defeat:["Greyson pushes back his hat and nods slowly.","'Respect the hustle, ma.'","'Saw somethin' key-shaped near the garage. Scientifically speaking.'","He turns back to his telescope. Aimed at Mars. Obviously."],
    itemEffects:{
      necronomicon:{dmg:6,msg:["K'Dee holds up the Necronomicon.","Greyson's eyes go wide as saucers.","'IS THAT EXTRATERRESTRIAL IN ORIGIN?!'","He grabs it, starts cross-referencing with his Mars notes. Battle over."],super:true},
      bible:{dmg:5,msg:["'Have you considered... faith over science?'","Greyson.exe has encountered a paradox.","He sits in silence. First time in years."],super:true},
      shovel:{dmg:3,msg:["K'Dee raises the shovel.","'That's regulation frontier equipment, ma.'","'Exactly.' K'Dee is done with this."]}
    }
  },
  gwyneth:{
    name:"GWYNETH",title:"THE STYLISH NARCOLEPTIC",hp:6,maxHp:6,color:P.sky,
    hair:"#4169E1",hairStyle:"long",skin:P.skin,shirt:"#4169E1",pants:"#1a3a7a",narcolepsy:true,
    idleQuips:["*zzzzzzz*","*snore*","*mumbles about unicorns*","*sleep-smiles*"],
    attacks:[
      {name:"*SNORE*",dmg:0,quips:["Gwyneth snores. Somehow this is still stressful.","The snoring intensifies. K'Dee can't focus.","She snores so loud the room vibrates."]},
      {name:"SLEEP TALK",dmg:1,quips:["'The unicorns... need more glitter...'","'No, MR. BUN-BUN, that's MY tiara...'","'Five more minutes...' She's been saying that for 2 hours.","'*mumble* ...the PRINCESS needs her KEYS...' Wait, what?"]},
      {name:"ROLL OVER",dmg:2,quips:["Gwyneth rolls over and lands ON K'Dee's foot.","*THUD* She rolls like a sleepy bowling ball.","She unconsciously rolls toward K'Dee. Homing nap."]},
      {name:"*zzzzz*",dmg:0,quips:["Gwyneth sleeps HARDER. This is honestly impressive.","She achieves a new level of sleep. Transcendent.","The sleeping is aggressive somehow."]}
    ],
    intro:["Gwyneth is lying face-down on the floor.","'Gwyneth? ...Gwyneth?'","*magnificent snoring*","Oh. Narcolepsy nap. Classic Gwyneth."],
    defeat:["Gwyneth wakes up suddenly.","'Oh hi mom! Was I asleep?'","'For the whole battle.' 'What battle?'","'...never mind. Love you, baby.'"],
    itemEffects:{
      phone:{dmg:6,msg:["K'Dee plays an alarm at MAX VOLUME.","Gwyneth LEVITATES off the ground.","'I'M UP! I'M UP! WHAT YEAR IS IT?!'"],super:true},
      banana:{dmg:3,msg:["K'Dee waves banana near Gwyneth's nose.","*sniff sniff* Her eyes flutter.","'Is that... a banana?' Still mostly asleep."]}
    }
  },
  forest:{
    name:"FOREST",title:"DO NOT DISTURB",hp:5,maxHp:5,color:"#556b2f",
    hair:"#F0E68C",hairStyle:"shock",beard:"#c0392b",skin:P.skin,shirt:"#1a1a2e",pants:"#333",
    idleQuips:["*typing intensifies*","*does not look up*","*headphones stay on*","*snack wrapper crinkle*"],
    attacks:[
      {name:"IGNORE",dmg:1,quips:["Forest ignores K'Dee so hard it physically hurts.","*no response* K'Dee is invisible apparently.","He tabs back to his game mid-sentence. K'Dee is defeated.","Maximum ignore. Expert level. Years of practice."]},
      {name:"MUTE",dmg:1,quips:["Forest mutes his mic. AND K'Dee. Somehow.","*headphones on* Your words cannot reach him now.","He puts on noise-canceling headphones. Total blackout."]},
      {name:"WALL OF SILENCE",dmg:2,quips:["The silence is DEAFENING. K'Dee can't think.","He hasn't spoken in 6 hours. This is normal for him.","The quiet is a weapon. Forest has mastered it.","*complete stillness* K'Dee checks if he's breathing. He is."]},
      {name:"SNACK THROW",dmg:2,quips:["An empty energy drink can flies across the room!","SNACK BARRAGE! Empty wrappers everywhere! K'Dee takes snack damage!","He throws Goldfish crackers with alarming precision!","*FLING* A bag of chips hits K'Dee directly. Full bag. Ow."]}
    ],
    intro:["K'Dee opens the door to the bubble den.","Signs: GO AWAY. LOADING. DO NOT DISTURB.","Forest sits inside his gaming dome. Headphones on.","*typing* *not looking up*","'Forest. FOREST.'","*one AirPod removed*","'...what.'"],
    defeat:["Forest removes both headphones. Shocking.","'Did you check the kitchen counter?'","'I saw them like... yesterday maybe.'","*headphones back on* He's gone again."],
    itemEffects:{
      towel:{dmg:4,msg:["K'Dee drapes the towel over Forest's monitor.","'HEY—' He can't see the screen!","'OKAY OKAY I'll help!' Screen dependency: confirmed."],super:true},
      flashlight:{dmg:3,msg:["K'Dee shines the flashlight into the gaming dome.","'THE BRIGHTNESS! MY EYES AREN'T CALIBRATED FOR THIS!'","He covers his screen. Chaos in the den."]},
      bible:{dmg:2,msg:["K'Dee reads healing prayers.","Forest looks up briefly.","'...was that from Proverbs?' Close enough."]}
    }
  },
  daed:{
    name:"DAED",title:"THE ESCAPE ARTIST",hp:1,maxHp:1,color:"#cc0000",
    hair:"#654321",hairStyle:"mullet",truckerHat:true,oily:true,skin:P.skin,shirt:"#555",pants:"#333",
    idleQuips:["*looks at door*","*jingles car keys*","'Well, I should—'","*edges toward exit*"],
    attacks:[
      {name:"ESCAPE!",dmg:0,quips:["Daed is already halfway out the door!","'Gotta check on the Corvette!' *ZOOM*","He moves faster than K'Dee has ever seen him move.","Daed activates dad-escape velocity."]}
    ],
    intro:["Daed appears, covered in car oil.","His mullet flows majestically.","'Oh HIIIIII Mom, I was just—'","'DAED. My keys.'","'Keys? What keys? Gotta go!'"],
    defeat:["Daed vanishes in a cloud of motor oil.","'GOTTA GO! CORVETTE NEEDS ME!'","*door slams* *engine revs* *tires screech*","Classic. Daed."],
    itemEffects:{
      wrench:{dmg:2,msg:["K'Dee brandishes the wrench.","'IS. THIS. YOURS.'","Daed sweats through the oil. Impressive.","'I can explain—' *POOF* He's gone."],super:true}
    }
  },
  demon:{
    name:"BAAL'THAZAR",title:"DEMON OF MILD INCONVENIENCE",hp:16,maxHp:16,color:"#8B0000",
    hair:"#1a0000",hairStyle:"horns",skin:"#c0392b",shirt:"#1a0000",pants:"#0a0000",demon:true,
    idleQuips:["*tail flicks menacingly*","'I have PAPERWORK for you.'","*brimstone smell intensifies*","'Your warranty is expired.'"],
    attacks:[
      {name:"INFERNAL SHRIEK",dmg:2,quips:["BAAL'THAZAR unleashes a bone-rattling shriek! K'Dee's ears ring!","A demonic wail shakes the basement walls! Critical earworm damage!","The shriek contains a catchy jingle. K'Dee can't get it out of her head.","SHRIEK! The pentagram glows. K'Dee is momentarily deaf AND annoyed."]},
      {name:"SOUL CONTRACT",dmg:1,quips:["'Sign HERE.' K'Dee doesn't have her reading glasses. Trap?","A contract materializes. Fine print: infinite. K'Dee is legally confused.","'It's just a standard soul waiver.' It is not standard.","He produces a clipboard. FROM WHERE. K'Dee is disturbed."]},
      {name:"BRIMSTONE BREATH",dmg:3,quips:["BRIMSTONE BREATH! It smells like sulfur AND burnt coffee!","A scorching blast of brimstone! K'Dee's hair frizzes!","'My breath is NOT that bad—' IT IS THAT BAD. K'Dee takes full damage.","The breath hits like a wall. K'Dee considers a breath mint arsenal."]},
      {name:"MILD CURSE",dmg:1,quips:["Baal'thazar curses K'Dee with slightly sticky keys forever.","'May your socks always be slightly damp.' K'Dee is horrified.","A mild hex. K'Dee will stub her toe later. Guaranteed.","Cursed! K'Dee's next grocery run will have one broken cart wheel."]},
      {name:"SUMMON PAPERWORK",dmg:2,quips:["Mountains of bureaucratic hellfire paperwork bury K'Dee!","'Have you filed Form 666-B?' K'Dee has NOT.","An avalanche of infernal paperwork! In TRIPLICATE!","The IRS has NOTHING on this. K'Dee takes critical paperwork damage."]}
    ],
    intro:["K'Dee descends into the basement.","The pentagram glows an angry red.","Candles flare. A shape rises from the shadows.","He's... shorter than expected.","'AT LAST! A MORTAL STANDS BEFORE—'","'Are you the one who keeps moving my Tupperware?'","A long pause.","'...I AM BAAL'THAZAR, DEMON OF MILD—'","'BAAL'THAZAR! MY TUPPERWARE.'","'IT IS AN OFFERING. TECHNICALLY.'"],
    defeat:["Baal'thazar staggers.","'Impossible. My HR rating is EXCELLENT.'","The pentagram flickers and goes dark.","'Fine. Your Tupperware is in the upstairs cabinet.'","'You KNEW where it was this WHOLE TIME?!'","'...goodbye, K'Dee.' He dissolves into sulfur smoke.","The basement smells like burnt toast for a week."],
    itemEffects:{
      necronomicon:{dmg:7,msg:["K'Dee opens the Necronomicon.","Baal'thazar FREEZES.","'Where did you GET that?!'","'The basement.' 'THAT'S MY PROPERTY!'","He's contractually bound to flee. Maximum chaos."],super:true},
      bible:{dmg:6,msg:["K'Dee produces the Bible.","Baal'thazar recoils with theatrical flair.","'NOT THE BOOK! NOT THE BOOOOK!'","He retreats dramatically into the pentagram.","Holy damage: CRITICAL."],super:true},
      shovel:{dmg:4,msg:["K'Dee raises the shovel.","'YOU DUG THE HOLE IN THE BACKYARD!'","Baal'thazar sweats. 'That was... the DOG.'","'THE DOG DOESN'T HAVE OPPOSABLE THUMBS, BAAL'THAZAR.'"],super:true},
      flashlight:{dmg:3,msg:["K'Dee shines the flashlight directly at Baal'thazar.","'AH! MY EYES! SO BRIGHT!'","Demons hate flashlights. Apparently.","He shields his glowing eyes. K'Dee has the advantage."]}
    }
  },
  jesus:{
    name:"SPACE JESUS",title:"LORD OF THE BATHROOM",hp:14,maxHp:14,color:"#FFD700",
    hair:"#8B6914",hairStyle:"long",skin:"#FDBCB4",shirt:"#f0f0f0",pants:"#ddd",halo:true,
    idleQuips:["*radiates warm golden light*","'Bless this mess.'","*looks knowingly at pinup painting*","'Peace be with you, K'Dee.'"],
    attacks:[
      {name:"HOLY LIGHT",dmg:2,quips:["BLINDING RADIANCE! K'Dee can't look directly at him!","Warm holy light floods the bathroom. K'Dee is momentarily stunned.","A golden beam hits K'Dee square in the soul.","Space Jesus glows intensely. K'Dee squints. Critical soul damage!"]},
      {name:"BLESS THE CHAOS",dmg:1,quips:["'This too shall pass, K'Dee.' She somehow feels worse.","Space Jesus blesses the entire house. The chaos doubles.","A divine benediction. The LEGO hurts even more now.","'Have you tried praying about the keys?' It does not help."]},
      {name:"WALK ON WATER",dmg:2,quips:["Space Jesus walks across the golden tub. K'Dee is humbled.","He walks on the holy water. K'Dee slips watching. Ouch.","'Watch this.' He walks on water. K'Dee watches, forgets to dodge."]},
      {name:"DEVIL REMATCH",dmg:3,quips:["Space Jesus flexes, remembering his battle with the devil. POWER SURGES!","He gestures at the Space Jesus vs Devil painting above. Intimidation +100.","'I beat the devil. You're next, K'Dee.' The bathroom trembles.","Space Jesus channels his devil-fighting energy! Maximum holy damage!"]}
    ],
    intro:["K'Dee enters the Jesus Bathroom.","The golden toilet gleams. Candles flicker.","Space Jesus steps out of the painting on the wall.","His halo crackles. The pinup girl waves from her frame.","'K'Dee. You dare disturb my sacred bathroom?'","'I just need my keys, Jesus.'","'...PROVE YOUR WORTH.'"],
    defeat:["Space Jesus nods slowly.","'Your mom energy... it is strong.'","The pinup girl claps from her painting.","'The keys are wherever you left them, obviously.'","'...thanks, Jesus.'","He winks. Returns to the painting.","The bathroom smells like frankincense."],
    itemEffects:{
      bible:{dmg:6,msg:["K'Dee holds up the Bible.","Space Jesus GASPS.","'You... actually READ it?!'","His halo short-circuits.","'Fair enough. You win this round.'"],super:true},
      necronomicon:{dmg:5,msg:["K'Dee opens the Necronomicon.","Space Jesus recoils! 'NOT THE DARK TEXTS!'","'Put that AWAY!' He covers his halo.","Maximum divine discomfort!"],super:true},
      duck:{dmg:3,msg:["K'Dee holds up General Quackers.","'I MADE DUCKS, you know.'","Space Jesus pauses, smiling fondly.","'...OK, that one's cute.'"]}
    }
  }
};

var battleRoomMap={3:"milo",5:"daed",10:"jesus",11:"demon",20:"gwyneth",21:"forest"};
var gwynBattle=false;

function checkBattle(roomIdx){
  var fid=battleRoomMap[roomIdx];
  if(!fid||battleDone[fid])return;
  if(roomIdx===19){setTimeout(function(){startGreysonDialog();},600);return;}
  setTimeout(function(){startBattle(fid);},600);
}

function startGreysonDialog(){
  if(battleDone["greyson"])return;
  setPortraitMode("default");
  var d=document.getElementById("dlg");var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  document.getElementById("dlg-name").textContent="GREYSON";
  document.getElementById("dlg-text").textContent="Greyson is deep in thought at his chemistry set. He tilts his hat without looking up.\n\n'Hey mom. You look... statistically stressed.'";
  var choices=document.getElementById("dlg-choices");
  choices.innerHTML=
    '<div class="dlg-ch" id="gd-keys">🔑 Have you seen my keys?</div>'+
    '<div class="dlg-ch" id="gd-science">🧪 What are you working on?</div>'+
    '<div class="dlg-ch" id="gd-mars">🔴 Tell me about Mars.</div>'+
    '<div class="dlg-ch" id="gd-leave">🚪 Never mind.</div>';
  document.getElementById("dlg-continue").style.display="none";
  document.getElementById("gd-keys").addEventListener("click",function(){
    document.getElementById("dlg-text").textContent="'Keys...' He strokes his moustache. 'Based on historical data and my own field research — garage. Near the Corvette. Scientifically speaking.'\n\n'GREYSON.'\n\n'I said scientifically.'";
    choices.innerHTML='<div class="dlg-ch" id="gd-thanks">Thanks, Greyson.</div>';
    document.getElementById("gd-thanks").addEventListener("click",function(){hideDlg();battleDone["greyson"]=true;});
  });
  document.getElementById("gd-science").addEventListener("click",function(){
    document.getElementById("dlg-text").textContent="His eyes light up. He gestures at three bubbling flasks.\n\n'A compound that theoretically accelerates sock-finding. Currently also turns things orange. Unrelated.'\n\nHe holds up his hand. It is orange.";
    choices.innerHTML='<div class="dlg-ch" id="gd-back">...okay then.</div>';
    document.getElementById("gd-back").addEventListener("click",function(){startGreysonDialog();});
  });
  document.getElementById("gd-mars").addEventListener("click",function(){
    document.getElementById("dlg-text").textContent="He slowly swivels his chair to face you fully. He removes his hat.\n\n'...I thought you'd never ask.'\n\nFifteen minutes later. You know more about Mars than NASA. You feel changed.\n\n'Anyway. Garage. Keys. Go.'";
    choices.innerHTML='<div class="dlg-ch" id="gd-done">I need a moment.</div>';
    document.getElementById("gd-done").addEventListener("click",function(){hideDlg();battleDone["greyson"]=true;});
  });
  document.getElementById("gd-leave").addEventListener("click",function(){hideDlg();battleDone["greyson"]=true;});
}

function startBattle(fighterId){
  var f=FIGHTERS[fighterId];if(!f)return;
  battleActive=true;paused=true;dmgFloats=[];
  battleState={
    id:fighterId,fighter:f,enemyHP:f.hp,
    turnCount:0,shakeTimer:0,shakeX:0,
    flashTimer:0,flashColor:"",
    kdeeAnim:0,enemyAnim:0,
    phase:"vsIntro",vsTimer:90,// VS splash
    introLine:0,introTimer:0,
    msg:"",msgLines:[],
    kdeePose:"idle",kdeeActionTimer:0,
    enemyPose:"idle",enemyActionTimer:0,
    quipIdx:0
  };
}

function rPick(arr){return arr[Math.floor(Math.random()*arr.length)];}

/* ===== PORTRAIT ANIMATION SYSTEM =====
   Draws animated K'Dee in the dialog portrait canvas with reaction-specific expressions.
   Reactions: look, use, take, talk, open, push, key, spooky, food, sacred, hurt, excited
*/
var portraitCanvas=null,portraitCtx=null,portraitAnim=null,portraitMode="look",portraitTick=0;

// Per-hotspot category → reaction mode
var HOTSPOT_REACTIONS={
  // Food / tasty items
  banana:"food",fridge:"food",sink:"curious",stove:"use",
  // Spooky / forbidden
  necronomicon:"spooky",penta:"spooky",skull:"spooky",crystal:"spooky",
  // Sacred
  jcross:"sacred",jport:"sacred",jbible:"sacred",jbattle:"sacred",jpinup:"sacred",jtub:"sacred",
  // Keys
  plant:"excited",couch:"excited",car:"excited",nightstand:"excited",
  // Picking up things
  duck:"excited",bible:"excited",
  // Phones & tech
  phone:"phone",tv:"use",gpc:"use",gpc2:"use",
  // People / talk
  dino:"talk",gnome:"spooky",cat:"talk",dog:"talk",
  // Heavy lifting / pushing
  clothespile:"push",laundry:"push",rice:"push",myst:"push",
  // Mirror = vain
  mirror:"mirror",vmirror:"mirror",mirror2:"mirror",gymmirror:"mirror",
  // Stairs
  stairs:"excited",ustairsF:"excited",bstairs:"excited",bstairsU:"excited",
  // Default look/open/use handled by verb
};

function initPortrait(){
  portraitCanvas=document.getElementById("dlg-portrait-canvas");
  if(!portraitCanvas)return;
  portraitCtx=portraitCanvas.getContext("2d");
  startPortraitLoop();
}

function startPortraitLoop(){
  if(portraitAnim)cancelAnimationFrame(portraitAnim);
  function loop(){
    portraitTick++;
    if(portraitCanvas&&document.getElementById("dlg").classList.contains("on")){
      drawPortrait(portraitCtx,portraitMode,portraitTick);
    }
    portraitAnim=requestAnimationFrame(loop);
  }
  portraitAnim=requestAnimationFrame(loop);
}

function setPortraitMode(mode){
  portraitMode=mode;portraitTick=0;
  var portrait=document.getElementById("dlg-portrait");
  if(!portrait)return;
  // Border color by mode
  var colors={
    look:"#FFD700",use:"#00CED1",take:"#FFD700",talk:"#FF69B4",open:"#FF8C00",
    push:"#CD5C5C",key:"#FFD700",spooky:"#9B59B6",food:"#2ecc71",sacred:"#FFD700",
    phone:"#00CED1",mirror:"#FF69B4",excited:"#FFD700",curious:"#00CED1",hurt:"#e74c3c"
  };
  portrait.style.borderColor=colors[mode]||"#FFD700";
  // Glow by mode
  var glows={spooky:"rgba(155,89,182,0.4)",sacred:"rgba(255,215,0,0.5)",key:"rgba(255,215,0,0.6)",excited:"rgba(255,215,0,0.5)",hurt:"rgba(231,76,60,0.4)"};
  portrait.style.boxShadow="0 0 16px "+(glows[mode]||"rgba(255,215,0,0.15)");
}

function drawPortrait(c,mode,t){
  if(!c)return;
  c.clearRect(0,0,60,60);

  // Background gradient by mode
  var bgColors={
    look:"#1a0a2e",use:"#0a2a3e",take:"#1a1a0e",talk:"#2e0a1e",open:"#1a0a0a",
    push:"#2e1a0a",key:"#2a2000",spooky:"#1a0a2e",food:"#0a1a0a",sacred:"#2a1a00",
    phone:"#0a1a2e",mirror:"#1a0a1e",excited:"#1a1400",curious:"#0a1a2e",hurt:"#2e0a0a"
  };
  c.fillStyle=bgColors[mode]||"#1a0a2e";c.fillRect(0,0,60,60);

  // Soft radial bg glow
  var glowC={spooky:"rgba(155,89,182,0.2)",sacred:"rgba(255,215,0,0.15)",key:"rgba(255,215,0,0.2)",food:"rgba(46,204,113,0.15)",hurt:"rgba(231,76,60,0.2)"};
  if(glowC[mode]){var g=c.createRadialGradient(30,35,2,30,35,28);g.addColorStop(0,glowC[mode]);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,0,60,60);}

  // Draw K'Dee portrait at center
  var bob=Math.sin(t*0.08)*1.2;
  var tilt=0,eyeW=3,eyeH=3,mouthType="smile",blush=false,sweat=false,sparkle=false,wide=false,headTilt=0,armUp=false,armOut=false,brows="normal";

  if(mode==="look"){tilt=Math.sin(t*0.06)*3;brows="curious";}
  else if(mode==="use"){armUp=true;brows="determined";}
  else if(mode==="take"){mouthType="grin";sparkle=true;brows="happy";}
  else if(mode==="talk"){mouthType=Math.floor(t/6)%2===0?"open":"smile";brows="curious";}
  else if(mode==="open"){wide=true;mouthType="o";brows="surprised";}
  else if(mode==="push"){bob+=Math.sin(t*0.3)*2;brows="strain";sweat=true;mouthType="strain";}
  else if(mode==="key"){sparkle=true;mouthType="grin";bob=Math.sin(t*0.15)*3;brows="happy";}
  else if(mode==="spooky"){wide=true;mouthType="o";bob+=Math.sin(t*0.1)*0.5;brows="scared";}
  else if(mode==="food"){mouthType=Math.floor(t/8)%3===0?"open":"smile";blush=true;brows="happy";}
  else if(mode==="sacred"){bob=Math.sin(t*0.04)*0.8;brows="amazed";sparkle=true;mouthType="o";}
  else if(mode==="phone"){armUp=true;mouthType=Math.floor(t/10)%2===0?"open":"smile";brows="curious";}
  else if(mode==="mirror"){blush=true;mouthType="smile";brows="pleased";tilt=Math.sin(t*0.05)*2;}
  else if(mode==="excited"){bob=Math.sin(t*0.15)*3;sparkle=true;mouthType="grin";brows="happy";blush=true;}
  else if(mode==="curious"){tilt=Math.sin(t*0.07)*4;brows="curious";mouthType="hmm";}
  else if(mode==="hurt"){bob+=Math.sin(t*0.3)*2;brows="pain";mouthType="pain";wide=true;}

  // === DRAW K'DEE PORTRAIT ===
  c.save();c.translate(30,42+bob);c.rotate(tilt*Math.PI/180);

  // Body
  var bodyColor="#FF69B4";
  if(mode==="push")bodyColor="#FF85C8";
  c.fillStyle=bodyColor;c.beginPath();
  c.moveTo(-8,-12);c.lineTo(-9,-2);c.lineTo(9,-2);c.lineTo(8,-12);c.closePath();c.fill();
  D(c,-1,-11,2,8,"#FF85C8");// shirt detail

  // Arms
  if(armUp){
    D(c,-12,-16,4,8,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(-10,-8,3,0,Math.PI*2);c.fill();
    D(c,8,-20,4,12,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(10,-8,3,0,Math.PI*2);c.fill();
  } else if(mode==="push"||mode==="take"){
    var aoff=Math.min(t*0.3,6);
    D(c,-12,-14+aoff,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(-10,-4,3,0,Math.PI*2);c.fill();
    D(c,8,-14-aoff,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(10,-4,3,0,Math.PI*2);c.fill();
  } else {
    D(c,-12,-14,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(-10,-4,3,0,Math.PI*2);c.fill();
    D(c,8,-14,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(10,-4,3,0,Math.PI*2);c.fill();
  }

  // Head
  c.fillStyle="#FDBCB4";c.beginPath();c.arc(0,-22,10,0,Math.PI*2);c.fill();

  // Hair
  c.fillStyle="#F0E68C";c.beginPath();c.arc(0,-27,10,Math.PI,2*Math.PI);c.fill();
  D(c,-10,-26,5,10,"#F0E68C");D(c,5,-26,5,10,"#F0E68C");
  // Hair shine
  c.fillStyle="rgba(255,255,200,0.3)";c.beginPath();c.arc(3,-29,4,0,Math.PI*2);c.fill();

  // Eyebrows
  c.strokeStyle="#8B6914";c.lineWidth=1.5;
  if(brows==="normal"||brows==="pleased"){c.beginPath();c.moveTo(-7,-24);c.lineTo(-3,-24);c.stroke();c.beginPath();c.moveTo(3,-24);c.lineTo(7,-24);c.stroke();}
  else if(brows==="curious"){c.beginPath();c.moveTo(-7,-25);c.quadraticCurveTo(-5,-23,-3,-24);c.stroke();c.beginPath();c.moveTo(3,-24);c.lineTo(7,-24);c.stroke();}
  else if(brows==="happy"){c.beginPath();c.moveTo(-7,-25);c.quadraticCurveTo(-5,-26,-3,-25);c.stroke();c.beginPath();c.moveTo(3,-25);c.quadraticCurveTo(5,-26,7,-25);c.stroke();}
  else if(brows==="determined"){c.beginPath();c.moveTo(-7,-25);c.lineTo(-3,-26);c.stroke();c.beginPath();c.moveTo(3,-26);c.lineTo(7,-25);c.stroke();}
  else if(brows==="surprised"||brows==="amazed"||brows==="scared"){c.beginPath();c.moveTo(-7,-26);c.quadraticCurveTo(-5,-28,-3,-27);c.stroke();c.beginPath();c.moveTo(3,-27);c.quadraticCurveTo(5,-28,7,-26);c.stroke();}
  else if(brows==="strain"){c.beginPath();c.moveTo(-7,-24);c.lineTo(-3,-26);c.stroke();c.beginPath();c.moveTo(3,-26);c.lineTo(7,-24);c.stroke();}
  else if(brows==="pain"){c.beginPath();c.moveTo(-7,-24);c.lineTo(-3,-26);c.stroke();c.beginPath();c.moveTo(3,-26);c.lineTo(7,-24);c.stroke();}

  // Eyes
  var ew=wide?4:3,eh=wide?4:3;
  if(mode==="spooky"||mode==="hurt")eh=4;
  c.fillStyle="#fff";c.fillRect(-6,-23,ew+1,eh+1);c.fillRect(2,-23,ew+1,eh+1);
  var eyeCol=(mode==="spooky"||mode==="hurt")?"#e74c3c":"#00AA44";
  c.fillStyle=eyeCol;c.fillRect(-5,-22,ew-1,eh-1);c.fillRect(3,-22,ew-1,eh-1);
  c.fillStyle="#fff";c.fillRect(-5,-23,1,1);c.fillRect(3,-23,1,1);

  // Mouth
  c.strokeStyle="#e75480";c.lineWidth=1.2;
  if(mouthType==="smile"){c.beginPath();c.arc(0,-17,4,0.1*Math.PI,0.9*Math.PI);c.stroke();}
  else if(mouthType==="grin"){c.beginPath();c.arc(0,-16,5,0.05*Math.PI,0.95*Math.PI);c.stroke();c.fillStyle="#e75480";c.fill();}
  else if(mouthType==="open"||mouthType==="o"){c.fillStyle="#c0392b";c.beginPath();c.arc(0,-17,3,0,Math.PI*2);c.fill();}
  else if(mouthType==="hmm"){c.beginPath();c.moveTo(-3,-16);c.lineTo(3,-16);c.stroke();}
  else if(mouthType==="strain"){c.beginPath();c.moveTo(-4,-16);c.quadraticCurveTo(0,-14,4,-16);c.stroke();}
  else if(mouthType==="pain"){c.beginPath();c.moveTo(-4,-15);c.quadraticCurveTo(0,-17,4,-15);c.stroke();}

  // Blush
  if(blush){c.save();c.globalAlpha=0.25;c.fillStyle="#FF69B4";c.beginPath();c.ellipse(-7,-19,4,2,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(7,-19,4,2,0,0,Math.PI*2);c.fill();c.restore();}

  // Sweat drop
  if(sweat&&Math.floor(t/20)%2===0){c.fillStyle="#87CEEB";c.beginPath();c.moveTo(12,-28);c.quadraticCurveTo(14,-26,12,-24);c.closePath();c.fill();}

  c.restore();

  // Sparkles around portrait
  if(sparkle){
    var sparkPositions=[[10,8],[50,10],[8,50],[52,52],[30,5],[5,30]];
    sparkPositions.forEach(function(sp,si){
      var phase=t*0.15+si*1.1;
      var alpha=0.4+0.4*Math.sin(phase);
      var sz=1+Math.sin(phase*1.3)*0.8;
      c.save();c.globalAlpha=alpha;c.fillStyle="#FFD700";
      c.beginPath();c.arc(sp[0],sp[1],sz,0,Math.PI*2);c.fill();
      c.restore();
    });
  }

  // Special overlays
  if(mode==="spooky"){
    c.save();c.globalAlpha=0.08+0.06*Math.sin(t*0.1);c.fillStyle="#9B59B6";c.fillRect(0,0,60,60);c.restore();
  }
  if(mode==="sacred"){
    c.save();c.globalAlpha=0.06+0.04*Math.sin(t*0.08);c.fillStyle="#FFD700";c.fillRect(0,0,60,60);c.restore();
    // Halo
    c.save();c.globalAlpha=0.4+0.2*Math.sin(t*0.1);
    c.strokeStyle="#FFD700";c.lineWidth=1.5;c.beginPath();c.arc(30,16,8,0,Math.PI*2);c.stroke();
    c.restore();
  }
  if(mode==="key"){
    // Key sparkle trail
    c.save();c.globalAlpha=0.6+0.3*Math.sin(t*0.2);
    c.fillStyle="#FFD700";c.font="bold 12px serif";c.textAlign="center";
    c.fillText("\uD83D\uDD11",30,56);
    c.restore();
  }
  if(mode==="phone"){
    c.save();c.fillStyle="#222";c.fillRect(22,8,16,24);c.fillStyle="#1a3a5a";c.fillRect(23,9,14,20);
    c.fillStyle="rgba(0,200,255,0.5)";c.font="5px monospace";c.textAlign="center";c.fillText("bzz",30,20);
    c.restore();
  }
}

// Determine portrait mode from hotspot id and verb
function getPortraitMode(hid,verb){
  // Special per-hotspot overrides
  if(HOTSPOT_REACTIONS[hid])return HOTSPOT_REACTIONS[hid];
  // Fallback by verb
  var verbModes={look:"look",use:"use",take:"take",talk:"talk",open:"open",push:"push"};
  return verbModes[verb]||"look";
}
function drawBattleKdee(c,x,y,pose,timer){
  var t=timer||0;
  var bob=Math.sin(frameTick*0.05)*1.5;
  var sc=1.8;// battle scale
  c.save();c.translate(x,y);c.scale(sc,sc);
  var ax=0,ay=0;

  // Action offsets
  if(pose==="slap"){ax=Math.min(t*2,12);var sw=Math.sin(t*0.8)*8;}
  if(pose==="nag"){var nag=Math.sin(t*0.5)*3;}
  if(pose==="purse"){ax=Math.min(t*1.5,8);var pw=Math.sin(t*0.6)*15;}
  if(pose==="item"){var glow=0.3+0.3*Math.sin(t*0.3);}
  if(pose==="hurt"){ax=Math.sin(t*2)*4;bob+=2;}

  // Shadow
  c.save();c.globalAlpha=0.18;c.fillStyle="#000";
  c.beginPath();c.ellipse(ax,2,10,3,0,0,Math.PI*2);c.fill();c.restore();

  // Legs
  var lk=pose==="hurt"?Math.sin(t)*2:0;
  D(c,ax-4+lk,-3+bob,4,6,"#4169E1");D(c,ax+1-lk,-3+bob,4,6,"#4169E1");
  D(c,ax-5+lk,2+bob,5,3,"#333");D(c,ax+1-lk,2+bob,5,3,"#333");

  // Body
  c.fillStyle=P.pink;c.beginPath();
  c.moveTo(ax-7,-12+bob);c.lineTo(ax-8,-3+bob);c.lineTo(ax+8,-3+bob);c.lineTo(ax+7,-12+bob);
  c.closePath();c.fill();
  D(c,ax-1,-10+bob,2,7,"#FF85C8");
  D(c,ax-7,-5+bob,14,4,"#4169E1");

  // Arms
  if(pose==="slap"&&t>0){
    // Slap arm extended
    c.save();c.translate(ax+7,-12+bob);c.rotate(-0.5+sw*0.05);
    D(c,0,0,4,12,P.pink);c.fillStyle=P.skin;c.beginPath();c.arc(2,13,2.5,0,Math.PI*2);c.fill();
    c.restore();
    D(c,ax-10,-12+bob,4,10,P.pink);
  }else if(pose==="purse"&&t>0){
    // Purse swing
    c.save();c.translate(ax+7,-12+bob);c.rotate(-0.8+(pw||0)*0.03);
    D(c,0,0,4,14,P.pink);
    // Purse
    RR(c,-2,12,10,8,2,"#8B4513");D(c,-1,10,8,2,P.gold);
    c.restore();
    D(c,ax-10,-12+bob,4,10,P.pink);
  }else if(pose==="nag"&&t>0){
    // Wagging finger
    c.save();c.translate(ax+7,-12+bob);c.rotate(-0.3);
    D(c,0,0,4,10,P.pink);c.fillStyle=P.skin;c.beginPath();c.arc(2,11,2.5,0,Math.PI*2);c.fill();
    // Finger up
    D(c,1,7,2,5,P.skin);
    c.restore();
    D(c,ax-10,-12+bob+(nag||0),4,10,P.pink);
  }else if(pose==="item"&&t>0){
    D(c,ax-10,-12+bob,4,10,P.pink);
    c.save();c.translate(ax+7,-14+bob);
    D(c,0,0,4,10,P.pink);
    // Glowing item
    c.fillStyle="rgba(0,206,209,"+(glow||0.3)+")";
    c.beginPath();c.arc(3,0,6,0,Math.PI*2);c.fill();
    c.restore();
  }else{
    D(c,ax-10,-12+bob,4,10,P.pink);D(c,ax+6,-12+bob,4,10,P.pink);
    c.fillStyle=P.skin;
    c.beginPath();c.arc(ax-8,-2+bob,2.5,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(ax+8,-2+bob,2.5,0,Math.PI*2);c.fill();
  }

  // Head
  c.fillStyle=P.skin;c.beginPath();c.arc(ax,-20+bob,9,0,Math.PI*2);c.fill();
  // Hair
  c.fillStyle=P.hair;c.beginPath();c.arc(ax,-24+bob,9,Math.PI,2*Math.PI);c.fill();
  D(c,ax-9,-23+bob,4,9,P.hair);D(c,ax+5,-23+bob,4,9,P.hair);
  c.fillStyle="rgba(255,255,200,0.25)";c.beginPath();c.arc(ax+3,-26+bob,3,0,Math.PI*2);c.fill();
  // Eyes
  if(pose==="hurt"){
    c.strokeStyle="#333";c.lineWidth=1;
    c.beginPath();c.moveTo(ax-5,-21+bob);c.lineTo(ax-2,-19+bob);c.moveTo(ax-2,-21+bob);c.lineTo(ax-5,-19+bob);c.stroke();
    c.beginPath();c.moveTo(ax+2,-21+bob);c.lineTo(ax+5,-19+bob);c.moveTo(ax+5,-21+bob);c.lineTo(ax+2,-19+bob);c.stroke();
  }else if(pose==="nag"){
    // Angry eyes
    c.fillStyle="#fff";c.fillRect(ax-5,-21+bob,4,3);c.fillRect(ax+1,-21+bob,4,3);
    c.fillStyle=P.eye;c.fillRect(ax-4,-20+bob,2,2);c.fillRect(ax+2,-20+bob,2,2);
    // Angry brows
    c.strokeStyle="#333";c.lineWidth=1;
    c.beginPath();c.moveTo(ax-6,-23+bob);c.lineTo(ax-2,-22+bob);c.stroke();
    c.beginPath();c.moveTo(ax+6,-23+bob);c.lineTo(ax+2,-22+bob);c.stroke();
  }else{
    c.fillStyle="#fff";c.fillRect(ax-5,-21+bob,4,3);c.fillRect(ax+1,-21+bob,4,3);
    c.fillStyle=P.eye;c.fillRect(ax-4,-20+bob,2,2);c.fillRect(ax+2,-20+bob,2,2);
    c.fillStyle="#fff";c.fillRect(ax-4,-21+bob,1,1);c.fillRect(ax+2,-21+bob,1,1);
  }
  // Mouth
  if(pose==="nag"){
    c.fillStyle="#333";c.beginPath();c.arc(ax,-15+bob,2,0,Math.PI*2);c.fill();
  }else if(pose==="hurt"){
    c.strokeStyle="#333";c.lineWidth=1;c.beginPath();c.arc(ax,-14+bob,2,Math.PI+0.3,2*Math.PI-0.3);c.stroke();
  }else{
    c.strokeStyle=P.pink;c.lineWidth=1;c.beginPath();c.arc(ax,-15+bob,3,0.1*Math.PI,0.9*Math.PI);c.stroke();
  }

  c.restore();
}

function drawBattleEnemy(c,f,x,y,pose,timer,anim){
  var t=timer||0;
  var bob=Math.sin(anim*0.04)*2;
  var sc=1.8;
  var h=f.short?-3:f.tall?5:0;
  var shake=battleState&&battleState.shakeTimer>0?Math.sin(battleState.shakeTimer*2)*4:0;

  c.save();c.translate(x+shake,y);c.scale(sc,sc);

  if(f.narcolepsy){bob=0;} // sleeping = no bob

  // Shadow
  c.save();c.globalAlpha=0.15;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,2+h/2,10,3,0,0,Math.PI*2);c.fill();c.restore();

  // --- SPECIAL: Gwyneth lying down ---
  if(f.narcolepsy){
    // Horizontal body
    c.save();c.rotate(Math.PI/2*0.15);// slight angle
    D(c,-14,-2,28,7,f.shirt);// body
    D(c,-16,-2,5,6,f.pants);D(c,11,-2,5,6,f.pants);// legs
    D(c,-17,3,4,3,"#333");D(c,12,3,4,3,"#333");// shoes
    // Head
    c.fillStyle=f.skin;c.beginPath();c.arc(-6,-10,8,0,Math.PI*2);c.fill();
    c.fillStyle=f.hair;c.beginPath();c.arc(-6,-14,8,Math.PI,2*Math.PI);c.fill();
    D(c,-14,-14,4,12,f.hair);D(c,0,-14,4,10,f.hair);
    // Closed eyes
    c.strokeStyle="#333";c.lineWidth=0.8;
    c.beginPath();c.arc(-9,-10,2,0,Math.PI);c.stroke();
    c.beginPath();c.arc(-3,-10,2,0,Math.PI);c.stroke();
    c.restore();
    // Zzz
    c.fillStyle="rgba(100,150,255,0.6)";c.font="bold 7px monospace";
    var zb=Math.sin(anim*0.03)*3;
    c.fillText("z",8,-16+zb);c.font="bold 5px monospace";c.fillText("z",14,-22+zb);c.font="bold 3px monospace";c.fillText("z",18,-26+zb);
    c.restore();
    return;
  }

  // --- SPECIAL: Forest in bed ---
  if(f.beard&&f.hairStyle==="shock"){
    // Blanket/bed
    RR(c,-16,-2,32,10,3,"#8a8a70");
    // Pillow
    RR(c,-14,-7,12,6,2,"#ddd");
    // Head poking out
    c.fillStyle=f.skin;c.beginPath();c.arc(-4,-14,8,0,Math.PI*2);c.fill();
    // Shock of blonde hair
    c.fillStyle=f.hair;
    c.beginPath();c.arc(-4,-18,8,Math.PI,2*Math.PI);c.fill();
    for(var sp=0;sp<5;sp++){c.beginPath();c.moveTo(-11+sp*3.5,-21);c.lineTo(-9.5+sp*3.5,-27-sp%2*2);c.lineTo(-8+sp*3.5,-21);c.closePath();c.fill();}
    // Red beard
    c.fillStyle=f.beard;c.beginPath();c.moveTo(-9,-9);c.quadraticCurveTo(-4,-2,1,-9);c.fill();
    // Sick eyes (droopy)
    c.fillStyle="#fff";c.fillRect(-7,-15,3,2);c.fillRect(-1,-15,3,2);
    c.fillStyle="#333";c.fillRect(-6,-15,2,2);c.fillRect(0,-15,2,2);
    // Red nose
    c.fillStyle="#e74c3c";c.beginPath();c.arc(-3,-12,2,0,Math.PI*2);c.fill();
    // Tissues around
    c.fillStyle="#fff";
    c.fillRect(6,-4,5,3);c.fillRect(10,-6,4,3);c.fillRect(14,-2,4,3);
    // Thermometer
    D(c,-14,-9,2,8,"#ccc");c.fillStyle="#e74c3c";c.beginPath();c.arc(-13,-10,1.5,0,Math.PI*2);c.fill();
    c.restore();
    return;
  }

  // --- SPECIAL: Demon (Baal'thazar) ---
  if(f.demon){
    var atk=(pose==="attack"&&t>0);
    var ax=atk?-Math.min(t*1.5,8):0;
    var rage=atk?Math.sin(t*0.5)*3:0;

    // Brimstone glow behind demon
    c.save();c.globalAlpha=0.12+0.08*Math.sin(anim*0.05);c.fillStyle="#8B0000";
    c.beginPath();c.arc(ax,0,28,0,Math.PI*2);c.fill();c.restore();

    // Shadow (red-tinted)
    c.save();c.globalAlpha=0.2;c.fillStyle="#4a0000";
    c.beginPath();c.ellipse(ax,3,12,4,0,0,Math.PI*2);c.fill();c.restore();

    // Tail (animated)
    var tailSwing=Math.sin(anim*0.07)*8;
    c.strokeStyle="#6B0000";c.lineWidth=2;
    c.beginPath();
    c.moveTo(ax+4,-2+bob);
    c.quadraticCurveTo(ax+18,-8+bob+tailSwing,ax+22,-18+bob+tailSwing);
    c.stroke();
    // Tail tip (arrow)
    c.fillStyle="#6B0000";
    c.beginPath();c.arc(ax+22,-18+bob+tailSwing,3,0,Math.PI*2);c.fill();

    // Legs
    D(c,ax-4,-3+bob,4,8,"#0a0000");D(c,ax+1,-3+bob,4,8,"#0a0000");
    // Hooves
    c.fillStyle="#1a0000";c.beginPath();c.ellipse(ax-2,4+bob,4,2.5,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(ax+3,4+bob,4,2.5,0,0,Math.PI*2);c.fill();

    // Body (dark robe-like)
    c.fillStyle="#1a0000";c.beginPath();
    c.moveTo(ax-8,-12+bob);c.lineTo(ax-9,-2+bob);c.lineTo(ax+9,-2+bob);c.lineTo(ax+8,-12+bob);
    c.closePath();c.fill();
    // Robe highlights (dark red)
    c.fillStyle="rgba(139,0,0,0.4)";c.fillRect(ax-2,-11+bob,2,9);

    // Wings (folded behind, tips visible)
    c.fillStyle="rgba(80,0,0,0.7)";
    c.beginPath();c.moveTo(ax-8,-12+bob);c.quadraticCurveTo(ax-22,-22+bob+rage,ax-18,-4+bob);c.lineTo(ax-8,-5+bob);c.closePath();c.fill();
    c.beginPath();c.moveTo(ax+8,-12+bob);c.quadraticCurveTo(ax+22,-22+bob-rage,ax+18,-4+bob);c.lineTo(ax+8,-5+bob);c.closePath();c.fill();
    // Wing membrane lines
    c.strokeStyle="rgba(139,0,0,0.4)";c.lineWidth=0.8;
    c.beginPath();c.moveTo(ax-8,-10+bob);c.lineTo(ax-18,-8+bob);c.stroke();
    c.beginPath();c.moveTo(ax-8,-7+bob);c.lineTo(ax-16,-3+bob);c.stroke();
    c.beginPath();c.moveTo(ax+8,-10+bob);c.lineTo(ax+18,-8+bob);c.stroke();
    c.beginPath();c.moveTo(ax+8,-7+bob);c.lineTo(ax+16,-3+bob);c.stroke();

    // Arms
    if(atk){
      c.save();c.translate(ax-8,-12+bob);c.rotate(0.5-t*0.08);
      D(c,0,0,4,12,"#c0392b");c.fillStyle="#8B0000";c.beginPath();c.arc(2,13,3,0,Math.PI*2);c.fill();
      // Claw fingers
      c.strokeStyle="#6B0000";c.lineWidth=1;
      for(var cl=0;cl<3;cl++){c.beginPath();c.moveTo(0+cl*2,12);c.lineTo(-1+cl*2,18);c.stroke();}
      c.restore();
    }else{
      D(c,ax-10,-12+bob,4,11,"#c0392b");
      D(c,ax+6,-12+bob,4,11,"#c0392b");
    }
    // Clawed hands at rest
    c.strokeStyle="#6B0000";c.lineWidth=1;
    if(!atk){
      for(var cl=0;cl<3;cl++){c.beginPath();c.moveTo(ax-9+cl,-1+bob);c.lineTo(ax-10+cl,4+bob);c.stroke();}
      for(var cl=0;cl<3;cl++){c.beginPath();c.moveTo(ax+6+cl,-1+bob);c.lineTo(ax+5+cl,4+bob);c.stroke();}
    }

    // Head (red, angular)
    c.fillStyle=f.skin;c.beginPath();c.arc(ax,-20+bob,9,0,Math.PI*2);c.fill();

    // HORNS (big, curving)
    c.fillStyle="#1a0000";
    c.beginPath();c.moveTo(ax-6,-26+bob);c.quadraticCurveTo(ax-14,-38+bob,ax-9,-44+bob);c.quadraticCurveTo(ax-7,-40+bob,ax-4,-28+bob);c.closePath();c.fill();
    c.beginPath();c.moveTo(ax+6,-26+bob);c.quadraticCurveTo(ax+14,-38+bob,ax+9,-44+bob);c.quadraticCurveTo(ax+7,-40+bob,ax+4,-28+bob);c.closePath();c.fill();
    // Horn shine
    c.fillStyle="rgba(139,0,0,0.3)";
    c.beginPath();c.moveTo(ax-6,-27+bob);c.quadraticCurveTo(ax-10,-34+bob,ax-8,-40+bob);c.quadraticCurveTo(ax-6,-36+bob,ax-5,-28+bob);c.closePath();c.fill();

    // Glowing eyes (always lit)
    var eyeGlow=0.7+0.3*Math.sin(anim*0.08);
    c.save();c.globalAlpha=eyeGlow;c.fillStyle="#FF4500";
    c.beginPath();c.ellipse(ax-3,-21+bob,3,2,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(ax+3,-21+bob,3,2,0,0,Math.PI*2);c.fill();
    c.restore();
    // Bright centers
    c.fillStyle="#FFD700";
    c.beginPath();c.arc(ax-3,-21+bob,1.2,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(ax+3,-21+bob,1.2,0,Math.PI*2);c.fill();

    // Menacing mouth / fangs
    if(atk){
      c.fillStyle="#0a0000";c.beginPath();c.arc(ax,-14+bob,4,0,Math.PI);c.fill();
      // Fangs
      c.fillStyle="#fff";
      c.beginPath();c.moveTo(ax-3,-14+bob);c.lineTo(ax-2,-18+bob);c.lineTo(ax-1,-14+bob);c.closePath();c.fill();
      c.beginPath();c.moveTo(ax+1,-14+bob);c.lineTo(ax+2,-18+bob);c.lineTo(ax+3,-14+bob);c.closePath();c.fill();
    }else{
      c.strokeStyle="#6B0000";c.lineWidth=1;
      c.beginPath();c.arc(ax,-14+bob,3,0.1*Math.PI,0.9*Math.PI);c.stroke();
      // Subtle fangs at rest
      c.fillStyle="#ddd";
      c.beginPath();c.moveTo(ax-2,-14+bob);c.lineTo(ax-1.5,-17+bob);c.lineTo(ax-1,-14+bob);c.closePath();c.fill();
      c.beginPath();c.moveTo(ax+1,-14+bob);c.lineTo(ax+1.5,-17+bob);c.lineTo(ax+2,-14+bob);c.closePath();c.fill();
    }

    // Floating ember particles around demon
    for(var em=0;em<4;em++){
      var ea=em*Math.PI/2+anim*0.04;
      var er=12+Math.sin(anim*0.05+em)*4;
      c.save();c.globalAlpha=0.3+0.2*Math.sin(anim*0.06+em);
      c.fillStyle="#FF4500";c.beginPath();c.arc(ax+Math.cos(ea)*er,-10+bob+Math.sin(ea)*er,1.5,0,Math.PI*2);c.fill();
      c.restore();
    }

    c.restore();
    return;
  }

  // --- REGULAR CHARACTER ---
  var atk=(pose==="attack"&&t>0);
  var ax=atk?-Math.min(t*1.5,8):0;

  // Legs
  var lk=atk?Math.sin(t*0.6)*2:0;
  D(c,ax-4+lk,-3+bob+h/2,4,6+h/2,f.pants||"#4169E1");
  D(c,ax+1-lk,-3+bob+h/2,4,6+h/2,f.pants||"#4169E1");
  D(c,ax-5+lk,2+h+bob,5,3,"#333");D(c,ax+1-lk,2+h+bob,5,3,"#333");

  // Body
  c.fillStyle=f.shirt;c.beginPath();
  c.moveTo(ax-7,-12+bob-h/2);c.lineTo(ax-8,-3+bob);c.lineTo(ax+8,-3+bob);c.lineTo(ax+7,-12+bob-h/2);
  c.closePath();c.fill();

  // Oil stains for Daed — on shirt/body only, not face
  if(f.oily){
    c.fillStyle="rgba(40,30,10,0.45)";
    [[ax-3,2],[ax+3,0],[ax+1,4],[ax-4,1],[ax+5,3]].forEach(function(p){
      c.beginPath();c.arc(p[0],p[1]+bob,1.5,0,Math.PI*2);c.fill();
    });
    // Oil drip from shirt hem
    var drip=(anim*0.05)%1;
    c.fillStyle="rgba(40,30,10,0.25)";c.beginPath();c.arc(ax+4,4+bob+drip*6,1,0,Math.PI*2);c.fill();
  }

  // Arms
  if(atk){
    // Attack arm
    c.save();c.translate(ax-8,-12+bob-h/2);c.rotate(0.5-t*0.08);
    D(c,0,0,4,12,f.shirt);c.fillStyle=f.skin;c.beginPath();c.arc(2,13,2.5,0,Math.PI*2);c.fill();
    c.restore();
  }else{
    D(c,ax-10,-12+bob-h/2,4,11,f.shirt);
    c.fillStyle=f.skin;c.beginPath();c.arc(ax-8,-1+bob,2.5,0,Math.PI*2);c.fill();
  }
  D(c,ax+6,-12+bob-h/2,4,11,f.shirt);
  c.fillStyle=f.skin;c.beginPath();c.arc(ax+8,-1+bob,2.5,0,Math.PI*2);c.fill();
  if(f.oily){
    c.fillStyle="rgba(40,30,10,0.35)";
    c.beginPath();c.arc(ax-8,-1+bob,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(ax+8,-1+bob,3,0,Math.PI*2);c.fill();
  }

  // Halo for Space Jesus
  if(f.halo){
    var hpulse=0.6+0.4*Math.sin(anim*0.06);
    c.save();c.globalAlpha=hpulse*0.9;
    c.strokeStyle=P.gold;c.lineWidth=2.5;
    c.beginPath();c.arc(ax,-30+bob-h/2,12,0,Math.PI*2);c.stroke();
    c.globalAlpha=hpulse*0.15;c.fillStyle=P.gold;
    c.beginPath();c.arc(ax,-30+bob-h/2,16,0,Math.PI*2);c.fill();
    c.restore();
  }

  // Mullet back drawn BEFORE head so it sits behind the face
  if(f.hairStyle==="mullet"){
    c.fillStyle=f.hair;
    c.beginPath();c.moveTo(ax-5,-20+bob-h/2);
    c.quadraticCurveTo(ax-14,-8+bob-h/2+Math.sin(anim*0.04)*2,ax-10,4+bob-h/2);
    c.quadraticCurveTo(ax-4,-4+bob-h/2,ax+2,-20+bob-h/2);
    c.fill();
  }

  // Head
  c.fillStyle=f.skin;c.beginPath();c.arc(ax,-20+bob-h/2,9,0,Math.PI*2);c.fill();

  // Hair
  c.fillStyle=f.hair;
  if(f.hairStyle==="shaggy"){
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-9,-23+bob-h/2,5,8,f.hair);D(c,ax+5,-23+bob-h/2,5,8,f.hair);
    D(c,ax-7,-21+bob-h/2,3,5,f.hair);D(c,ax+5,-21+bob-h/2,3,5,f.hair);
  }else if(f.hairStyle==="long"){
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-9,-23+bob-h/2,4,15,f.hair);D(c,ax+5,-23+bob-h/2,4,15,f.hair);
  }else if(f.hairStyle==="dark"){
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-8,-24+bob-h/2,16,4,f.hair);
  }else if(f.hairStyle==="mullet"){
    // Business in the front — top of head only (back already drawn above)
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-7,-24+bob-h/2,14,4,f.hair);
  }

  // Trucker hat
  if(f.truckerHat){
    RR(c,ax-10,-31+bob-h/2,20,8,3,"#cc0000");
    D(c,ax-12,-24+bob-h/2,24,4,"#cc0000");
    // Hat text
    c.fillStyle="#fff";c.font="bold 3px monospace";c.fillText("CAR",ax-6,-27+bob-h/2);
  }

  // Moustache
  if(f.moustache){
    c.fillStyle="#1a1a1a";
    c.beginPath();
    c.moveTo(ax-5,-14+bob-h/2);
    c.quadraticCurveTo(ax-7,-12+bob-h/2,ax-6,-11+bob-h/2);
    c.quadraticCurveTo(ax,-13+bob-h/2,ax+6,-11+bob-h/2);
    c.quadraticCurveTo(ax+7,-12+bob-h/2,ax+5,-14+bob-h/2);
    c.quadraticCurveTo(ax,-12+bob-h/2,ax-5,-14+bob-h/2);
    c.fill();
  }

  // Beard for Forest (handled in special case above)

  // Eyes
  c.fillStyle="#fff";c.fillRect(ax-5,-21+bob-h/2,4,3);c.fillRect(ax+1,-21+bob-h/2,4,3);
  c.fillStyle="#333";c.fillRect(ax-4,-20+bob-h/2,2,2);c.fillRect(ax+2,-20+bob-h/2,2,2);
  c.fillStyle="#fff";c.fillRect(ax-4,-21+bob-h/2,1,1);c.fillRect(ax+2,-21+bob-h/2,1,1);

  // Mouth
  c.strokeStyle="#333";c.lineWidth=0.8;
  if(atk){
    c.fillStyle="#333";c.beginPath();c.arc(ax,-14+bob-h/2,2,0,Math.PI*2);c.fill();
  }else{
    c.beginPath();c.arc(ax,-14+bob-h/2,2.5,0.1*Math.PI,0.9*Math.PI);c.stroke();
  }

  c.restore();
}

/* ===== DRAW BATTLE SCENE ===== */
function drawBattle(c){
  var bs=battleState;if(!bs)return;
  var f=bs.fighter;

  // === VS INTRO SPLASH ===
  if(bs.phase==="vsIntro"){
    c.fillStyle="#0a0a1a";c.fillRect(0,0,CW,CH);
    var p=bs.vsTimer/90;// 1→0

    // Diagonal split
    c.save();
    c.beginPath();c.moveTo(0,0);c.lineTo(CW*p*2,0);c.lineTo(0,CH);c.closePath();c.clip();
    c.fillStyle="rgba(255,105,180,0.15)";c.fillRect(0,0,CW,CH);
    drawBattleKdee(c,100,330,"idle",0);
    c.restore();

    c.save();
    c.beginPath();c.moveTo(CW,CH);c.lineTo(CW-CW*p*2,CH);c.lineTo(CW,0);c.closePath();c.clip();
    c.fillStyle="rgba("+((f.color||"#fff").indexOf("#8a")>=0?"138,43,226":"0,150,200")+",0.15)";c.fillRect(0,0,CW,CH);
    drawBattleEnemy(c,f,260,290,"idle",0,bs.enemyAnim);
    c.restore();

    // VS text
    if(bs.vsTimer<70){
      var vs=Math.min(1,(70-bs.vsTimer)/15);
      c.save();c.globalAlpha=vs;
      c.fillStyle=P.gold;c.font="bold 48px monospace";c.textAlign="center";
      c.fillText("VS",CW/2,CH/2-10);
      c.font="bold 10px monospace";c.fillStyle="#fff";
      c.fillText("K'DEE",CW/4,CH/2+20);
      c.fillText(f.name,CW*3/4,CH/2+20);
      c.font="8px monospace";c.fillStyle=f.color||"#aaa";
      c.fillText(f.title||"",CW*3/4,CH/2+34);
      c.textAlign="left";
      c.restore();
    }

    // Lightning line down center
    c.strokeStyle="rgba(255,215,0,"+(0.3+0.3*Math.sin(bs.vsTimer*0.3))+")";
    c.lineWidth=2;c.beginPath();
    c.moveTo(CW/2,0);
    for(var i=0;i<CH;i+=20){c.lineTo(CW/2+Math.sin(i*0.1+bs.vsTimer*0.2)*8,i);}
    c.stroke();

    return;
  }

  // === MAIN BATTLE SCREEN ===
  // Background
  var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#0a0a2a");bg.addColorStop(0.5,"#1a0a3e");bg.addColorStop(1,"#0a0a1a");
  c.fillStyle=bg;c.fillRect(0,0,CW,CH);

  // Arena floor with perspective lines
  var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#2a1a3e");fg.addColorStop(1,"#0a0a1a");
  c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
  for(var i=0;i<CW;i+=25){c.strokeStyle="rgba(255,255,255,0.02)";c.lineWidth=1;c.beginPath();c.moveTo(i,370);c.lineTo(CW/2+(i-CW/2)*2,CH);c.stroke();}
  // Horizontal lines
  for(var j=380;j<CH;j+=30){c.strokeStyle="rgba(255,255,255,0.015)";c.beginPath();c.moveTo(0,j);c.lineTo(CW,j);c.stroke();}

  // Ambient glow behind fighters
  var pulse=0.5+0.5*Math.sin(frameTick*0.04);
  c.fillStyle="rgba(255,105,180,"+(0.03+0.02*pulse)+")";c.beginPath();c.arc(80,400,70,0,Math.PI*2);c.fill();
  c.fillStyle="rgba("+(f.color?parseInt(f.color.slice(1,3),16)+","+parseInt(f.color.slice(3,5),16)+","+parseInt(f.color.slice(5,7),16):"150,150,255")+","+(0.03+0.02*pulse)+")";
  c.beginPath();c.arc(265,270,70,0,Math.PI*2);c.fill();

  // Enemy (top right, facing left)
  drawBattleEnemy(c,f,265,280,bs.enemyPose,bs.enemyActionTimer,bs.enemyAnim);
  // K'Dee (bottom left, facing right) — raised so full body is visible above action buttons
  drawBattleKdee(c,80,430,bs.kdeePose,bs.kdeeActionTimer);

  // HP Bars
  // Enemy HP bar
  var ebx=170,eby=170;
  c.fillStyle="#222";RR(c,ebx-2,eby-2,148,16,4,"#222");
  var ehpW=Math.max(0,bs.enemyHP/f.maxHp)*140;
  var ehCol=bs.enemyHP>f.maxHp*0.5?"#2ecc71":bs.enemyHP>f.maxHp*0.25?"#e8a820":"#e74c3c";
  if(ehpW>0)RR(c,ebx+2,eby+2,ehpW,8,3,ehCol);
  c.fillStyle="#fff";c.font="bold 11px monospace";c.fillText(f.name,ebx+2,eby-4);
  c.fillStyle="#ccc";c.font="9px monospace";c.fillText(bs.enemyHP+"/"+f.maxHp,ebx+100,eby-4);

  // K'Dee HP bar
  var kbx=20,kby=350;
  RR(c,kbx-2,kby-2,148,16,4,"#222");
  var khpW=Math.max(0,kdeeHP/kdeeMaxHP)*140;
  var khCol=kdeeHP>10?"#2ecc71":kdeeHP>5?"#e8a820":"#e74c3c";
  if(kdeeHP<=0)khCol="#8B0000";
  if(khpW>0)RR(c,kbx+2,kby+2,Math.max(0,khpW),8,3,khCol);
  c.fillStyle="#fff";c.font="bold 11px monospace";c.fillText("K'DEE",kbx+2,kby-4);
  c.fillStyle="#ccc";c.font="9px monospace";c.fillText(kdeeHP+"/"+kdeeMaxHP,kbx+100,kby-4);
  // Exhaustion indicator
  if(kdeeHP<=5&&kdeeHP>0){c.fillStyle="rgba(255,0,0,0.4)";c.font="bold 9px monospace";c.fillText("EXHAUSTED",kbx+2,kby+26);}
  if(kdeeHP<=0){c.fillStyle="rgba(139,0,0,0.6)";c.font="bold 9px monospace";c.fillText("RUNNING ON FUMES",kbx+2,kby+26);}

  // Screen flash
  if(bs.flashTimer>0){c.save();c.globalAlpha=bs.flashTimer/12*0.4;c.fillStyle=bs.flashColor;c.fillRect(0,0,CW,CH);c.restore();}

  // Floating damage numbers
  dmgFloats.forEach(function(df){
    if(df.life<=0)return;
    c.save();c.globalAlpha=Math.min(1,df.life/15);
    c.fillStyle=df.color;c.font="bold "+(16+Math.max(0,20-df.life)*0.6)+"px monospace";
    c.textAlign="center";c.fillText(df.txt,df.x,df.y);c.textAlign="left";
    c.restore();
    df.y-=1.2;df.life--;
  });

  // Message box — taller to fit larger text
  RR(c,10,508,CW-20,122,8,"rgba(0,0,0,0.92)");
  c.strokeStyle="rgba(255,215,0,0.3)";c.lineWidth=1.5;
  c.beginPath();
  var mbr=8,mbx=12,mby=510,mbw=CW-24,mbh=118;
  c.moveTo(mbx+mbr,mby);c.lineTo(mbx+mbw-mbr,mby);c.quadraticCurveTo(mbx+mbw,mby,mbx+mbw,mby+mbr);
  c.lineTo(mbx+mbw,mby+mbh-mbr);c.quadraticCurveTo(mbx+mbw,mby+mbh,mbx+mbw-mbr,mby+mbh);
  c.lineTo(mbx+mbr,mby+mbh);c.quadraticCurveTo(mbx,mby+mbh,mbx,mby+mbh-mbr);
  c.lineTo(mbx,mby+mbr);c.quadraticCurveTo(mbx,mby,mbx+mbr,mby);c.stroke();

  // Message text (word wrap with \n support) — larger font
  c.fillStyle="#eee";c.font="bold 12px monospace";
  var rawLines=(bs.msg||"").split("\n"),allLines=[];
  for(var ml=0;ml<rawLines.length;ml++){
    var words=rawLines[ml].split(" "),line="";
    for(var w=0;w<words.length;w++){
      var test=line+(line?" ":"")+words[w];
      if(c.measureText(test).width>CW-52){allLines.push(line);line=words[w];}else{line=test;}
    }
    if(line)allLines.push(line);else allLines.push("");
  }
  for(var l=0;l<Math.min(allLines.length,7);l++){c.fillText(allLines[l],22,530+l*15);}

  // Action buttons — above the message box
  if(bs.phase==="player"){
    var btnY=462;var btnH=34;
    var actions=[
      {label:"\u270B SLAP",color:"#e74c3c",x:12,w:76},
      {label:"\uD83D\uDCAC NAG",color:"#FF69B4",x:94,w:72},
      {label:"\uD83D\uDC5C PURSE",color:"#FFD700",x:172,w:80}
    ];
    actions.forEach(function(a){
      RR(c,a.x,btnY,a.w,btnH,6,a.color);
      c.fillStyle="rgba(0,0,0,0.25)";c.font="bold 11px monospace";c.fillText(a.label,a.x+9,btnY+23);
      c.fillStyle="#1a0a2e";c.font="bold 11px monospace";c.fillText(a.label,a.x+8,btnY+22);
    });
    // Big Hug for Milo, ITEM otherwise
    if(bs.id==="milo"){
      RR(c,258,btnY,92,btnH,6,"#FF69B4");
      c.fillStyle="rgba(0,0,0,0.25)";c.font="bold 11px monospace";c.fillText("\uD83E\uDD17 HUG",267,btnY+23);
      c.fillStyle="#1a0a2e";c.font="bold 11px monospace";c.fillText("\uD83E\uDD17 HUG",266,btnY+22);
    } else if(inv.length>0){
      RR(c,258,btnY,92,btnH,6,"#00CED1");
      c.fillStyle="rgba(0,0,0,0.25)";c.font="bold 11px monospace";c.fillText("\uD83C\uDF81 ITEM",267,btnY+23);
      c.fillStyle="#1a0a2e";c.font="bold 11px monospace";c.fillText("\uD83C\uDF81 ITEM",266,btnY+22);
    }
  }

  // Item selection overlay
  if(bs.phase==="items"){
    c.fillStyle="rgba(0,0,0,0.75)";c.fillRect(0,0,CW,CH);
    RR(c,15,130,CW-30,370,10,"#1a0a2e");
    c.strokeStyle=P.gold;c.lineWidth=2;
    c.strokeRect(17,132,CW-34,366);
    c.fillStyle=P.gold;c.font="bold 14px monospace";c.textAlign="center";
    c.fillText("USE WHICH ITEM?",CW/2,165);c.textAlign="left";
    for(var i=0;i<inv.length&&i<8;i++){
      var ix=30+(i%4)*80,iy=185+Math.floor(i/4)*85;
      var info=invDetails[inv[i]]||{emoji:invEmoji[inv[i]]||"\u2753",name:inv[i]};
      var isSE=f.itemEffects&&f.itemEffects[inv[i]]&&f.itemEffects[inv[i]].super;
      RR(c,ix,iy,70,72,6,isSE?"rgba(0,206,209,0.12)":"rgba(255,255,255,0.04)");
      c.strokeStyle=isSE?"#00CED1":"rgba(255,215,0,0.2)";c.lineWidth=isSE?2:1;c.strokeRect(ix+1,iy+1,68,70);
      if(isSE){
        c.fillStyle="rgba(0,206,209,0.08)";c.fillRect(ix+2,iy+2,66,68);
        c.fillStyle="#00CED1";c.font="bold 6px monospace";c.fillText("SUPER",ix+22,iy+68);
      }
      c.font="26px monospace";c.textAlign="center";c.fillText(info.emoji,ix+35,iy+35);c.textAlign="left";
      c.fillStyle="#ccc";c.font="7px monospace";
      var nm=(info.name||inv[i]);if(nm.length>10)nm=nm.substring(0,9)+"..";
      c.textAlign="center";c.fillText(nm,ix+35,iy+52);c.textAlign="left";
    }
    RR(c,125,460,110,30,6,"#CD5C5C");
    c.fillStyle="#fff";c.font="bold 10px monospace";c.textAlign="center";c.fillText("\u2190 BACK",CW/2,480);c.textAlign="left";
  }

  // Continue prompt (pulsing)
  if(bs.phase==="intro"||bs.phase==="enemyAct"||bs.phase==="victory"||bs.phase==="superCut"){
    var pp=0.3+0.3*Math.sin(frameTick*0.1);
    c.fillStyle="rgba(255,255,255,"+pp+")";c.font="bold 10px monospace";c.textAlign="center";
    c.fillText("[ TAP TO CONTINUE ]",CW/2,632);c.textAlign="left";
  }

  // === SUPER EFFECTIVE CUT-IN ===
  if(bs.phase==="superCut"){
    var sp=bs.superTimer||0;
    if(sp<20){
      // Dramatic black bars
      var barH=Math.min(80,sp*8);
      c.fillStyle="#000";c.fillRect(0,0,CW,barH);c.fillRect(0,CH-barH,CW,barH);
      // "SUPER EFFECTIVE!" text zooming in
      c.save();c.globalAlpha=Math.min(1,sp/8);
      var sz=20+sp*0.8;
      c.fillStyle="#00CED1";c.font="bold "+Math.floor(sz)+"px monospace";
      c.textAlign="center";c.fillText("SUPER",CW/2,CH/2-10);
      c.fillStyle=P.gold;c.fillText("EFFECTIVE!",CW/2,CH/2+20);
      c.textAlign="left";c.restore();
      // Sparkle particles
      for(var s=0;s<6;s++){
        var sa=s*Math.PI/3+sp*0.1;
        var sr=40+sp*2;
        c.fillStyle="rgba(0,206,209,"+(0.6-sp*0.02)+")";
        c.beginPath();c.arc(CW/2+Math.cos(sa)*sr,CH/2+Math.sin(sa)*sr,3,0,Math.PI*2);c.fill();
      }
    }
  }
}

/* ===== BATTLE CLICK HANDLER ===== */
function battleClick(mx,my){
  var bs=battleState;if(!bs)return;

  // VS intro — skip on tap
  if(bs.phase==="vsIntro"){bs.vsTimer=0;return;}

  // Intro text — advance lines
  if(bs.phase==="intro"){
    bs.introLine++;
    var lines=bs.fighter.intro;
    if(bs.introLine>=lines.length){
      bs.phase="player";bs.msg="What will K'Dee do?";
    }else{
      bs.msg=lines[bs.introLine];
    }
    return;
  }

  // Victory
  if(bs.phase==="victory"){
    var wasHug=bs.hugWin;var wasId=bs.id;
    battleActive=false;paused=false;battleDone[bs.id]=true;
    battleState=null;updateHUD();
    if(wasHug&&wasId==="milo"){
      miloFollowing=true;miloRoomsLeft=3;
      miloFollowX=kdeeX+35;miloFollowY=kdeeY;
      miloMsg="'I love you mom!'";miloMsgTimer=120;
    }
    return;
  }

  // Super effective cut-in
  if(bs.phase==="superCut"){
    bs.phase="victory";bs.msg=bs.victoryMsg||"";return;
  }

  // After enemy attack
  if(bs.phase==="enemyAct"){
    bs.phase="player";bs.msg="What will K'Dee do?";
    bs.kdeePose="idle";bs.kdeeActionTimer=0;
    bs.enemyPose="idle";bs.enemyActionTimer=0;
    return;
  }

  // Item selection
  if(bs.phase==="items"){
    if(mx>=125&&mx<=235&&my>=460&&my<=490){bs.phase="player";bs.msg="What will K'Dee do?";return;}
    for(var i=0;i<inv.length&&i<8;i++){
      var ix=30+(i%4)*80,iy=185+Math.floor(i/4)*85;
      if(mx>=ix&&mx<=ix+70&&my>=iy&&my<=iy+72){useItemInBattle(inv[i]);return;}
    }
    return;
  }

  // Player turn
  if(bs.phase==="player"){
    var btnY=462,btnH=34;
    if(mx>=12&&mx<=88&&my>=btnY&&my<=btnY+btnH){
      var dmg=3+Math.floor(Math.random()*2);
      var quips=["K'Dee slaps "+bs.fighter.name+"! MOM POWER!","*SLAP* The mom hand is MIGHTY.","K'Dee's slap echoes through the house!","SLAP! "+bs.fighter.name+" didn't see that coming!"];
      doPlayerAttack("SLAP",dmg,rPick(quips),"slap");return;
    }
    if(mx>=94&&mx<=166&&my>=btnY&&my<=btnY+btnH){
      var dmg=2+Math.floor(Math.random()*2);
      var quips=["'...and ANOTHER thing!' Legendary mom-nag!","K'Dee deploys The Lecture. It's devastating.","'When I was YOUR age...' Critical hit!","'Do you think keys grow on TREES?!'"];
      doPlayerAttack("NAG",dmg,rPick(quips),"nag");return;
    }
    if(mx>=172&&mx<=252&&my>=btnY&&my<=btnY+btnH){
      var quips=["K'Dee swings her purse! It weighs 47 pounds!","PURSE STRIKE! Contains: everything. Weighs: too much.","The purse connects! It has bricks in it somehow!","*WHAM* That purse is a weapon of mass destruction."];
      doPlayerAttack("PURSE",4,rPick(quips),"purse");return;
    }
    if(mx>=258&&mx<=350&&my>=btnY&&my<=btnY+btnH){
      if(bs.id==="milo"){
        // Big Hug — instant win, Milo follows after
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee scoops Milo up in a BIG HUG.\n\nHe immediately forgets everything.\n\n'...mom you smell like coffee.'\n'I know, baby.'\n\nMilo beams. Battle forgotten.";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(255,105,180,0.35)";
        addDmgFloat(265,290,"💗","#FF69B4");
        return;
      }
      if(inv.length>0){bs.phase="items";bs.msg="Choose an item to use...";return;}
    }
  }
}

function doPlayerAttack(name,dmg,msg,pose){
  var bs=battleState;
  // Daed special
  if(bs.id==="daed"){
    bs.kdeePose=pose;bs.kdeeActionTimer=1;
    bs.enemyHP=0;
    var lines=bs.fighter.defeat;
    bs.msg=lines.join("\n");bs.phase="victory";
    bs.flashTimer=10;bs.flashColor="rgba(255,215,0,0.3)";
    return;
  }
  // Gwyneth reduced damage
  if(bs.id==="gwyneth"){
    dmg=Math.max(0,dmg-1);
    msg+="\n...Gwyneth doesn't notice. She's asleep.";
  }
  bs.kdeePose=pose;bs.kdeeActionTimer=1;
  bs.enemyHP=Math.max(0,bs.enemyHP-dmg);
  bs.shakeTimer=12;
  bs.flashTimer=8;bs.flashColor="rgba(255,100,100,0.25)";
  addDmgFloat(265,290,dmg>0?"-"+dmg:"MISS",dmg>0?"#e74c3c":"#888");
  if(bs.enemyHP<=0){
    bs.msg=msg+"\n\n"+bs.fighter.defeat.join("\n");
    bs.phase="victory";
  }else{
    bs.msg=msg;bs.phase="enemyTurn";
    setTimeout(function(){enemyTurn();},900);
  }
}

function useItemInBattle(itemId){
  var bs=battleState;var f=bs.fighter;
  var eff=f.itemEffects&&f.itemEffects[itemId];
  bs.kdeePose="item";bs.kdeeActionTimer=1;
  if(eff){
    var dmg=eff.dmg||3;
    bs.enemyHP=Math.max(0,bs.enemyHP-dmg);
    bs.shakeTimer=14;bs.flashTimer=10;bs.flashColor="rgba(0,206,209,0.3)";
    addDmgFloat(265,280,"-"+dmg,eff.super?"#00CED1":"#FFD700");
    var emsg=eff.msg.join("\n");
    if(bs.enemyHP<=0){
      if(eff.super){
        bs.msg=emsg;bs.victoryMsg=emsg+"\n\n"+f.defeat.join("\n");
        bs.phase="superCut";bs.superTimer=0;
      }else{
        bs.msg=emsg+"\n\n"+f.defeat.join("\n");bs.phase="victory";
      }
    }else{
      bs.msg=emsg;bs.phase="enemyTurn";
      setTimeout(function(){enemyTurn();},900);
    }
  }else{
    var dmg=2;var info=invDetails[itemId]||{name:itemId};
    bs.enemyHP=Math.max(0,bs.enemyHP-dmg);
    bs.shakeTimer=8;bs.flashTimer=6;bs.flashColor="rgba(255,215,0,0.2)";
    addDmgFloat(265,290,"-"+dmg,"#FFD700");
    var msg="K'Dee uses "+info.name+"! "+f.name+" is confused.";
    if(bs.enemyHP<=0){bs.msg=msg+"\n\n"+f.defeat.join("\n");bs.phase="victory";}
    else{bs.msg=msg;bs.phase="enemyTurn";setTimeout(function(){enemyTurn();},900);}
  }
}

function enemyTurn(){
  var bs=battleState;if(!bs)return;
  var f=bs.fighter;
  if(bs.id==="daed"){bs.phase="victory";bs.msg=f.defeat.join("\n");return;}
  var atkIdx=Math.floor(Math.random()*f.attacks.length);
  var atk=f.attacks[atkIdx];
  var dmg=atk.dmg;
  var quip=rPick(atk.quips);
  kdeeHP-=dmg;
  bs.enemyPose="attack";bs.enemyActionTimer=1;
  if(dmg>0){
    bs.kdeePose="hurt";bs.kdeeActionTimer=1;
    bs.flashTimer=8;bs.flashColor="rgba(255,0,0,0.2)";
    addDmgFloat(150,410,"-"+dmg,"#e74c3c");
  }
  // Show attack name + quip
  bs.msg="[ "+atk.name+" ]\n"+quip;
  bs.phase="enemyAct";bs.turnCount++;updateHUD();
}

function addDmgFloat(x,y,txt,color){
  dmgFloats.push({x:x+Math.random()*20-10,y:y,txt:txt,color:color,life:30});
}

function updateBattle(){
  if(!battleState)return;
  battleState.kdeeAnim++;battleState.enemyAnim++;
  if(battleState.shakeTimer>0)battleState.shakeTimer--;
  if(battleState.flashTimer>0)battleState.flashTimer--;
  if(battleState.kdeeActionTimer>0){battleState.kdeeActionTimer++;if(battleState.kdeeActionTimer>20){battleState.kdeeActionTimer=0;if(battleState.kdeePose!=="hurt")battleState.kdeePose="idle";}}
  if(battleState.enemyActionTimer>0){battleState.enemyActionTimer++;if(battleState.enemyActionTimer>20){battleState.enemyActionTimer=0;battleState.enemyPose="idle";}}
  // VS intro timer
  if(battleState.phase==="vsIntro"){
    battleState.vsTimer--;
    if(battleState.vsTimer<=0){
      battleState.phase="intro";battleState.introLine=0;
      battleState.msg=battleState.fighter.intro[0];
    }
  }
  // Super cut timer
  if(battleState.phase==="superCut"){
    battleState.superTimer=(battleState.superTimer||0)+1;
  }
  // Clean up dead floats
  dmgFloats=dmgFloats.filter(function(d){return d.life>0;});
}

/* --- ENDLESS RACER MINI-GAME --- */
/* K'Dee drives the red Audi TT down the road after finding all 3 keys. */
var racerActive=false,racerX=180,racerSpeed=2.5,racerScore=0,racerDist=0;
var racerObstacles=[],racerLanes=[90,180,270];// 3 lane X centers
var racerLane=1,racerTargetX=180,racerScrollY=0,racerLives=3,racerOver=false;
var racerMsg="",racerMsgTimer=0,racerSpawnTimer=0,racerTick=0;
var RACER_ROAD_L=40,RACER_ROAD_R=320;// road edges

/* --- TETRIS (CLOTHES MOUNTAIN) MINI-GAME --- */
var tetActive=false,tetBoard=[],tetPiece=null,tetNext=null;
var tetScore=0,tetLines=0,tetLevel=1,tetOver=false,tetWon=false;
var tetTick=0,tetFallTimer=0,tetMsg="",tetMsgTimer=0;
var TET_COLS=7,TET_ROWS=14,TET_BOARD_X=14,TET_BOARD_Y=80;
var TET_CW=46,TET_CH=36,TET_TARGET_LINES=4;
var TET_PIECES=[
  {shape:[[1,1,1,1]],color:"#00CED1"},
  {shape:[[1,1],[1,1]],color:"#4169E1"},
  {shape:[[0,1,0],[1,1,1]],color:"#FF69B4"},
  {shape:[[0,1,1],[1,1,0]],color:"#FF8C00"},
  {shape:[[1,1,0],[0,1,1]],color:"#9b59b6"},
  {shape:[[1,0,0],[1,1,1]],color:"#e74c3c"},
  {shape:[[0,0,1],[1,1,1]],color:"#2ecc71"}
];

function startTetris(){
  tetBoard=[];
  for(var r=0;r<TET_ROWS;r++){tetBoard.push([]);for(var c=0;c<TET_COLS;c++)tetBoard[r].push(null);}
  // Pre-fill bottom 2 rows with random garbage
  for(var r=TET_ROWS-2;r<TET_ROWS;r++){
    for(var c=0;c<TET_COLS;c++){
      if(Math.random()>0.25)tetBoard[r][c]=TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)].color;
    }
  }
  tetScore=0;tetLines=0;tetLevel=1;tetOver=false;tetWon=false;
  tetTick=0;tetFallTimer=0;tetMsg="STACK THE CLOTHES!";tetMsgTimer=100;
  tetNext=TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)];
  spawnTetPiece();
  tetActive=true;paused=true;
}

function spawnTetPiece(){
  var def=tetNext||TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)];
  tetNext=TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)];
  var col=Math.floor((TET_COLS-def.shape[0].length)/2);
  tetPiece={shape:def.shape,color:def.color,row:0,col:col};
  // Check lose: spawns overlapping
  if(tetCollide(tetPiece,0,0)){
    tetOver=true;
    tetMsg="BURIED!";tetMsgTimer=180;
  }
}

function tetCollide(p,dr,dc){
  for(var r=0;r<p.shape.length;r++){
    for(var c=0;c<p.shape[r].length;c++){
      if(!p.shape[r][c])continue;
      var nr=p.row+r+dr,nc=p.col+c+dc;
      if(nr<0||nr>=TET_ROWS||nc<0||nc>=TET_COLS)return true;
      if(tetBoard[nr][nc])return true;
    }
  }
  return false;
}

function tetRotate(){
  if(!tetPiece||tetOver||tetWon)return;
  var s=tetPiece.shape;
  var rows=s.length,cols=s[0].length;
  var rot=[];
  for(var c=0;c<cols;c++){rot.push([]);for(var r=rows-1;r>=0;r--)rot[c].push(s[r][c]);}
  var orig=tetPiece.shape;
  tetPiece.shape=rot;
  // Wall kick
  if(tetCollide(tetPiece,0,0)){
    if(!tetCollide(tetPiece,0,1))tetPiece.col+=1;
    else if(!tetCollide(tetPiece,0,-1))tetPiece.col-=1;
    else if(!tetCollide(tetPiece,0,2))tetPiece.col+=2;
    else if(!tetCollide(tetPiece,0,-2))tetPiece.col-=2;
    else tetPiece.shape=orig;// revert
  }
}

function tetMoveH(dir){
  if(!tetPiece||tetOver||tetWon)return;
  if(!tetCollide(tetPiece,0,dir))tetPiece.col+=dir;
}

function tetDrop(){
  if(!tetPiece||tetOver||tetWon)return;
  if(!tetCollide(tetPiece,1,0)){tetPiece.row++;}
  else{tetLock();}
}

function tetHardDrop(){
  if(!tetPiece||tetOver||tetWon)return;
  while(!tetCollide(tetPiece,1,0))tetPiece.row++;
  tetLock();
}

function tetLock(){
  for(var r=0;r<tetPiece.shape.length;r++){
    for(var c=0;c<tetPiece.shape[r].length;c++){
      if(!tetPiece.shape[r][c])continue;
      var br=tetPiece.row+r,bc=tetPiece.col+c;
      if(br>=0&&br<TET_ROWS&&bc>=0&&bc<TET_COLS)tetBoard[br][bc]=tetPiece.color;
    }
  }
  tetClearLines();
  spawnTetPiece();
}

function tetClearLines(){
  var cleared=0;
  for(var r=TET_ROWS-1;r>=0;r--){
    var full=true;
    for(var c=0;c<TET_COLS;c++){if(!tetBoard[r][c]){full=false;break;}}
    if(full){
      tetBoard.splice(r,1);
      tetBoard.unshift([]);
      for(var c=0;c<TET_COLS;c++)tetBoard[0].push(null);
      cleared++;r++;// recheck same row index
    }
  }
  if(cleared>0){
    tetLines+=cleared;tetScore+=cleared*100*tetLevel;
    tetLevel=Math.min(10,1+Math.floor(tetLines/4));
    if(tetLines>=TET_TARGET_LINES&&!tetWon){
      tetWon=true;
      tetMsg="PHONE FOUND!";tetMsgTimer=200;
    }
  }
}

function tetGhostRow(){
  if(!tetPiece)return tetPiece?tetPiece.row:0;
  var gr=tetPiece.row;
  while(!tetCollide({shape:tetPiece.shape,color:tetPiece.color,row:gr+1,col:tetPiece.col},0,0))gr++;
  return gr;
}

function updateTetris(){
  tetTick++;
  if(tetMsgTimer>0)tetMsgTimer--;
  if(tetOver||tetWon){
    if(tetMsgTimer===0&&(tetOver||tetWon)){tetEndGame();}
    return;
  }
  tetFallTimer++;
  var fallInterval=Math.max(10,30-tetLevel*2);
  if(tetFallTimer>=fallInterval){tetFallTimer=0;tetDrop();}
}

function drawTetris(c){
  // Bedroom-tinted background
  c.fillStyle="#e8d0e0";c.fillRect(0,0,CW,CH);
  var bg=c.createLinearGradient(0,0,0,CH);
  bg.addColorStop(0,"#e8d0e0");bg.addColorStop(1,"#d4b0c0");
  c.fillStyle=bg;c.fillRect(0,0,CW,CH);

  // HUD bar
  c.fillStyle="rgba(0,0,0,0.75)";c.fillRect(0,0,CW,TET_BOARD_Y);
  c.fillStyle="#FFD700";c.font="bold 11px monospace";c.textAlign="center";
  c.fillText("CLOTHES MOUNTAIN",CW/2,16);c.textAlign="left";
  c.fillStyle="#fff";c.font="9px monospace";c.textAlign="center";
  c.fillText("LINES:"+tetLines+"/"+TET_TARGET_LINES+"  SCORE:"+tetScore+"  LVL:"+tetLevel,CW/2,35);c.textAlign="left";

  // Next piece preview label
  c.fillStyle="#ccc";c.font="7px monospace";c.fillText("NEXT:",TET_BOARD_X+TET_COLS*TET_CW+8,TET_BOARD_Y+14);
  if(tetNext){
    var nx=TET_BOARD_X+TET_COLS*TET_CW+8,ny=TET_BOARD_Y+18;
    for(var r=0;r<tetNext.shape.length;r++){
      for(var c2=0;c2<tetNext.shape[r].length;c2++){
        if(!tetNext.shape[r][c2])continue;
        RR(c,nx+c2*16,ny+r*14,14,12,2,tetNext.color);
      }
    }
  }

  // Board background
  c.fillStyle="rgba(0,0,0,0.35)";
  c.fillRect(TET_BOARD_X,TET_BOARD_Y,TET_COLS*TET_CW,TET_ROWS*TET_CH);

  // Phone peeking at bottom (under pre-fill zone)
  c.font="22px serif";c.textAlign="center";
  c.fillText("\uD83D\uDCF1",TET_BOARD_X+TET_COLS*TET_CW/2,TET_BOARD_Y+TET_ROWS*TET_CH+22);
  c.textAlign="left";c.font="7px monospace";c.fillStyle="rgba(255,255,255,0.5)";
  c.textAlign="center";c.fillText("*bzz*",TET_BOARD_X+TET_COLS*TET_CW/2,TET_BOARD_Y+TET_ROWS*TET_CH+34);c.textAlign="left";

  // Ghost piece
  if(tetPiece&&!tetOver&&!tetWon){
    var gr=tetGhostRow();
    for(var r=0;r<tetPiece.shape.length;r++){
      for(var c2=0;c2<tetPiece.shape[r].length;c2++){
        if(!tetPiece.shape[r][c2])continue;
        var bx=TET_BOARD_X+(tetPiece.col+c2)*TET_CW;
        var by=TET_BOARD_Y+(gr+r)*TET_CH;
        c.save();c.globalAlpha=0.25;
        RR(c,bx+1,by+1,TET_CW-2,TET_CH-2,3,tetPiece.color);
        c.restore();
      }
    }
  }

  // Locked cells
  for(var r=0;r<TET_ROWS;r++){
    for(var c2=0;c2<TET_COLS;c2++){
      if(!tetBoard[r][c2])continue;
      var bx=TET_BOARD_X+c2*TET_CW,by=TET_BOARD_Y+r*TET_CH;
      RR(c,bx+1,by+1,TET_CW-2,TET_CH-2,3,tetBoard[r][c2]);
      c.fillStyle="rgba(255,255,255,0.15)";
      c.fillRect(bx+2,by+2,TET_CW-10,4);
    }
  }

  // Active piece
  if(tetPiece&&!tetOver){
    for(var r=0;r<tetPiece.shape.length;r++){
      for(var c2=0;c2<tetPiece.shape[r].length;c2++){
        if(!tetPiece.shape[r][c2])continue;
        var bx=TET_BOARD_X+(tetPiece.col+c2)*TET_CW;
        var by=TET_BOARD_Y+(tetPiece.row+r)*TET_CH;
        RR(c,bx+1,by+1,TET_CW-2,TET_CH-2,3,tetPiece.color);
        c.fillStyle="rgba(255,255,255,0.25)";
        c.fillRect(bx+2,by+2,TET_CW-10,4);
      }
    }
  }

  // Board grid lines
  c.strokeStyle="rgba(255,255,255,0.06)";c.lineWidth=1;
  for(var r=0;r<=TET_ROWS;r++){c.beginPath();c.moveTo(TET_BOARD_X,TET_BOARD_Y+r*TET_CH);c.lineTo(TET_BOARD_X+TET_COLS*TET_CW,TET_BOARD_Y+r*TET_CH);c.stroke();}
  for(var c2=0;c2<=TET_COLS;c2++){c.beginPath();c.moveTo(TET_BOARD_X+c2*TET_CW,TET_BOARD_Y);c.lineTo(TET_BOARD_X+c2*TET_CW,TET_BOARD_Y+TET_ROWS*TET_CH);c.stroke();}

  // Message overlay
  if(tetMsgTimer>0&&tetMsg){
    var alpha=Math.min(1,tetMsgTimer/20);
    c.save();c.globalAlpha=alpha*0.95;
    c.font="bold 16px monospace";
    var tw=c.measureText(tetMsg).width+20;
    RR(c,CW/2-tw/2,CH/2-22,tw,32,6,"rgba(0,0,0,0.88)");
    c.fillStyle=tetWon?"#FFD700":"#e74c3c";
    c.textAlign="center";c.fillText(tetMsg,CW/2,CH/2+4);c.textAlign="left";
    c.restore();
  }

  // Controls hint
  c.fillStyle="rgba(255,255,255,0.3)";c.font="6px monospace";c.textAlign="center";
  c.fillText("\u2190\u2192 MOVE  \u2191 ROTATE  \u2193 DROP  SPACE=SLAM",CW/2,CH-6);c.textAlign="left";
}

function tetEndGame(){
  tetActive=false;paused=false;
  if(tetWon){
    // Mark clothespile as done (both verbs) so it can't be re-triggered
    usedHS[9+"_clothespile_push"]=true;
    usedHS[9+"_clothespile_take"]=true;
    inv.push("phone");questItems["phone"]=true;updateInv();
    showSimpleDlg("PHONE FOUND!","K'Dee digs through the avalanche... and there it is! 214 missed photos. 8% battery. 'I attached a photo' (no photo). The phone is FOUND.","phone");
  } else {
    kdeeHP=Math.max(1,kdeeHP-1);updateHUD();
    showSimpleDlg("BURIED!","The pile fought back. K'Dee emerges disheveled. -1 HP. The phone is still in there somewhere. Maybe try again?","hurt");
  }
}

function startRacer(){
  racerActive=true;racerX=180;racerLane=1;racerTargetX=180;racerSpeed=2.5;
  racerScore=0;racerDist=0;racerObstacles=[];racerLives=3;racerOver=false;
  racerMsg="JUST DRIVE.";racerMsgTimer=90;racerScrollY=0;racerTick=0;racerSpawnTimer=0;
  paused=true;
}

function updateRacer(){
  racerTick++;
  racerScrollY=(racerScrollY+racerSpeed*4)%80;
  racerDist+=racerSpeed;
  racerScore=Math.floor(racerDist/10);
  if(racerMsgTimer>0)racerMsgTimer--;

  // Speed creeps up forever — she can never outrun it
  if(racerTick%300===0&&racerSpeed<14)racerSpeed+=0.3;

  // Smooth K'Dee car toward target lane
  racerX+=(racerTargetX-racerX)*0.18;

  // Spawn obstacles
  racerSpawnTimer--;
  if(racerSpawnTimer<=0){
    var spd=racerSpeed*3+(Math.random()-0.5);
    var laneIdx=Math.floor(Math.random()*3);
    var type=Math.random()<0.3?"pothole":"car";
    racerObstacles.push({x:racerLanes[laneIdx],y:-30,speed:spd,type:type,lane:laneIdx,hit:false});
    racerSpawnTimer=Math.max(30,80-racerScore*0.5);
    if(Math.random()<0.3&&racerScore>20){
      var l2=(laneIdx+1+Math.floor(Math.random()*2))%3;
      racerObstacles.push({x:racerLanes[l2],y:-60,speed:spd,type:"pothole",lane:l2,hit:false});
    }
  }

  // Move obstacles
  racerObstacles.forEach(function(o){o.y+=o.speed;});
  racerObstacles=racerObstacles.filter(function(o){return o.y<680&&!o.hit;});

  // Collision — lose a life but NEVER end the game. She drives forever.
  racerObstacles.forEach(function(o){
    if(o.hit)return;
    if(o.y>510&&o.y<620&&Math.abs(o.x-racerX)<30){
      o.hit=true;
      if(racerLives>1){
        racerLives--;
        racerMsg="OOF! "+racerLives+" \u2665";racerMsgTimer=80;
      } else {
        // Bottom out at 1 life — she keeps going regardless
        racerMsg="SHE KEEPS GOING.";racerMsgTimer=90;
      }
    }
  });
}

function drawRacer(c){
  // Full-canvas road with perspective vanishing point at center-top
  var vx=CW/2,vy=60;// vanishing point
  var rl=RACER_ROAD_L,rr=RACER_ROAD_R;

  // Sky — just a thin strip above the vanishing point
  c.fillStyle="#87CEEB";c.fillRect(0,0,CW,vy);

  // Grass either side, full height below vanishing point
  c.fillStyle="#4a8a30";c.fillRect(0,vy,CW,CH-vy);

  // Road trapezoid — narrow at horizon, full width at bottom
  c.fillStyle="#666";
  c.beginPath();
  c.moveTo(vx-2,vy);c.lineTo(vx+2,vy);// vanishing point (tiny)
  c.lineTo(rr,CH);c.lineTo(rl,CH);
  c.closePath();c.fill();

  // Road gradient overlay for depth
  var roadGrad=c.createLinearGradient(0,vy,0,CH);
  roadGrad.addColorStop(0,"rgba(80,80,80,0.6)");roadGrad.addColorStop(1,"rgba(0,0,0,0)");
  c.fillStyle=roadGrad;
  c.beginPath();
  c.moveTo(vx-2,vy);c.lineTo(vx+2,vy);
  c.lineTo(rr,CH);c.lineTo(rl,CH);
  c.closePath();c.fill();

  // Road edge lines (perspective)
  c.strokeStyle="rgba(255,255,255,0.85)";c.lineWidth=2;c.setLineDash([]);
  c.beginPath();c.moveTo(vx,vy);c.lineTo(rl,CH);c.stroke();
  c.beginPath();c.moveTo(vx,vy);c.lineTo(rr,CH);c.stroke();

  // Lane dashes — perspective-correct, scrolling
  // Two lane dividers, lerped from vanishing point to road bottom
  [0.38,0.62].forEach(function(t){
    var lx1=vx,ly1=vy;
    var lx2=rl+(rr-rl)*t,ly2=CH;
    c.strokeStyle="rgba(255,255,255,0.55)";c.lineWidth=2;
    c.setLineDash([28,18]);c.lineDashOffset=-racerScrollY*2.5;
    c.beginPath();c.moveTo(lx1,ly1);c.lineTo(lx2,ly2);c.stroke();
  });
  c.setLineDash([]);

  // Scrolling tree silhouettes on horizon for movement sense
  var treeSpacing=60;
  for(var ti=0;ti<7;ti++){
    var tx=((ti*treeSpacing - racerScrollY*1.2)%420+420)%420 - 10;
    // Left trees
    c.fillStyle="#2d6a1a";
    c.beginPath();c.moveTo(tx,vy+30);c.lineTo(tx+10,vy+10);c.lineTo(tx+20,vy+30);c.closePath();c.fill();
    c.fillRect(tx+7,vy+30,6,20);
    // Right trees (mirror)
    var tx2=CW-tx-20;
    c.beginPath();c.moveTo(tx2,vy+30);c.lineTo(tx2+10,vy+10);c.lineTo(tx2+20,vy+30);c.closePath();c.fill();
    c.fillRect(tx2+7,vy+30,6,20);
  }

  // Obstacles
  racerObstacles.forEach(function(o){
    if(o.type==="pothole"){
      c.save();c.globalAlpha=0.9;
      c.fillStyle="#333";c.beginPath();c.ellipse(o.x,o.y,18,10,0,0,Math.PI*2);c.fill();
      c.fillStyle="#222";c.beginPath();c.ellipse(o.x,o.y,12,6,0,0,Math.PI*2);c.fill();
      c.restore();
    } else {
      drawRacerCar(c,o.x,o.y,"#3333cc",false);
    }
  });

  // K'Dee's red Audi TT convertible
  drawRacerCar(c,racerX,560,"#e74c3c",true);

  // HUD bar
  c.fillStyle="rgba(0,0,0,0.7)";c.fillRect(0,0,CW,48);
  c.fillStyle="#FFD700";c.font="bold 11px monospace";c.textAlign="center";
  c.fillText("JUST DRIVE.",CW/2,16);c.textAlign="left";
  c.fillStyle="#fff";c.font="10px monospace";c.textAlign="center";
  c.fillText(racerScore+"m escaped   \u2665"+racerLives+"   SPD: "+racerSpeed.toFixed(1)+"x",CW/2,34);c.textAlign="left";

  // Speed lines at high speed
  if(racerSpeed>5){
    var sl=Math.floor((racerSpeed-5)*4);
    c.save();c.globalAlpha=0.1;c.strokeStyle="#fff";c.lineWidth=1;
    for(var i=0;i<sl;i++){
      var sx=rl+Math.random()*(rr-rl);
      c.beginPath();c.moveTo(sx,vy);c.lineTo(sx-20,CH);c.stroke();
    }
    c.restore();
  }

  // Message overlay
  if(racerMsgTimer>0&&racerMsg){
    var alpha=Math.min(1,racerMsgTimer/20);
    c.save();c.globalAlpha=alpha*0.92;
    c.font="bold 13px monospace";
    var tw=c.measureText(racerMsg).width+20;
    RR(c,CW/2-tw/2,CH/2-26,tw,28,6,"rgba(0,0,0,0.85)");
    c.fillStyle="#FFD700";c.textAlign="center";
    c.fillText(racerMsg,CW/2,CH/2-6);c.textAlign="left";
    c.restore();
  }
}

function drawRacerCar(c,x,y,color,isKdee){
  // Car body
  c.save();c.translate(x,y);
  var w=28,h=44;
  // Shadow
  c.save();c.globalAlpha=0.2;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,h/2+4,w/2+2,5,0,0,Math.PI*2);c.fill();c.restore();
  // Main body
  RR(c,-w/2,-h/2,w,h,5,color);
  // Windshield
  c.fillStyle="rgba(180,220,255,0.7)";
  RR(c,-w/2+4,-h/2+6,w-8,h*0.3,3,"rgba(180,220,255,0.7)");
  // Wheels
  c.fillStyle="#222";
  c.beginPath();c.ellipse(-w/2+1,-h/2+10,5,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(w/2-1,-h/2+10,5,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(-w/2+1,h/2-10,5,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(w/2-1,h/2-10,5,4,0,0,Math.PI*2);c.fill();
  // Headlights/tail lights
  if(isKdee){
    // Tail lights (top of car since going away = rear)
    c.fillStyle="#e74c3c";c.fillRect(-w/2+2,-h/2,7,4);c.fillRect(w/2-9,-h/2,7,4);
    // K'Dee driver (small head in windshield)
    c.fillStyle=P.skin;c.beginPath();c.arc(0,-h/2+11,4,0,Math.PI*2);c.fill();
    c.fillStyle=P.hair;c.beginPath();c.arc(0,-h/2+8,4,Math.PI,2*Math.PI);c.fill();
  } else {
    c.fillStyle="#FFD700";c.fillRect(-w/2+2,h/2-4,7,4);c.fillRect(w/2-9,h/2-4,7,4);
  }
  c.restore();
}

// Racer touch input: swipe left/right or tap left/right half
var racerSwipeStart=null;
canvas.addEventListener("touchstart",function(e){
  if(!racerActive)return;
  var p=getCanvasCoords(e);racerSwipeStart={x:p.x,y:p.y};
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!racerActive)return;
  e.preventDefault();
  if(!racerSwipeStart)return;
  var p=getCanvasCoords(e);
  var dx=p.x-racerSwipeStart.x;
  racerSwipeStart=null;
  if(Math.abs(dx)<15){// tap: left or right half
    if(p.x<CW/2)racerLaneMoveBy(-1);else racerLaneMoveBy(1);
  } else {
    if(dx<0)racerLaneMoveBy(-1);else racerLaneMoveBy(1);
  }
},{passive:false});

document.addEventListener("keydown",function(e){
  if(!racerActive)return;
  if(e.key==="ArrowLeft"||e.key==="a")racerLaneMoveBy(-1);
  else if(e.key==="ArrowRight"||e.key==="d")racerLaneMoveBy(1);
});

// Tetris touch input
var tetSwipeStart=null;
canvas.addEventListener("touchstart",function(e){
  if(!tetActive)return;
  var p=getCanvasCoords(e);tetSwipeStart={x:p.x,y:p.y};
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!tetActive)return;
  e.preventDefault();
  if(tetOver||tetWon){tetEndGame();return;}
  if(!tetSwipeStart)return;
  var p=getCanvasCoords(e);
  var dx=p.x-tetSwipeStart.x,dy=p.y-tetSwipeStart.y;
  tetSwipeStart=null;
  if(Math.abs(dx)<12&&Math.abs(dy)<12){tetRotate();return;}
  if(Math.abs(dy)>Math.abs(dx)&&dy>20){tetHardDrop();return;}
  if(Math.abs(dx)>15){if(dx<0)tetMoveH(-1);else tetMoveH(1);}
},{passive:false});

document.addEventListener("keydown",function(e){
  if(!tetActive)return;
  if(e.key==="ArrowLeft")tetMoveH(-1);
  else if(e.key==="ArrowRight")tetMoveH(1);
  else if(e.key==="ArrowDown")tetDrop();
  else if(e.key==="ArrowUp"||e.key==="z"||e.key==="Z")tetRotate();
  else if(e.key===" ")tetHardDrop();
  else if(e.key==="Enter"&&(tetOver||tetWon))tetEndGame();
});

function racerLaneMoveBy(dir){
  racerLane=Math.max(0,Math.min(2,racerLane+dir));
  racerTargetX=racerLanes[racerLane];
}

function racerFinish(){
  racerActive=false;paused=false;
  var msg;
  if(racerLives>0){
    msg="K'Dee floors it home in the red Audi TT! "+racerScore+"m without crashing! She has arrived. Have fun, don't die!";
  } else {
    msg="K'Dee's TT is dented. Worth it. She got home eventually. "+racerScore+"m driven.";
  }
  gameOver=true;clearInterval(timerInterval);
  var d=document.getElementById("dlg");var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  setPortraitMode("excited");
  document.getElementById("dlg-name").textContent="HOME FREE!";
  typeText(document.getElementById("dlg-text"),msg);
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again3" style="border-color:#FFD700;color:#FFD700">\uD83C\uDF89 PLAY AGAIN</div>';
  document.getElementById("play-again3").addEventListener("click",function(){location.reload();});
}


function winGame(){
  gameOver=true;paused=true;clearInterval(timerInterval);
  document.getElementById("dlg-continue").style.display="none";
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  setPortraitMode("excited");
  document.getElementById("dlg-name").textContent="YOU WIN!";
  var m=Math.floor((780-timer)/60),s=(780-timer)%60;
  typeText(document.getElementById("dlg-text"),"K'Dee found all 3 keys in "+m+"m "+s+"s! She grabs her purse, does NOT kiss the kids, and sprints for the red Audi TT. She's earned this. She drives. And drives. And drives.");
  document.getElementById("dlg-choices").innerHTML=
    '<div class="dlg-ch" id="drive-home-btn" style="border-color:#e74c3c;color:#e74c3c">\uD83D\uDE97 JUST DRIVE.</div>'+
    '<div class="dlg-ch" id="play-again" style="border-color:#FFD700;color:#FFD700">\uD83C\uDF89 PLAY AGAIN</div>';
  document.getElementById("drive-home-btn").addEventListener("click",function(){
    document.getElementById("dlg").classList.remove("on");
    gameOver=false;paused=false;
    startRacer();
  });
  document.getElementById("play-again").addEventListener("click",function(){location.reload();});
}

function loseGame(){
  gameOver=true;paused=true;clearInterval(timerInterval);
  document.getElementById("dlg-continue").style.display="none";
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  setPortraitMode("hurt");
  document.getElementById("dlg-name").textContent="TIME'S UP!";
  typeText(document.getElementById("dlg-text"),"K'Dee is officially late. The kids are feral. The neighbor's cat is judging everyone through the window. "+keys+"/3 keys found. Try again?");
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again2" style="border-color:#CD5C5C;color:#CD5C5C">\u23F0 TRY AGAIN</div>';
  document.getElementById("play-again2").addEventListener("click",function(){location.reload();});
}

var timerInterval;
function startTimer(){timerInterval=setInterval(function(){if(paused||gameOver)return;timer--;updateHUD();if(timer<=0){clearInterval(timerInterval);loseGame();}},1000);}

document.getElementById("startbtn").addEventListener("click",function(){
  document.getElementById("title").style.display="none";
  document.getElementById("game").classList.add("on");
  kdeeX=180;kdeeY=520;// start center of foyer above welcome mat
  spawnParticles(curRoom);
  drawScene();updateHUD();
  initPortrait();
  startLoop();startTimer();
});

document.getElementById("qbtn").addEventListener("click",function(){
  if(confirm("Quit game?")){gameOver=true;animRunning=false;clearInterval(timerInterval);document.getElementById("game").classList.remove("on");document.getElementById("title").style.display="flex";}
});

})();
